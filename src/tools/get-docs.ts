import type { StandardsManager } from '../utils/manager.js'

/**
 * 获取规范文档的详细内容
 *
 * @param manager 规范管理器
 * @param standardId 规范文档 ID
 * @param topic 可选的主题过滤
 * @param maxTokens 可选的最大 token 数限制
 * @returns 格式化的文档内容
 */
export const getStandardDocs = async (
  manager: StandardsManager,
  standardId: string,
  topic?: string,
  maxTokens?: number
): Promise<string> => {
  const document = await manager.getStandardById(standardId)

  if (!document) {
    // 尝试搜索建议
    const searchResults = await manager.searchStandards(standardId)
    if (searchResults.length > 0) {
      const suggestions = searchResults
        .slice(0, 3)
        .map((r) => `- ${r.id}: ${r.title}`)
        .join('\n')
      return `未找到规范文档: ${standardId}\n\n您可能在找:\n${suggestions}`
    }
    return `未找到规范文档: ${standardId}`
  }

  let content = document.content

  // 如果指定了主题，尝试提取相关部分
  if (topic) {
    content = extractTopicContent(content, topic)
  }

  // 如果指定了 maxTokens，进行截断
  // 简单估算：1 token ≈ 4 个字符（中英文混合）
  if (maxTokens && maxTokens > 0) {
    const maxChars = maxTokens * 4
    if (content.length > maxChars) {
      content = content.slice(0, maxChars) + '\n\n... (内容已截断)'
    }
  }

  // 构建输出
  const header = buildHeader(document)
  return `${header}\n\n${content}`
}

/**
 * 构建文档头部信息
 */
const buildHeader = (document: {
  title: string
  description?: string
  category: string
  subcategory?: string
  tags: string[]
  version?: string
  lastUpdated?: string
}): string => {
  const lines: string[] = [
    `# ${document.title}`,
    '',
  ]

  if (document.description) {
    lines.push(`> ${document.description}`)
    lines.push('')
  }

  const meta: string[] = []
  meta.push(`**分类**: ${document.category}${document.subcategory ? ` / ${document.subcategory}` : ''}`)

  if (document.tags.length > 0) {
    meta.push(`**标签**: ${document.tags.join(', ')}`)
  }

  if (document.version) {
    meta.push(`**版本**: ${document.version}`)
  }

  if (document.lastUpdated) {
    meta.push(`**更新时间**: ${document.lastUpdated}`)
  }

  lines.push(meta.join(' | '))
  lines.push('')
  lines.push('---')

  return lines.join('\n')
}

/**
 * 从内容中提取与主题相关的部分
 * 基于 Markdown 标题结构进行提取
 */
const extractTopicContent = (content: string, topic: string): string => {
  const topicLower = topic.toLowerCase()
  const lines = content.split('\n')
  const extractedSections: string[] = []
  let currentSection: string[] = []
  let currentHeading = ''
  let isRelevant = false

  for (const line of lines) {
    // 检测标题
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)

    if (headingMatch) {
      // 保存之前的相关部分
      if (isRelevant && currentSection.length > 0) {
        extractedSections.push(currentSection.join('\n'))
      }

      // 开始新的部分
      currentHeading = headingMatch[2]
      currentSection = [line]

      // 检查标题是否与主题相关
      isRelevant = currentHeading.toLowerCase().includes(topicLower)
    } else {
      currentSection.push(line)

      // 检查内容是否与主题相关（仅在当前部分不相关时）
      if (!isRelevant && line.toLowerCase().includes(topicLower)) {
        isRelevant = true
      }
    }
  }

  // 处理最后一个部分
  if (isRelevant && currentSection.length > 0) {
    extractedSections.push(currentSection.join('\n'))
  }

  if (extractedSections.length === 0) {
    return `未找到与 "${topic}" 相关的内容。\n\n以下是完整文档:\n\n${content}`
  }

  return extractedSections.join('\n\n')
}

