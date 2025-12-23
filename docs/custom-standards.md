# 自定义规范文档

本文档介绍如何创建和管理自定义的开发规范文档。

## 文档格式

规范文档使用 Markdown 格式，支持 YAML frontmatter 元数据。

### 基本结构

```markdown
---
title: 规范标题
description: 规范描述
category: frontend
subcategory: vue
tags:
  - vue
  - component
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# 规范标题

正文内容...
```

### Frontmatter 字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 否 | 文档标题，不填则从内容第一个标题提取 |
| description | string | 否 | 文档描述，不填则从正文第一段提取 |
| category | string | 否 | 分类，不填则从文件路径推断 |
| subcategory | string | 否 | 子分类 |
| tags | array | 否 | 标签列表，用于搜索 |
| version | string | 否 | 版本号 |
| lastUpdated | string | 否 | 最后更新时间 |
| id | string | 否 | 文档 ID，不填则从文件路径生成 |

## 目录结构

### 推荐结构

```
standards/
  frontend/                 # 前端规范
    vue/                    # Vue 相关
      components.md         # 组件规范
      composables.md        # Composables 规范
      naming.md             # 命名规范
    react/                  # React 相关
      components.md
      hooks.md
    styles/                 # 样式相关
      tailwind.md
      css-naming.md
  backend/                  # 后端规范
    api/                    # API 相关
      restful.md
      error-handling.md
      authentication.md
    database/               # 数据库相关
      naming.md
      query.md
  custom/                   # 自定义规范
    team-rules.md           # 团队规则
    code-review.md          # 代码审查
  devops/                   # DevOps 规范
    ci-cd.md
    deployment.md
```

### 分类推断规则

文件路径会被解析为分类信息：

| 文件路径 | category | subcategory |
|----------|----------|-------------|
| `frontend/vue/components.md` | frontend | vue |
| `backend/api/restful.md` | backend | api |
| `custom/team-rules.md` | custom | - |
| `rules.md` | custom | - |

## 编写规范文档

### 示例：Vue 组件规范

```markdown
---
title: Vue 3 组件开发规范
description: 定义 Vue 3 组件的编写标准和最佳实践
category: frontend
subcategory: vue
tags:
  - vue
  - vue3
  - component
  - composition-api
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Vue 3 组件开发规范

本规范定义了 Vue 3 组件的编写标准。

## 组件结构

### 推荐使用 `<script setup>` 语法

\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
\`\`\`

## 命名规范

### 组件文件命名

- 使用 PascalCase：`UserProfile.vue`
- 基础组件使用 `Base` 前缀：`BaseButton.vue`

## Props 规范

### 必须定义类型

\`\`\`typescript
defineProps<{
  title: string
  count?: number
}>()
\`\`\`
```

### 示例：API 错误处理规范

```markdown
---
title: API 错误处理规范
description: 定义 API 错误响应的标准格式
category: backend
subcategory: api
tags:
  - api
  - error
  - http
---

# API 错误处理规范

## 错误响应格式

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      { "field": "email", "message": "邮箱格式不正确" }
    ]
  }
}
\`\`\`

## HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
```

## 标签使用建议

### 通用标签

- `typescript` - TypeScript 相关
- `javascript` - JavaScript 相关
- `naming` - 命名规范
- `best-practice` - 最佳实践

### 前端标签

- `vue`, `vue3`, `vue2`
- `react`, `hooks`
- `component`
- `state-management`
- `styling`, `css`, `tailwind`

### 后端标签

- `api`, `restful`, `graphql`
- `database`, `sql`, `orm`
- `authentication`, `authorization`
- `error-handling`

## 文档 ID 生成规则

如果不指定 `id`，系统会根据文件路径自动生成：

| 文件路径 | 生成的 ID |
|----------|-----------|
| `frontend/vue/components.md` | `frontend-vue-components` |
| `backend/api/restful.md` | `backend-api-restful` |
| `custom/team-rules.md` | `custom-team-rules` |

## 内容组织建议

### 结构化内容

```markdown
# 规范标题

简短介绍...

## 基本规则

### 规则 1
...

### 规则 2
...

## 代码示例

### 正确示例

\`\`\`typescript
// ✅ 正确
const userName = 'John'
\`\`\`

### 错误示例

\`\`\`typescript
// ❌ 错误
const user_name = 'John'
\`\`\`

## 常见问题

### Q: 问题 1？
答案...

### Q: 问题 2？
答案...
```

### 使用表格

```markdown
## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT` |
| 类 | PascalCase | `UserService` |
```

### 使用代码块

```markdown
## 代码模板

\`\`\`typescript
// 组件模板
export const Component = () => {
  // 状态
  const [state, setState] = useState()
  
  // 副作用
  useEffect(() => {
    // ...
  }, [])
  
  // 渲染
  return <div>{/* ... */}</div>
}
\`\`\`
```

## 版本管理

### 版本号规范

使用语义化版本：

- `1.0.0` - 初始版本
- `1.1.0` - 添加新规则
- `1.0.1` - 修复错误或澄清
- `2.0.0` - 重大变更

### 更新日志

在文档末尾添加更新记录：

```markdown
## 更新日志

### 1.1.0 (2024-12-23)
- 新增 Props 验证规范
- 更新命名规范示例

### 1.0.0 (2024-12-01)
- 初始版本
```

## 多语言支持

如果需要支持多语言，可以使用目录区分：

```
standards/
  zh/                       # 中文
    frontend/
      vue/
        components.md
  en/                       # 英文
    frontend/
      vue/
        components.md
```

或在配置中指定不同的来源：

```json
{
  "sources": [
    { "type": "local", "path": "./standards/zh" }
  ]
}
```

## 验证文档

创建文档后，可以通过以下方式验证：

1. 启动服务器
2. 使用 `list-standards` 查看是否出现
3. 使用 `resolve-standard-id` 搜索测试
4. 使用 `get-standard-docs` 获取完整内容

```
用户: 列出所有规范
用户: 搜索 "Vue 组件"
用户: 获取 frontend-vue-components 规范
```

