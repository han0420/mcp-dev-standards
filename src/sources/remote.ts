import type { DocumentSource } from '../utils/manager.js'
import type { StandardDocument } from '../types/index.js'
import { parseMarkdown, isValidMarkdown } from '../utils/parser.js'

/**
 * 远程 API 响应类型
 */
type RemoteStandardsResponse = {
  standards?: RemoteStandard[]
  data?: RemoteStandard[]
}

type RemoteStandard = {
  id: string
  title: string
  description?: string
  category: string
  subcategory?: string
  tags?: string[]
  content: string
  version?: string
  lastUpdated?: string
}

/**
 * 远程文档配置类型
 */
type RemoteDocConfig = {
  url: string
  category?: string
  subcategory?: string
}

/**
 * 远程 API 文档来源
 * 支持两种模式：
 * 1. JSON API 模式：从 API 获取文档列表
 * 2. Markdown 文件模式：直接获取远程 Markdown 文件
 */
export class RemoteSource implements DocumentSource {
  private url: string
  private headers: Record<string, string>
  private docs: RemoteDocConfig[]

  constructor(url: string, headers?: Record<string, string>, docs?: RemoteDocConfig[]) {
    this.url = url
    this.headers = headers || {}
    this.docs = docs || []
  }

  /**
   * 从远程加载文档
   */
  async load(): Promise<StandardDocument[]> {
    const documents: StandardDocument[] = []

    // 模式 1：如果配置了 docs 数组，直接获取 Markdown 文件
    if (this.docs.length > 0) {
      for (const doc of this.docs) {
        const loadedDoc = await this.loadMarkdownFile(doc)
        if (loadedDoc) {
          documents.push(loadedDoc)
        }
      }
      return documents
    }

    // 模式 2：检查 URL 是否直接指向 Markdown 文件
    if (this.isMarkdownUrl(this.url)) {
      const doc = await this.loadMarkdownFile({ url: this.url })
      if (doc) {
        documents.push(doc)
      }
      return documents
    }

    // 模式 3：从 JSON API 加载文档列表
    return this.loadFromApi()
  }

  /**
   * 检查 URL 是否指向 Markdown 文件
   */
  private isMarkdownUrl(url: string): boolean {
    const lowerUrl = url.toLowerCase()
    return lowerUrl.endsWith('.md') || lowerUrl.endsWith('.markdown')
  }

  /**
   * 直接加载远程 Markdown 文件
   */
  private async loadMarkdownFile(config: RemoteDocConfig): Promise<StandardDocument | null> {
    try {
      console.error(`正在加载远程文档: ${config.url}`)
      
      const response = await fetch(config.url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, text/markdown, */*',
          ...this.headers,
        },
      })

      if (!response.ok) {
        console.error(`加载远程文档失败: ${config.url}, HTTP ${response.status}`)
        return null
      }

      const content = await response.text()

      if (!isValidMarkdown(content)) {
        console.error(`远程文档内容无效: ${config.url}`)
        return null
      }

      // 从 URL 提取文件名作为路径
      const urlPath = new URL(config.url).pathname
      const fileName = urlPath.split('/').pop() || 'remote.md'
      
      // 构建相对路径，用于生成 ID 和分类
      const category = config.category || 'custom'
      const subcategory = config.subcategory || ''
      const relativePath = subcategory 
        ? `${category}/${subcategory}/${fileName}`
        : `${category}/${fileName}`

      const doc = parseMarkdown(content, relativePath, 'remote')
      
      // 覆盖路径为远程 URL
      doc.path = config.url
      
      console.error(`成功加载远程文档: ${doc.title} (${doc.id})`)
      
      return doc
    } catch (error) {
      console.error(`加载远程 Markdown 文件失败: ${config.url}`, error)
      return null
    }
  }

  /**
   * 从 JSON API 加载文档
   */
  private async loadFromApi(): Promise<StandardDocument[]> {
    try {
      const response = await fetch(this.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = (await response.json()) as RemoteStandardsResponse

      // 支持多种响应格式
      const standards = data.standards || data.data || []

      return this.transformStandards(standards)
    } catch (error) {
      console.error(`从远程 API 加载文档失败: ${this.url}`, error)
      return []
    }
  }

  /**
   * 将远程数据转换为标准文档格式
   */
  private transformStandards(standards: RemoteStandard[]): StandardDocument[] {
    const documents: StandardDocument[] = []

    for (const standard of standards) {
      if (!standard.content || !isValidMarkdown(standard.content)) {
        continue
      }

      // 如果内容包含 frontmatter，使用解析器
      if (standard.content.startsWith('---')) {
        const doc = parseMarkdown(
          standard.content,
          `${standard.category}/${standard.id}.md`,
          'remote'
        )
        documents.push(doc)
      } else {
        // 直接使用 API 返回的元数据
        documents.push({
          id: standard.id,
          title: standard.title,
          description: standard.description,
          category: standard.category,
          subcategory: standard.subcategory,
          tags: standard.tags || [],
          version: standard.version,
          lastUpdated: standard.lastUpdated,
          source: 'remote',
          path: `${this.url}/${standard.id}`,
          content: standard.content,
          frontmatter: {},
        })
      }
    }

    return documents
  }
}

