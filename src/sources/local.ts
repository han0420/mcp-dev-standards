import { readdir, readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { existsSync } from 'node:fs'
import type { DocumentSource } from '../utils/manager.js'
import type { StandardDocument } from '../types/index.js'
import { parseMarkdown, isValidMarkdown } from '../utils/parser.js'

/**
 * 本地文件系统文档来源
 * 递归读取指定目录下的所有 Markdown 文件
 */
export class LocalSource implements DocumentSource {
  private basePath: string

  constructor(basePath: string) {
    this.basePath = basePath
  }

  /**
   * 加载所有本地 Markdown 文档
   */
  async load(): Promise<StandardDocument[]> {
    // 检查目录是否存在
    if (!existsSync(this.basePath)) {
      console.warn(`本地文档目录不存在: ${this.basePath}`)
      return []
    }

    const documents: StandardDocument[] = []
    await this.scanDirectory(this.basePath, documents)
    return documents
  }

  /**
   * 递归扫描目录
   */
  private async scanDirectory(
    dirPath: string,
    documents: StandardDocument[]
  ): Promise<void> {
    try {
      const entries = await readdir(dirPath)

      for (const entry of entries) {
        const fullPath = join(dirPath, entry)
        const entryStat = await stat(fullPath)

        if (entryStat.isDirectory()) {
          // 跳过隐藏目录和 node_modules
          if (entry.startsWith('.') || entry === 'node_modules') {
            continue
          }
          await this.scanDirectory(fullPath, documents)
        } else if (entryStat.isFile() && this.isMarkdownFile(entry)) {
          const doc = await this.loadFile(fullPath)
          if (doc) {
            documents.push(doc)
          }
        }
      }
    } catch (error) {
      console.error(`扫描目录失败: ${dirPath}`, error)
    }
  }

  /**
   * 加载单个 Markdown 文件
   */
  private async loadFile(filePath: string): Promise<StandardDocument | null> {
    try {
      const content = await readFile(filePath, 'utf-8')

      if (!isValidMarkdown(content)) {
        return null
      }

      // 计算相对路径（用于生成 ID 和分类）
      const relativePath = filePath.replace(this.basePath, '').replace(/^\//, '')

      return parseMarkdown(content, relativePath, 'local')
    } catch (error) {
      console.error(`读取文件失败: ${filePath}`, error)
      return null
    }
  }

  /**
   * 检查是否为 Markdown 文件
   */
  private isMarkdownFile(filename: string): boolean {
    const ext = extname(filename).toLowerCase()
    return ext === '.md' || ext === '.markdown'
  }
}

