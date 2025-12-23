import type { StandardsManager } from '../utils/manager.js'
import type { SearchResult } from '../types/index.js'

/**
 * 搜索匹配的规范文档
 * 根据用户查询返回相关的规范文档列表
 *
 * @param manager 规范管理器
 * @param query 搜索查询
 * @returns 搜索结果列表
 */
export const resolveStandard = async (
  manager: StandardsManager,
  query: string
): Promise<{
  message: string
  results: SearchResult[]
  totalCount: number
}> => {
  if (!query || query.trim().length === 0) {
    return {
      message: '请提供搜索关键词',
      results: [],
      totalCount: 0,
    }
  }

  const results = await manager.searchStandards(query.trim())

  if (results.length === 0) {
    // 返回所有可用的分类作为建议
    const categories = await manager.getCategories()
    return {
      message: `未找到与 "${query}" 相关的规范文档。可用的分类: ${categories.join(', ')}`,
      results: [],
      totalCount: 0,
    }
  }

  // 限制返回数量，避免结果过多
  const topResults = results.slice(0, 10)

  return {
    message: `找到 ${results.length} 个相关规范文档`,
    results: topResults.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      relevance: r.relevance,
    })),
    totalCount: results.length,
  }
}

