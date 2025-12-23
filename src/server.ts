import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { StandardsManager } from './utils/manager.js'
import { resolveStandard } from './tools/resolve-standard.js'
import { getStandardDocs } from './tools/get-docs.js'
import { listStandards } from './tools/list-standards.js'
import type { StandardsConfig } from './types/index.js'

/**
 * 创建并配置 MCP 服务器
 * @param config 规范配置
 */
export const createServer = async (config: StandardsConfig) => {
  // 初始化规范管理器
  const manager = new StandardsManager(config)
  await manager.initialize()

  // 创建 MCP 服务器实例
  const server = new Server(
    {
      name: 'mcp-dev-standards',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {
          listChanged: true,
        },
        resources: {
          listChanged: true,
          subscribe: false,
        },
      },
    }
  )

  // 注册工具列表处理器
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'resolve-standard-id',
          description:
            '根据关键词搜索匹配的开发规范文档。在获取具体规范内容前，必须先调用此工具获取规范 ID。',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '搜索规范的关键词或描述，例如：Vue 组件、RESTful API、命名规范',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get-standard-docs',
          description:
            '获取指定规范文档的详细内容。需要先通过 resolve-standard-id 获取规范 ID。',
          inputSchema: {
            type: 'object',
            properties: {
              standardId: {
                type: 'string',
                description: '规范文档的唯一标识符，从 resolve-standard-id 获取',
              },
              topic: {
                type: 'string',
                description: '可选的主题过滤，用于获取规范中特定部分的内容',
              },
              maxTokens: {
                type: 'number',
                description: '返回内容的最大 token 数，默认不限制',
              },
            },
            required: ['standardId'],
          },
        },
        {
          name: 'list-standards',
          description: '列出所有可用的开发规范分类和文档。可按分类过滤。',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: '按分类过滤，可选值：frontend、backend、custom',
              },
            },
            required: [],
          },
        },
      ],
    }
  })

  // 注册工具调用处理器
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      switch (name) {
        case 'resolve-standard-id': {
          const query = (args as { query: string }).query
          const results = await resolveStandard(manager, query)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          }
        }

        case 'get-standard-docs': {
          const { standardId, topic, maxTokens } = args as {
            standardId: string
            topic?: string
            maxTokens?: number
          }
          const docs = await getStandardDocs(manager, standardId, topic, maxTokens)
          return {
            content: [
              {
                type: 'text',
                text: docs,
              },
            ],
          }
        }

        case 'list-standards': {
          const category = (args as { category?: string }).category
          const standards = await listStandards(manager, category)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(standards, null, 2),
              },
            ],
          }
        }

        default:
          throw new Error(`未知工具: ${name}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      return {
        content: [
          {
            type: 'text',
            text: `错误: ${message}`,
          },
        ],
        isError: true,
      }
    }
  })

  // 注册资源列表处理器 - 将规范文档作为资源暴露
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const allStandards = await manager.getAllStandards()
    return {
      resources: allStandards.map((standard) => ({
        uri: `standard://${standard.id}`,
        name: standard.title,
        description: standard.description,
        mimeType: 'text/markdown',
      })),
    }
  })

  // 注册资源读取处理器
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri
    const match = uri.match(/^standard:\/\/(.+)$/)

    if (!match) {
      throw new Error(`无效的资源 URI: ${uri}`)
    }

    const standardId = match[1]
    const document = await manager.getStandardById(standardId)

    if (!document) {
      throw new Error(`未找到规范文档: ${standardId}`)
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: document.content,
        },
      ],
    }
  })

  return server
}

/**
 * 启动 MCP 服务器
 */
export const startServer = async (config: StandardsConfig) => {
  const server = await createServer(config)
  const transport = new StdioServerTransport()

  await server.connect(transport)

  // 优雅关闭
  process.on('SIGINT', async () => {
    await server.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await server.close()
    process.exit(0)
  })
}

