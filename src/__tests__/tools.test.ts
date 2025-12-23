import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveStandard } from '../tools/resolve-standard.js'
import { getStandardDocs } from '../tools/get-docs.js'
import { listStandards } from '../tools/list-standards.js'
import type { StandardsManager } from '../utils/manager.js'
import type { StandardDocument, StandardMetadata, StandardsConfig } from '../types/index.js'

// 模拟数据
const mockDocuments: StandardDocument[] = [
  {
    id: 'frontend-vue-components',
    title: 'Vue 3 组件开发规范',
    description: 'Vue 3 组件的编写规范和最佳实践',
    category: 'frontend',
    subcategory: 'vue',
    tags: ['vue', 'vue3', 'component'],
    source: 'local',
    path: 'frontend/vue/components.md',
    content: '# Vue 3 组件开发规范\n\n这是组件规范内容...',
    frontmatter: {},
  },
  {
    id: 'backend-api-restful',
    title: 'RESTful API 设计规范',
    description: 'RESTful API 的设计规范和最佳实践',
    category: 'backend',
    subcategory: 'api',
    tags: ['api', 'restful', 'http'],
    source: 'local',
    path: 'backend/api/restful.md',
    content: '# RESTful API 设计规范\n\n这是 API 规范内容...',
    frontmatter: {},
  },
]

const mockConfig: StandardsConfig = {
  projectTitle: '测试项目',
  sources: [{ type: 'local', path: './standards' }],
  categories: ['frontend', 'backend', 'custom'],
  cacheTimeout: 3600,
}

// 创建模拟的 StandardsManager
const createMockManager = (): StandardsManager => {
  return {
    getAllStandards: vi.fn().mockResolvedValue(
      mockDocuments.map(({ content: _c, frontmatter: _f, ...meta }) => meta)
    ),
    getStandardById: vi.fn().mockImplementation((id: string) => {
      return Promise.resolve(mockDocuments.find((doc) => doc.id === id))
    }),
    getStandardsByCategory: vi.fn().mockImplementation((category: string) => {
      const filtered = mockDocuments
        .filter((doc) => doc.category === category)
        .map(({ content: _c, frontmatter: _f, ...meta }) => meta)
      return Promise.resolve(filtered)
    }),
    searchStandards: vi.fn().mockImplementation((query: string) => {
      const queryLower = query.toLowerCase()
      return Promise.resolve(
        mockDocuments
          .filter(
            (doc) =>
              doc.title.toLowerCase().includes(queryLower) ||
              doc.tags.some((tag) => tag.toLowerCase().includes(queryLower))
          )
          .map((doc) => ({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            category: doc.category,
            relevance: 10,
          }))
      )
    }),
    getCategories: vi.fn().mockResolvedValue(['frontend', 'backend', 'custom']),
    getConfig: vi.fn().mockReturnValue(mockConfig),
  } as unknown as StandardsManager
}

describe('resolveStandard', () => {
  let manager: StandardsManager

  beforeEach(() => {
    manager = createMockManager()
  })

  it('should return matching standards for query', async () => {
    const result = await resolveStandard(manager, 'vue')

    expect(result.results.length).toBeGreaterThan(0)
    expect(result.results[0].title).toContain('Vue')
  })

  it('should return empty results for no matches', async () => {
    vi.mocked(manager.searchStandards).mockResolvedValueOnce([])

    const result = await resolveStandard(manager, 'nonexistent')

    expect(result.results).toHaveLength(0)
    expect(result.message).toContain('未找到')
  })

  it('should return error message for empty query', async () => {
    const result = await resolveStandard(manager, '')

    expect(result.results).toHaveLength(0)
    expect(result.message).toContain('请提供搜索关键词')
  })
})

describe('getStandardDocs', () => {
  let manager: StandardsManager

  beforeEach(() => {
    manager = createMockManager()
  })

  it('should return document content for valid id', async () => {
    const result = await getStandardDocs(manager, 'frontend-vue-components')

    expect(result).toContain('Vue 3 组件开发规范')
    expect(result).toContain('分类')
  })

  it('should return error for non-existent id', async () => {
    const result = await getStandardDocs(manager, 'non-existent')

    expect(result).toContain('未找到规范文档')
  })

  it('should filter content by topic', async () => {
    const result = await getStandardDocs(manager, 'frontend-vue-components', '组件')

    expect(result).toContain('组件')
  })
})

describe('listStandards', () => {
  let manager: StandardsManager

  beforeEach(() => {
    manager = createMockManager()
  })

  it('should return all standards grouped by category', async () => {
    const result = await listStandards(manager)

    expect(result.projectTitle).toBe('测试项目')
    expect(result.totalCount).toBe(2)
    expect(result.categories.length).toBeGreaterThan(0)
  })

  it('should filter by category', async () => {
    const result = await listStandards(manager, 'frontend')

    expect(result.totalCount).toBe(1)
    expect(result.categories[0].category).toBe('frontend')
  })
})

