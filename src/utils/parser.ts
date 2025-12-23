import matter from 'gray-matter'
import type { StandardDocument, SourceType } from '../types/index.js'

/**
 * 解析 Markdown 文件内容
 * 支持 frontmatter 元数据
 *
 * @param content 原始 Markdown 内容
 * @param filePath 文件路径（用于生成 ID）
 * @param source 文档来源类型
 * @returns 解析后的文档对象
 */
export const parseMarkdown = (
  content: string,
  filePath: string,
  source: SourceType
): StandardDocument => {
  // 使用 gray-matter 解析 frontmatter
  const { data: frontmatter, content: markdownContent } = matter(content)

  // 从文件路径提取信息
  const pathInfo = extractPathInfo(filePath)

  // 生成文档 ID
  const id = frontmatter.id || generateId(filePath)

  // 提取或推断标题
  const title = frontmatter.title || extractTitle(markdownContent) || pathInfo.filename

  // 提取标签
  const tags = normalizeTags(frontmatter.tags)

  return {
    id,
    title,
    description: frontmatter.description || extractDescription(markdownContent),
    category: frontmatter.category || pathInfo.category,
    subcategory: frontmatter.subcategory || pathInfo.subcategory,
    tags,
    version: frontmatter.version,
    lastUpdated: frontmatter.lastUpdated || frontmatter.last_updated,
    source,
    path: filePath,
    content: markdownContent.trim(),
    frontmatter,
  }
}

/**
 * 从文件路径提取分类信息
 */
const extractPathInfo = (
  filePath: string
): {
  category: string
  subcategory?: string
  filename: string
} => {
  // 规范化路径分隔符
  const normalizedPath = filePath.replace(/\\/g, '/')

  // 移除开头的 ./ 或 /
  const cleanPath = normalizedPath.replace(/^\.?\//, '')

  // 分割路径
  const parts = cleanPath.split('/')

  // 移除 standards/ 前缀（如果有）
  if (parts[0] === 'standards') {
    parts.shift()
  }

  // 获取文件名（不含扩展名）
  const filename = parts[parts.length - 1]?.replace(/\.md$/i, '') || 'unknown'

  // 提取分类和子分类
  const category = parts[0] || 'custom'
  const subcategory = parts.length > 2 ? parts[1] : undefined

  return { category, subcategory, filename }
}

/**
 * 生成文档 ID
 * 基于文件路径生成唯一标识符
 */
const generateId = (filePath: string): string => {
  const normalizedPath = filePath.replace(/\\/g, '/')
  const cleanPath = normalizedPath
    .replace(/^\.?\//, '')
    .replace(/^standards\//, '')
    .replace(/\.md$/i, '')

  // 将路径转换为 ID 格式（使用连字符）
  return cleanPath.replace(/\//g, '-').toLowerCase()
}

/**
 * 从 Markdown 内容中提取第一个标题作为文档标题
 */
const extractTitle = (content: string): string | undefined => {
  // 匹配第一个 # 标题
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim()
}

/**
 * 从 Markdown 内容中提取描述
 * 取第一个非标题、非空的段落
 */
const extractDescription = (content: string): string | undefined => {
  const lines = content.split('\n')
  let foundTitle = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    // 跳过空行
    if (!trimmedLine) continue

    // 跳过标题行
    if (trimmedLine.startsWith('#')) {
      foundTitle = true
      continue
    }

    // 跳过代码块开始
    if (trimmedLine.startsWith('```')) continue

    // 跳过列表项
    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) continue

    // 找到第一个普通段落
    if (foundTitle || !content.trim().startsWith('#')) {
      // 截断过长的描述
      const maxLength = 200
      if (trimmedLine.length > maxLength) {
        return trimmedLine.slice(0, maxLength) + '...'
      }
      return trimmedLine
    }
  }

  return undefined
}

/**
 * 规范化标签数组
 */
const normalizeTags = (tags: unknown): string[] => {
  if (!tags) return []

  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }

  return []
}

/**
 * 验证 Markdown 内容是否有效
 */
export const isValidMarkdown = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false
  if (content.trim().length === 0) return false
  return true
}

