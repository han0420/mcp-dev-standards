# 发布指南

本文档介绍如何将 MCP Dev Standards 发布到 npm。

## 发布前准备

### 1. 确保代码质量

```bash
# 运行测试
npm test

# 构建项目
npm run build

# 检查构建产物
ls -la dist/
```

### 2. 更新版本号

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号 (MAJOR)**: 不兼容的 API 变更
- **次版本号 (MINOR)**: 向后兼容的新功能
- **修订号 (PATCH)**: 向后兼容的问题修复

```bash
# 修订版本（bug 修复）
npm version patch

# 次版本（新功能）
npm version minor

# 主版本（破坏性变更）
npm version major
```

### 3. 更新 CHANGELOG

创建或更新 `CHANGELOG.md`：

```markdown
# Changelog

## [1.1.0] - 2024-12-23

### Added
- 新增 Git 仓库文档来源支持
- 新增文档缓存机制

### Changed
- 优化搜索算法

### Fixed
- 修复中文搜索问题
```

## 发布到 npm

### 首次发布

1. **登录 npm**

```bash
npm login
# 输入用户名、密码、邮箱
```

2. **检查包名是否可用**

```bash
npm search mcp-dev-standards
```

3. **发布**

```bash
npm publish
```

### 更新发布

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 发布
npm publish
```

### 发布到私有 registry

如果使用私有 npm registry：

```bash
# 设置 registry
npm config set registry https://your-private-registry.com

# 或在 .npmrc 中配置
echo "registry=https://your-private-registry.com" >> .npmrc

# 发布
npm publish
```

## 发布配置

### package.json 关键字段

```json
{
  "name": "mcp-dev-standards",
  "version": "1.0.0",
  "description": "MCP 服务器 - 为 AI 编程助手提供前后端开发规范上下文",
  "main": "dist/index.js",
  "bin": {
    "mcp-dev-standards": "./dist/index.js"
  },
  "files": [
    "dist",
    "standards",
    "README.md"
  ],
  "keywords": [
    "mcp",
    "model-context-protocol",
    "ai",
    "coding-standards",
    "cursor",
    "claude"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/mcp-dev-standards.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/mcp-dev-standards/issues"
  },
  "homepage": "https://github.com/your-org/mcp-dev-standards#readme"
}
```

### files 字段说明

`files` 字段指定发布时包含的文件：

- `dist` - 编译后的 JavaScript 文件
- `standards` - 默认规范文档
- `README.md` - 项目说明

### .npmignore

如果需要排除特定文件，创建 `.npmignore`：

```
src/
*.test.ts
*.spec.ts
.github/
docs/
coverage/
.env*
```

## 自动化发布

### GitHub Actions

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm test
      - run: npm run build
      
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 配置 NPM_TOKEN

1. 在 npm 网站生成 Access Token
2. 在 GitHub 仓库设置中添加 Secret：`NPM_TOKEN`

## 版本标签

### 使用 dist-tag

```bash
# 发布 beta 版本
npm publish --tag beta

# 发布 next 版本
npm publish --tag next

# 用户安装特定版本
npm install mcp-dev-standards@beta
```

### 管理标签

```bash
# 查看所有标签
npm dist-tag ls mcp-dev-standards

# 添加标签
npm dist-tag add mcp-dev-standards@1.0.0 latest

# 删除标签
npm dist-tag rm mcp-dev-standards beta
```

## 发布检查清单

发布前确认以下事项：

- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] README 是最新的
- [ ] 没有敏感信息（API keys, tokens 等）
- [ ] `files` 字段正确配置
- [ ] `bin` 字段指向正确的入口文件

## 发布后验证

```bash
# 安装刚发布的包
npm install -g mcp-dev-standards

# 验证版本
mcp-dev-standards --version

# 或使用 npx 测试
npx mcp-dev-standards --help
```

## 撤销发布

如果发布了有问题的版本：

```bash
# 撤销特定版本（24小时内）
npm unpublish mcp-dev-standards@1.0.0

# 废弃版本（推荐，不会删除）
npm deprecate mcp-dev-standards@1.0.0 "此版本有严重 bug，请使用 1.0.1"
```

**注意**: npm 有严格的撤销政策，发布 24 小时后无法撤销。建议使用 `deprecate` 标记有问题的版本。

## 常见问题

### Q: 发布时提示包名已存在

1. 检查包名是否被占用：`npm search <package-name>`
2. 考虑使用 scoped 包名：`@your-org/mcp-dev-standards`

### Q: 发布后找不到 bin 命令

确保：
1. `package.json` 中 `bin` 字段正确
2. 入口文件有 shebang：`#!/usr/bin/env node`
3. 文件有执行权限

### Q: 发布的包缺少文件

检查：
1. `files` 字段是否正确
2. `.npmignore` 是否排除了需要的文件
3. 使用 `npm pack` 预览包内容

