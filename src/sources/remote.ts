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
 * 远程 API 文档来源
 * 从远程 API 获取规范文档
 */
export class RemoteSource implements DocumentSource {
  private url: string
  private headers: Record<string, string>

  constructor(url: string, headers?: Record<string, string>) {
    this.url = url
    this.headers = headers || {}
  }

  /**
   * 从远程 API 加载文档
   */
  async load(): Promise<StandardDocument[]> {
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

