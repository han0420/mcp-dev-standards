#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startServer } from './server.js'
import { StandardsConfigSchema, type StandardsConfig } from './types/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 获取包安装目录下的 standards 路径
 */
const getPackageStandardsPath = (): string => {
  return resolve(__dirname, '..', 'standards')
}

/**
 * 解析 source 路径，将相对路径转换为绝对路径
 */
const resolveSourcePath = (sourcePath: string, configDir: string): string => {
  // 如果是绝对路径，直接返回
  if (sourcePath.startsWith('/')) {
    return sourcePath
  }
  
  // 如果是 ./standards 且在包目录下存在，优先使用包目录
  if (sourcePath === './standards' || sourcePath === 'standards') {
    const packageStandardsPath = getPackageStandardsPath()
    if (existsSync(packageStandardsPath)) {
      return packageStandardsPath
    }
  }
  
  // 否则相对于配置文件目录解析
  return resolve(configDir, sourcePath)
}

/**
 * 加载配置文件
 */
const loadConfig = async (): Promise<StandardsConfig> => {
  // 尝试从环境变量获取配置路径
  const configPath = process.env.STANDARDS_CONFIG || 'standards.config.json'

  // 获取包内置的 standards 路径
  const packageStandardsPath = getPackageStandardsPath()

  // 默认配置 - 使用包内置的 standards 目录
  let config: Partial<StandardsConfig> = {
    projectTitle: '开发规范中心',
    sources: [{ type: 'local', path: packageStandardsPath }],
    categories: ['frontend', 'backend', 'custom'],
    cacheTimeout: 3600,
  }

  let configDir = process.cwd()

  // 尝试加载配置文件
  const possiblePaths = [
    resolve(process.cwd(), configPath),
    resolve(process.cwd(), 'standards.config.json'),
    resolve(__dirname, '..', 'standards.config.json'),
  ]

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      try {
        const fileContent = await readFile(path, 'utf-8')
        const fileConfig = JSON.parse(fileContent)
        configDir = dirname(path)
        
        // 处理 sources 中的路径
        if (fileConfig.sources) {
          fileConfig.sources = fileConfig.sources.map((source: { type: string; path?: string }) => {
            if (source.type === 'local' && source.path) {
              return { ...source, path: resolveSourcePath(source.path, configDir) }
            }
            return source
          })
        }
        
        config = { ...config, ...fileConfig }
        console.error(`已加载配置文件: ${path}`)
        break
      } catch (error) {
        console.error(`解析配置文件失败: ${path}`, error)
      }
    }
  }

  // 验证配置
  const result = StandardsConfigSchema.safeParse(config)

  if (!result.success) {
    console.error('配置验证失败:', result.error.format())
    // 使用默认配置
    return StandardsConfigSchema.parse({})
  }

  return result.data
}

/**
 * 主入口函数
 */
const main = async () => {
  try {
    console.error('MCP Dev Standards Server 启动中...')

    const config = await loadConfig()

    console.error(`项目: ${config.projectTitle}`)
    console.error(`文档来源: ${config.sources.length} 个`)
    console.error(`分类: ${config.categories.join(', ')}`)

    await startServer(config)

    console.error('服务器已启动，等待连接...')
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

main()

