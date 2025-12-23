# MCP Dev Standards

一个基于 Model Context Protocol (MCP) 的开发规范服务器，为 AI 编程助手提供前后端开发规范的上下文，确保生成的代码符合团队/项目的最佳实践。

## 功能特点

- 🔧 **MCP 协议支持**: 完全兼容 MCP 协议，可与 Cursor、Claude Desktop、VS Code 等 AI 工具集成
- 📚 **多来源文档**: 支持本地文件、远程 API、Git 仓库等多种文档来源
- 🔍 **智能搜索**: 基于关键词的规范文档搜索
- 📦 **内置规范**: 包含前端（Vue、React）、后端（API、数据库）等常用开发规范
- ⚡ **缓存机制**: 内置缓存，提高响应速度
- 🎯 **可扩展**: 支持自定义规范文档和配置

## 快速开始

### 安装

```bash
# 使用 npm
npm install mcp-dev-standards

# 使用 pnpm
pnpm add mcp-dev-standards

# 使用 yarn
yarn add mcp-dev-standards
```

### 配置 Cursor

在 Cursor 的 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "dev-standards": {
      "command": "npx",
      "args": ["-y", "mcp-dev-standards"],
      "env": {
        "STANDARDS_PATH": "./standards"
      }
    }
  }
}
```

### 配置 Claude Desktop

在 Claude Desktop 配置文件中添加：

```json
{
  "mcpServers": {
    "dev-standards": {
      "command": "npx",
      "args": ["-y", "mcp-dev-standards"]
    }
  }
}
```

## 使用方式

### 可用工具

服务器提供以下 MCP 工具：

#### 1. `resolve-standard-id`

根据关键词搜索匹配的规范文档。

```
输入: { "query": "Vue 组件" }
输出: 匹配的规范文档列表
```

#### 2. `get-standard-docs`

获取指定规范文档的详细内容。

```
输入: { 
  "standardId": "frontend-vue-components",
  "topic": "命名规范",  // 可选
  "maxTokens": 2000     // 可选
}
输出: 规范文档内容
```

#### 3. `list-standards`

列出所有可用的规范分类和文档。

```
输入: { "category": "frontend" }  // 可选
输出: 规范文档列表，按分类分组
```

### 使用示例

在 AI 对话中：

```
用户: 帮我写一个 Vue3 组件

AI: [调用 resolve-standard-id, query="Vue 组件"]
    [调用 get-standard-docs, standardId="frontend-vue-components"]
    
    根据规范，我来为您创建一个符合标准的 Vue3 组件...
