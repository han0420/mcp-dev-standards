import { z } from 'zod'

// 文档来源类型
export const SourceTypeSchema = z.enum(['local', 'remote', 'git'])
export type SourceType = z.infer<typeof SourceTypeSchema>

// 本地文档来源配置
export const LocalSourceSchema = z.object({
  type: z.literal('local'),
  path: z.string(),
})

// 远程文档配置
export const RemoteDocSchema = z.object({
  url: z.string().url(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
})
export type RemoteDoc = z.infer<typeof RemoteDocSchema>

// 远程 API 来源配置
// 支持三种模式：
// 1. url 指向 JSON API，返回文档列表
// 2. url 直接指向 .md 文件
// 3. docs 数组配置多个远程 Markdown 文件
export const RemoteSourceSchema = z.object({
  type: z.literal('remote'),
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
  docs: z.array(RemoteDocSchema).optional(), // 多个远程 Markdown 文件
})

// Git 仓库来源配置
export const GitSourceSchema = z.object({
  type: z.literal('git'),
  repo: z.string(),
  branch: z.string().default('main'),
  path: z.string().optional(),
  token: z.string().optional(),
})

// 文档来源联合类型
export const SourceConfigSchema = z.discriminatedUnion('type', [
  LocalSourceSchema,
  RemoteSourceSchema,
  GitSourceSchema,
])
export type SourceConfig = z.infer<typeof SourceConfigSchema>

// 主配置文件 schema
export const StandardsConfigSchema = z.object({
  $schema: z.string().optional(),
  projectTitle: z.string().default('开发规范中心'),
  description: z.string().optional(),
  sources: z.array(SourceConfigSchema).default([{ type: 'local', path: './standards' }]),
  categories: z.array(z.string()).default(['frontend', 'backend', 'custom']),
  cacheTimeout: z.number().default(3600), // 缓存超时时间（秒）
  rules: z.array(z.string()).optional(), // 全局规则
})
export type StandardsConfig = z.infer<typeof StandardsConfigSchema>

// 规范文档元数据
export const StandardMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).default([]),
  version: z.string().optional(),
  lastUpdated: z.string().optional(),
  source: SourceTypeSchema,
  path: z.string(),
})
export type StandardMetadata = z.infer<typeof StandardMetadataSchema>

// 规范文档完整内容
export type StandardDocument = StandardMetadata & {
  content: string
  frontmatter: Record<string, unknown>
}

// 搜索结果
export type SearchResult = {
  id: string
  title: string
  description?: string
  category: string
  relevance: number
}

// 缓存条目
export type CacheEntry<T> = {
  data: T
  timestamp: number
  expiresAt: number
}

// MCP 工具参数类型
export const ResolveStandardParamsSchema = z.object({
  query: z.string().describe('搜索规范的关键词或描述'),
})
export type ResolveStandardParams = z.infer<typeof ResolveStandardParamsSchema>

export const GetStandardDocsParamsSchema = z.object({
  standardId: z.string().describe('规范文档的唯一标识符'),
  topic: z.string().optional().describe('可选的主题过滤'),
  maxTokens: z.number().optional().describe('返回内容的最大 token 数'),
})
export type GetStandardDocsParams = z.infer<typeof GetStandardDocsParamsSchema>

export const ListStandardsParamsSchema = z.object({
  category: z.string().optional().describe('按分类过滤，如 frontend、backend、custom'),
})
export type ListStandardsParams = z.infer<typeof ListStandardsParamsSchema>

