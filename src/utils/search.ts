/**
 * 文档搜索工具
 * 提供简单的关键词匹配搜索功能
 */

/**
 * 计算两个字符串的相似度（基于 Jaccard 系数）
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1.toLowerCase().split(/\s+/))
  const set2 = new Set(str2.toLowerCase().split(/\s+/))

  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * 高亮匹配的关键词
 */
export const highlightMatches = (
  text: string,
  keywords: string[],
  wrapper = '**'
): string => {
  let result = text

  for (const keyword of keywords) {
    const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi')
    result = result.replace(regex, `${wrapper}$1${wrapper}`)
  }

  return result
}

/**
 * 转义正则表达式特殊字符
 */
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 提取文本摘要
 * 返回包含关键词的上下文片段
 */
export const extractSnippet = (
  content: string,
  keywords: string[],
  maxLength = 200
): string => {
  const contentLower = content.toLowerCase()

  // 找到第一个匹配的关键词位置
  let firstMatchIndex = -1
  for (const keyword of keywords) {
    const index = contentLower.indexOf(keyword.toLowerCase())
    if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
      firstMatchIndex = index
    }
  }

  if (firstMatchIndex === -1) {
    // 没有匹配，返回开头部分
    return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '')
  }

  // 计算摘要的起始位置
  const start = Math.max(0, firstMatchIndex - Math.floor(maxLength / 3))
  const end = Math.min(content.length, start + maxLength)

  let snippet = content.slice(start, end)

  // 添加省略号
  if (start > 0) {
    snippet = '...' + snippet
  }
  if (end < content.length) {
    snippet = snippet + '...'
  }

  return snippet
}

/**
 * 分词函数（简单实现）
 * 支持中英文混合
 */
export const tokenize = (text: string): string[] => {
  // 移除标点符号，按空格和中文字符分割
  const cleaned = text.replace(/[^\w\u4e00-\u9fa5\s]/g, ' ')

  // 分割英文单词和中文字符
  const tokens: string[] = []
  let currentWord = ''

  for (const char of cleaned) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      // 中文字符
      if (currentWord) {
        tokens.push(currentWord.toLowerCase())
        currentWord = ''
      }
      tokens.push(char)
    } else if (/\s/.test(char)) {
      // 空白字符
      if (currentWord) {
        tokens.push(currentWord.toLowerCase())
        currentWord = ''
      }
    } else {
      // 英文字符
      currentWord += char
    }
  }

  if (currentWord) {
    tokens.push(currentWord.toLowerCase())
  }

  return tokens.filter((t) => t.length > 0)
}

