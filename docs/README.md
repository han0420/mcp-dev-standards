# MCP Dev Standards 文档

欢迎使用 MCP Dev Standards！这是一个基于 Model Context Protocol (MCP) 的开发规范服务器。

## 文档目录

### 快速开始

- [安装指南](./installation.md) - 如何安装和配置 MCP Dev Standards
- [使用指南](./usage.md) - 如何在 AI 对话中使用

### 配置与自定义

- [配置指南](./configuration.md) - 详细的配置选项说明
- [自定义规范](./custom-standards.md) - 如何添加自己的规范文档

### 开发与发布

- [发布指南](./publishing.md) - 如何发布到 npm

## 快速链接

### 安装

```bash
# 使用 npx（推荐）
npx mcp-dev-standards

# 全局安装
npm install -g mcp-dev-standards
```

### 配置 Cursor

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

### 可用工具

| 工具 | 说明 |
|------|------|
| `resolve-standard-id` | 搜索规范文档 |
| `get-standard-docs` | 获取规范内容 |
| `list-standards` | 列出所有规范 |

## 内置规范

### 前端
- Vue 3 组件开发规范
- Vue 3 Composables 规范
- React 组件开发规范
- React Hooks 规范
- Tailwind CSS 规范

### 后端
- RESTful API 设计规范
- API 错误处理规范
- 数据库命名规范

### 通用
- 团队开发规范

## 获取帮助

- 查看 [GitHub Issues](https://github.com/your-org/mcp-dev-standards/issues)
- 阅读 [常见问题](./installation.md#常见问题)

## 贡献

欢迎提交 Issue 和 Pull Request！

