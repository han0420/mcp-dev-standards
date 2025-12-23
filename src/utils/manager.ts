import type {
  StandardsConfig,
  StandardDocument,
  StandardMetadata,
  SearchResult,
} from '../types/index.js'
import { LocalSource } from '../sources/local.js'
import { RemoteSource } from '../sources/remote.js'
import { GitSource } from '../sources/git.js'
import { Cache } from './cache.js'

// 文档来源接口
export interface DocumentSource {
  load(): Promise<StandardDocument[]>
}

/**
 * 规范文档管理器
 * 负责加载、缓存和检索规范文档
 */
export class StandardsManager {
  private config: StandardsConfig
  private cache: Cache<StandardDocument[]>
  private documents: StandardDocument[] = []
  private sources: DocumentSource[] = []
  private initialized = false

  constructor(config: StandardsConfig) {
    this.config = config
    this.cache = new Cache<StandardDocument[]>(config.cacheTimeout * 1000)
  }

  /**
   * 初始化管理器，加载所有文档来源
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    // 根据配置创建文档来源
    for (const sourceConfig of this.config.sources) {
      switch (sourceConfig.type) {
        case 'local':
          this.sources.push(new LocalSource(sourceConfig.path))
          break
        case 'remote':
          this.sources.push(new RemoteSource(sourceConfig.url, sourceConfig.headers, sourceConfig.docs))
          break
        case 'git':
          this.sources.push(
            new GitSource(sourceConfig.repo, sourceConfig.branch, sourceConfig.path, sourceConfig.token)
          )
          break
      }
    }

    // 加载所有文档
    await this.loadDocuments()
    this.initialized = true
  }

  /**
   * 从所有来源加载文档
   */
  private async loadDocuments(): Promise<void> {
    const cachedDocs = this.cache.get('all-documents')
    if (cachedDocs) {
      this.documents = cachedDocs
      return
    }

    const allDocs: StandardDocument[] = []

    for (const source of this.sources) {
      try {
        const docs = await source.load()
        allDocs.push(...docs)
      } catch (error) {
        console.error(`加载文档来源失败:`, error)
      }
    }

    this.documents = allDocs
    this.cache.set('all-documents', allDocs)
  }

  /**
   * 刷新文档缓存
   */
  async refresh(): Promise<void> {
    this.cache.clear()
    await this.loadDocuments()
  }

  /**
   * 获取所有规范文档元数据
   */
  async getAllStandards(): Promise<StandardMetadata[]> {
    return this.documents.map(({ content: _content, frontmatter: _frontmatter, ...metadata }) => metadata)
  }

  /**
   * 根据 ID 获取规范文档
   */
  async getStandardById(id: string): Promise<StandardDocument | undefined> {
    return this.documents.find((doc) => doc.id === id)
  }

  /**
   * 按分类获取规范文档
   */
  async getStandardsByCategory(category: string): Promise<StandardMetadata[]> {
    return this.documents
      .filter((doc) => doc.category === category)
      .map(({ content: _content, frontmatter: _frontmatter, ...metadata }) => metadata)
  }

  /**
   * 搜索规范文档
   * 使用简单的关键词匹配算法
   */
  async searchStandards(query: string): Promise<SearchResult[]> {
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter(Boolean)

    const results: SearchResult[] = []

    for (const doc of this.documents) {
      let relevance = 0

      // 标题匹配权重最高
      const titleLower = doc.title.toLowerCase()
      for (const word of queryWords) {
        if (titleLower.includes(word)) {
          relevance += 10
        }
      }

      // 描述匹配
      if (doc.description) {
        const descLower = doc.description.toLowerCase()
        for (const word of queryWords) {
          if (descLower.includes(word)) {
            relevance += 5
          }
        }
      }

      // 标签匹配
      for (const tag of doc.tags) {
        const tagLower = tag.toLowerCase()
        for (const word of queryWords) {
          if (tagLower.includes(word)) {
            relevance += 7
          }
        }
      }

      // 分类匹配
      const categoryLower = doc.category.toLowerCase()
      for (const word of queryWords) {
        if (categoryLower.includes(word)) {
          relevance += 3
        }
      }

      // 内容匹配（权重较低）
      const contentLower = doc.content.toLowerCase()
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          relevance += 1
        }
      }

      if (relevance > 0) {
        results.push({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          category: doc.category,
          relevance,
        })
      }
    }

    // 按相关性排序
    return results.sort((a, b) => b.relevance - a.relevance)
  }

  /**
   * 获取所有分类
   */
  async getCategories(): Promise<string[]> {
    const categories = new Set<string>()
    for (const doc of this.documents) {
      categories.add(doc.category)
    }
    return Array.from(categories)
  }

  /**
   * 获取配置
   */
  getConfig(): StandardsConfig {
    return this.config
  }
}

