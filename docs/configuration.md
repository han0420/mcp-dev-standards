# 配置指南

本文档详细介绍 MCP Dev Standards 的配置选项。

## 配置文件

### 配置文件位置

服务器按以下顺序查找配置文件：

1. `STANDARDS_CONFIG` 环境变量指定的路径
2. 当前工作目录下的 `standards.config.json`
3. 包安装目录下的 `standards.config.json`

### 完整配置示例

```json
{
  "$schema": "https://mcp-dev-standards.example.com/schema/standards.json",
  "projectTitle": "我的项目规范",
  "description": "项目开发规范文档集合",
  "sources": [
    {
      "type": "local",
      "path": "./standards"
    },
    {
      "type": "remote",
      "url": "https://api.example.com/standards",
      "headers": {
        "Authorization": "Bearer your-token"
      }
    },
    {
      "type": "git",
      "repo": "org/standards-repo",
      "branch": "main",
      "path": "docs/standards",
      "token": "ghp_xxxx"
    }
  ],
  "categories": ["frontend", "backend", "custom", "devops"],
  "cacheTimeout": 3600,
  "rules": [
    "使用 TypeScript 进行类型安全的开发",
    "遵循团队的命名规范",
    "编写清晰的注释和文档"
  ]
}
```

## 配置项详解

### projectTitle

项目标题，显示在规范列表中。

```json
{
  "projectTitle": "前端开发规范中心"
}
```

### description

项目描述，可选。

```json
{
  "description": "包含 Vue、React、API 等开发规范"
}
```

### sources

文档来源配置数组，支持多个来源。

#### 本地文件来源

```json
{
  "type": "local",
  "path": "./standards"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | "local" | 是 | 来源类型 |
| path | string | 是 | 文档目录路径，相对于配置文件或绝对路径 |

#### 远程 API 来源

```json
{
  "type": "remote",
  "url": "https://api.example.com/standards",
  "headers": {
    "Authorization": "Bearer token",
    "X-Custom-Header": "value"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | "remote" | 是 | 来源类型 |
| url | string | 是 | API 端点 URL |
| headers | object | 否 | 请求头 |

**API 响应格式要求**:

```json
{
  "standards": [
    {
      "id": "unique-id",
      "title": "规范标题",
      "description": "规范描述",
      "category": "frontend",
      "content": "# Markdown 内容..."
    }
  ]
}
```

或：

```json
{
  "data": [...]
}
```

#### Git 仓库来源

```json
{
  "type": "git",
  "repo": "org/repo-name",
  "branch": "main",
  "path": "docs/standards",
  "token": "ghp_xxxx"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | "git" | 是 | 来源类型 |
| repo | string | 是 | GitHub 仓库，格式：`owner/repo` |
| branch | string | 否 | 分支名，默认 `main` |
| path | string | 否 | 仓库内的文档路径 |
| token | string | 否 | GitHub Token，也可使用环境变量 `GITHUB_TOKEN` |

### categories

规范分类列表，用于组织和过滤规范。

```json
{
  "categories": ["frontend", "backend", "custom", "devops", "security"]
}
```

默认值：`["frontend", "backend", "custom"]`

### cacheTimeout

缓存超时时间，单位：秒。

```json
{
  "cacheTimeout": 3600
}
```

默认值：`3600`（1小时）

设置为 `0` 禁用缓存（不推荐）。

### rules

全局规则提示，会在相关场景下提供给 AI。

```json
{
  "rules": [
    "使用 TypeScript 进行类型安全的开发",
    "所有 API 必须有错误处理",
    "组件必须有 Props 类型定义"
  ]
}
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `STANDARDS_PATH` | 规范文档目录 | `./standards` |
| `STANDARDS_CONFIG` | 配置文件路径 | `standards.config.json` |
| `GITHUB_TOKEN` | GitHub API Token | - |

### 在 MCP 配置中设置

```json
{
  "mcpServers": {
    "dev-standards": {
      "command": "npx",
      "args": ["-y", "mcp-dev-standards"],
      "env": {
        "STANDARDS_PATH": "/absolute/path/to/standards",
        "STANDARDS_CONFIG": "/absolute/path/to/config.json",
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

## 多来源配置示例

### 场景：本地 + 公司内部 API

```json
{
  "projectTitle": "公司开发规范",
  "sources": [
    {
      "type": "local",
      "path": "./project-standards"
    },
    {
      "type": "remote",
      "url": "https://internal-api.company.com/standards",
      "headers": {
        "X-API-Key": "internal-key"
      }
    }
  ]
}
```

### 场景：多个 Git 仓库

```json
{
  "projectTitle": "团队规范集合",
  "sources": [
    {
      "type": "git",
      "repo": "company/frontend-standards",
      "branch": "main"
    },
    {
      "type": "git",
      "repo": "company/backend-standards",
      "branch": "main"
    },
    {
      "type": "git",
      "repo": "company/devops-standards",
      "branch": "main",
      "path": "docs"
    }
  ]
}
```

### 场景：开发/生产环境分离

开发环境 (`standards.dev.json`)：

```json
{
  "projectTitle": "开发环境规范",
  "sources": [
    { "type": "local", "path": "./standards" }
  ],
  "cacheTimeout": 60
}
```

生产环境 (`standards.prod.json`)：

```json
{
  "projectTitle": "生产环境规范",
  "sources": [
    {
      "type": "git",
      "repo": "company/standards",
      "branch": "release"
    }
  ],
  "cacheTimeout": 3600
}
```

使用环境变量切换：

```bash
STANDARDS_CONFIG=standards.prod.json npx mcp-dev-standards
```

## 配置验证

服务器启动时会验证配置，无效配置会使用默认值并输出警告。

### 常见配置错误

1. **无效的来源类型**

```json
// ❌ 错误
{ "type": "invalid" }

// ✅ 正确
{ "type": "local" }
```

2. **缺少必填字段**

```json
// ❌ 错误：缺少 path
{ "type": "local" }

// ✅ 正确
{ "type": "local", "path": "./standards" }
```

3. **无效的 URL**

```json
// ❌ 错误
{ "type": "remote", "url": "not-a-url" }

// ✅ 正确
{ "type": "remote", "url": "https://api.example.com/standards" }
```

## 调试配置

启动时查看配置加载信息：

```bash
# 服务器会输出配置信息到 stderr
npx mcp-dev-standards 2>&1 | head -20
```

输出示例：

```
MCP Dev Standards Server 启动中...
已加载配置文件: /path/to/standards.config.json
项目: 我的项目规范
文档来源: 2 个
分类: frontend, backend, custom
服务器已启动，等待连接...
```

