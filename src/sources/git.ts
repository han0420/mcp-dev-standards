import type { DocumentSource } from '../utils/manager.js'
import type { StandardDocument } from '../types/index.js'
import { parseMarkdown, isValidMarkdown } from '../utils/parser.js'

/**
 * GitHub API 响应类型
 */
type GitHubTreeResponse = {
  tree: GitHubTreeItem[]
}

type GitHubTreeItem = {
  path: string
  type: 'blob' | 'tree'
  url: string
}

type GitHubBlobResponse = {
  content: string
  encoding: string
}

/**
 * Git 仓库文档来源
 * 从 GitHub 仓库获取规范文档
 */
export class GitSource implements DocumentSource {
  private repo: string
  private branch: string
  private path: string
  private token?: string
  private baseUrl = 'https://api.github.com'

  constructor(repo: string, branch = 'main', path = '', token?: string) {
    this.repo = repo
    this.branch = branch
    this.path = path
    this.token = token || process.env.GITHUB_TOKEN
  }

  /**
   * 从 Git 仓库加载文档
   */
  async load(): Promise<StandardDocument[]> {
    try {
      // 获取仓库文件树
      const treeUrl = `${this.baseUrl}/repos/${this.repo}/git/trees/${this.branch}?recursive=1`
      const treeResponse = await this.fetchWithAuth(treeUrl)

      if (!treeResponse.ok) {
        throw new Error(`获取仓库文件树失败: ${treeResponse.status}`)
      }

      const treeData = (await treeResponse.json()) as GitHubTreeResponse

      // 过滤出 Markdown 文件
      const markdownFiles = treeData.tree.filter(
        (item) =>
          item.type === 'blob' &&
          this.isMarkdownFile(item.path) &&
          this.isInPath(item.path)
      )

      // 并发加载文件内容
      const documents = await Promise.all(
        markdownFiles.map((file) => this.loadFile(file))
      )

      return documents.filter((doc): doc is StandardDocument => doc !== null)
    } catch (error) {
      console.error(`从 Git 仓库加载文档失败: ${this.repo}`, error)
      return []
    }
  }

  /**
   * 加载单个文件
   */
  private async loadFile(file: GitHubTreeItem): Promise<StandardDocument | null> {
    try {
      const response = await this.fetchWithAuth(file.url)

      if (!response.ok) {
        return null
      }

      const blobData = (await response.json()) as GitHubBlobResponse

      // GitHub API 返回 base64 编码的内容
      const content =
        blobData.encoding === 'base64'
          ? Buffer.from(blobData.content, 'base64').toString('utf-8')
          : blobData.content

      if (!isValidMarkdown(content)) {
        return null
      }

      // 计算相对路径
      let relativePath = file.path
      if (this.path && relativePath.startsWith(this.path)) {
        relativePath = relativePath.slice(this.path.length).replace(/^\//, '')
      }

      return parseMarkdown(content, relativePath, 'git')
    } catch (error) {
      console.error(`加载 Git 文件失败: ${file.path}`, error)
      return null
    }
  }

  /**
   * 带认证的 fetch 请求
   */
  private async fetchWithAuth(url: string): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return fetch(url, { headers })
  }

  /**
   * 检查文件是否在指定路径下
   */
  private isInPath(filePath: string): boolean {
    if (!this.path) return true
    return filePath.startsWith(this.path)
  }

  /**
   * 检查是否为 Markdown 文件
   */
  private isMarkdownFile(filePath: string): boolean {
    const lowerPath = filePath.toLowerCase()
    return lowerPath.endsWith('.md') || lowerPath.endsWith('.markdown')
  }
}