```

## 配置文件

在项目根目录创建 `standards.config.json`：

```json
{
  "$schema": "https://mcp-dev-standards.example.com/schema/standards.json",
  "projectTitle": "我的项目规范",
  "description": "项目开发规范文档",
  "sources": [
    {
      "type": "local",
      "path": "./standards"
    },
    {
      "type": "remote",
      "url": "https://api.example.com/standards",
      "headers": {
        "Authorization": "Bearer token"
      }
    },
    {
      "type": "git",
      "repo": "org/standards-repo",
      "branch": "main",
      "path": "docs/standards"
    }
  ],
  "categories": ["frontend", "backend", "custom"],
  "cacheTimeout": 3600,
  "rules": [
    "使用 TypeScript 进行类型安全的开发",
    "遵循团队的命名规范"
  ]
}
```

### 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| projectTitle | string | "开发规范中心" | 项目标题 |
| description | string | - | 项目描述 |
| sources | array | [{ type: "local", path: "./standards" }] | 文档来源配置 |
| categories | array | ["frontend", "backend", "custom"] | 规范分类 |
| cacheTimeout | number | 3600 | 缓存超时时间（秒） |
| rules | array | - | 全局规则提示 |

### 文档来源类型

#### 本地文件

```json
{
  "type": "local",
  "path": "./standards"
}
```

#### 远程文档

远程文档来源支持三种模式：

**模式 1：直接指向 Markdown 文件**

```json
{
  "type": "remote",
  "url": "https://example.com/docs/vue3.md",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

**模式 2：配置多个远程 Markdown 文件**

```json
{
  "type": "remote",
  "url": "https://example.com/docs",
  "headers": {
    "Authorization": "Bearer token"
  },
  "docs": [
    {
      "url": "https://example.com/docs/vue3.md",
      "category": "frontend",
      "subcategory": "vue"
    },
    {
      "url": "https://example.com/docs/react.md",
      "category": "frontend",
      "subcategory": "react"
    },
    {
      "url": "https://intranet.company.com/standards/api.md",
      "category": "backend",
      "subcategory": "api"
    }
  ]
}
```

**模式 3：JSON API 返回文档列表**

```json
{
  "type": "remote",
  "url": "https://api.example.com/standards",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

API 应返回以下格式：

```json
{
  "standards": [
    {
      "id": "vue-components",
      "title": "Vue 组件规范",
      "category": "frontend",
      "content": "# Vue 组件规范\n..."
    }
  ]
}
```

#### Git 仓库

```json
{
  "type": "git",
  "repo": "org/standards-repo",
  "branch": "main",
  "path": "docs/standards",
  "token": "github_token"  // 可选，或使用 GITHUB_TOKEN 环境变量
}
```

## 规范文档格式

规范文档使用 Markdown 格式，支持 frontmatter 元数据：

```markdown
---
title: Vue 3 组件开发规范
description: Vue 3 组件的编写规范和最佳实践
category: frontend
subcategory: vue
tags:
  - vue
  - vue3
  - component
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Vue 3 组件开发规范

正文内容...
```

### Frontmatter 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 否 | 文档标题（可从内容提取） |
| description | string | 否 | 文档描述 |
| category | string | 否 | 分类（可从路径推断） |
| subcategory | string | 否 | 子分类 |
| tags | array | 否 | 标签列表 |
| version | string | 否 | 版本号 |
| lastUpdated | string | 否 | 最后更新时间 |

## 目录结构

推荐的规范文档目录结构：

```
standards/
  frontend/
    vue/
      components.md
      composables.md
    react/
      components.md
      hooks.md
    styles/
      tailwind.md
  backend/
    api/
      restful.md
      error-handling.md
    database/
      naming.md
  custom/
    team-rules.md
```

## 内置规范

本项目包含以下内置规范文档：

### 前端

- **Vue 3 组件开发规范** - Vue 3 组件的编写标准
- **Vue 3 Composables 规范** - 组合式函数的最佳实践
- **React 组件开发规范** - React 函数组件标准
- **React Hooks 规范** - 自定义 Hooks 编写指南
- **Tailwind CSS 规范** - Tailwind CSS 使用规范

### 后端

- **RESTful API 设计规范** - API 设计最佳实践
- **API 错误处理规范** - 统一的错误处理标准
- **数据库命名规范** - 数据库对象命名标准

### 通用

- **团队开发规范** - 团队内部约定和规范

## 开发

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test
```

### 项目结构

```
src/
  index.ts              # 入口文件
  server.ts             # MCP 服务器实现
  tools/
    resolve-standard.ts # 规范搜索工具
    get-docs.ts         # 获取文档工具
    list-standards.ts   # 列出规范工具
  sources/
    local.ts            # 本地文档加载器
    remote.ts           # 远程 API 加载器
    git.ts              # Git 仓库加载器
  utils/
    parser.ts           # Markdown 解析
    cache.ts            # 缓存管理
    manager.ts          # 文档管理器
    search.ts           # 搜索工具
  types/
    index.ts            # 类型定义
standards/              # 默认规范文档
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| STANDARDS_PATH | 规范文档路径 | ./standards |
| STANDARDS_CONFIG | 配置文件路径 | standards.config.json |
| GITHUB_TOKEN | GitHub API Token（用于 Git 来源） | - |

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cursor](https://cursor.sh/)
- [Claude Desktop](https://claude.ai/)

