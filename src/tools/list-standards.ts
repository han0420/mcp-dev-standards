import type { StandardsManager } from '../utils/manager.js'
import type { StandardMetadata } from '../types/index.js'

/**
 * 列出所有可用的规范文档
 *
 * @param manager 规范管理器
 * @param category 可选的分类过滤
 * @returns 规范文档列表，按分类分组
 */
export const listStandards = async (
  manager: StandardsManager,
  category?: string
): Promise<{
  projectTitle: string
  totalCount: number
  categories: CategoryGroup[]
}> => {
  const config = manager.getConfig()
  let standards: StandardMetadata[]

  if (category) {
    standards = await manager.getStandardsByCategory(category)
  } else {
    standards = await manager.getAllStandards()
  }

  // 按分类分组
  const groupedByCategory = groupByCategory(standards)

  return {
    projectTitle: config.projectTitle,
    totalCount: standards.length,
    categories: groupedByCategory,
  }
}

type CategoryGroup = {
  category: string
  count: number
  standards: StandardSummary[]
}

type StandardSummary = {
  id: string
  title: string
  description?: string
  subcategory?: string
  tags: string[]
}

/**
 * 按分类对规范进行分组
 */
const groupByCategory = (standards: StandardMetadata[]): CategoryGroup[] => {
  const groups = new Map<string, StandardSummary[]>()

  for (const standard of standards) {
    const category = standard.category

    if (!groups.has(category)) {
      groups.set(category, [])
    }

    groups.get(category)!.push({
      id: standard.id,
      title: standard.title,
      description: standard.description,
      subcategory: standard.subcategory,
      tags: standard.tags,
    })
  }

  // 转换为数组并排序
  const result: CategoryGroup[] = []

  for (const [category, items] of groups.entries()) {
    result.push({
      category,
      count: items.length,
      standards: items.sort((a, b) => a.title.localeCompare(b.title)),
    })
  }

  // 按分类名排序，frontend 优先
  return result.sort((a, b) => {
    const order = ['frontend', 'backend', 'custom']
    const aIndex = order.indexOf(a.category)
    const bIndex = order.indexOf(b.category)

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.category.localeCompare(b.category)
  })
}

