# 安装指南

本文档详细介绍如何安装和配置 MCP Dev Standards 工具。

## 安装方式

### 方式一：使用 npx（推荐）

无需安装，直接在 MCP 配置中使用：

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

### 方式二：全局安装

```bash
# 使用 npm
npm install -g mcp-dev-standards

# 使用 pnpm
pnpm add -g mcp-dev-standards

# 使用 yarn
yarn global add mcp-dev-standards
```

安装后在 MCP 配置中使用：

```json
{
  "mcpServers": {
    "dev-standards": {
      "command": "mcp-dev-standards"
    }
  }
}
```

### 方式三：项目本地安装

```bash
# 在项目目录中安装
npm install mcp-dev-standards

# 或使用 pnpm
pnpm add mcp-dev-standards
```

在 MCP 配置中使用本地安装：

```json
{
  "mcpServers": {
    "dev-standards": {
      "command": "node",
      "args": ["./node_modules/mcp-dev-standards/dist/index.js"]
    }
  }
}
```

### 方式四：从源码安装

```bash
# 克隆仓库
git clone https://github.com/your-org/mcp-dev-standards.git
cd mcp-dev-standards

# 安装依赖
npm install

# 构建
npm run build

# 链接到全局
npm link
```

## 配置不同的 AI 工具

### Cursor IDE

1. 打开 Cursor 设置
2. 找到 MCP 配置部分
3. 编辑配置文件 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "dev-standards": {
      "command": "npx",
      "args": ["-y", "mcp-dev-standards"],
      "env": {
        "STANDARDS_PATH": "/path/to/your/standards"
      }
    }
  }
}
```

4. 重启 Cursor

### Claude Desktop

1. 找到 Claude Desktop 配置文件：
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. 添加 MCP 服务器配置：

```json
{
  "mcpServers": {
    "dev-standards": {
      "command": "npx",
      "args": ["-y", "mcp-dev-standards"],
      "env": {}
    }
  }
}
```

3. 重启 Claude Desktop

### VS Code (Cline 插件)

1. 安装 Cline 插件
2. 打开 VS Code 设置
3. 搜索 "Cline MCP"
4. 编辑 MCP 服务器配置：

```json
{
  "cline.mcpServers": {
    "dev-standards": {
      "command": "npx",
      "args": ["-y", "mcp-dev-standards"]
    }
  }
}
```

### Windsurf

在 Windsurf 的 MCP 配置中添加：

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

## 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `STANDARDS_PATH` | 规范文档目录路径 | `./standards` |
| `STANDARDS_CONFIG` | 配置文件路径 | `standards.config.json` |
| `GITHUB_TOKEN` | GitHub API Token（用于 Git 来源） | - |

### 在 MCP 配置中设置环境变量

```json
{
  "mcpServers": {
    "dev-standards": {
      "command": "npx",
      "args": ["-y", "mcp-dev-standards"],
      "env": {
        "STANDARDS_PATH": "./my-standards",
        "STANDARDS_CONFIG": "./my-config.json",
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

## 验证安装

安装完成后，可以通过以下方式验证：

1. 在 AI 对话中输入：
   ```
   请列出所有可用的开发规范
   ```

2. AI 应该会调用 `list-standards` 工具并返回规范列表

3. 如果看到规范列表，说明安装成功

## 常见问题

### Q: 提示找不到 npx 命令

确保已安装 Node.js 18+：

```bash
node --version  # 应该显示 v18.x.x 或更高
```

### Q: 权限错误

在 macOS/Linux 上，可能需要授予执行权限：

```bash
chmod +x $(which mcp-dev-standards)
```

### Q: 配置文件找不到

确保配置文件路径正确，可以使用绝对路径：

```json
{
  "env": {
    "STANDARDS_CONFIG": "/Users/username/project/standards.config.json"
  }
}
```

### Q: Git 来源无法访问

1. 确保设置了 `GITHUB_TOKEN` 环境变量
2. Token 需要有 `repo` 权限
3. 检查仓库路径格式是否正确：`owner/repo`

## 下一步

- [配置指南](./configuration.md) - 详细的配置选项说明
- [使用指南](./usage.md) - 如何在 AI 对话中使用
- [自定义规范](./custom-standards.md) - 如何添加自己的规范文档

