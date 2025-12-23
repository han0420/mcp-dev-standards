# 使用指南

本文档介绍如何在 AI 对话中使用 MCP Dev Standards 工具。

## 基本概念

MCP Dev Standards 提供三个核心工具：

1. **resolve-standard-id** - 搜索规范文档
2. **get-standard-docs** - 获取规范内容
3. **list-standards** - 列出所有规范

## 使用场景

### 场景一：编写符合规范的代码

当你需要 AI 帮你编写代码时，可以让它先查询规范：

```
用户: 帮我写一个 Vue3 组件，用于显示用户信息

AI 的处理流程:
1. 调用 resolve-standard-id，查询 "Vue 组件"
2. 调用 get-standard-docs，获取 Vue 组件规范
3. 根据规范生成符合标准的代码
```

### 场景二：查看特定规范

直接询问某个规范的内容：

```
用户: 查看 RESTful API 设计规范

AI 的处理流程:
1. 调用 resolve-standard-id，查询 "RESTful API"
2. 调用 get-standard-docs，获取完整规范内容
3. 展示规范内容
```

### 场景三：了解可用规范

查看所有可用的规范：

```
用户: 列出所有可用的开发规范

AI 的处理流程:
1. 调用 list-standards
2. 展示按分类组织的规范列表
```

### 场景四：按分类查看规范

```
用户: 列出所有前端开发规范

AI 的处理流程:
1. 调用 list-standards，category="frontend"
2. 展示前端分类下的所有规范
```

## 推荐的提问方式

### 编码任务

```
# 好的提问方式
"根据团队规范，帮我写一个 Vue3 的用户列表组件"
"按照 RESTful 规范，设计用户管理的 API 接口"
"参考数据库命名规范，设计用户表结构"

# 不太好的提问方式
"写一个组件"  # 太模糊，AI 可能不会查询规范
```

### 查询规范

```
# 好的提问方式
"查看 Vue 组件命名规范"
"React Hooks 有哪些最佳实践？"
"API 错误处理应该怎么设计？"

# 不太好的提问方式
"规范"  # 太模糊
```

## 工具详细说明

### resolve-standard-id

**用途**: 根据关键词搜索匹配的规范文档

**输入参数**:
```json
{
  "query": "Vue 组件"  // 搜索关键词
}
```

**输出示例**:
```json
{
  "message": "找到 2 个相关规范文档",
  "results": [
    {
      "id": "frontend-vue-components",
      "title": "Vue 3 组件开发规范",
      "description": "Vue 3 组件的编写规范和最佳实践",
      "category": "frontend",
      "relevance": 17
    },
    {
      "id": "frontend-vue-composables",
      "title": "Vue 3 Composables 开发规范",
      "description": "Vue 3 组合式函数的编写规范",
      "category": "frontend",
      "relevance": 10
    }
  ],
  "totalCount": 2
}
```

### get-standard-docs

**用途**: 获取指定规范文档的详细内容

**输入参数**:
```json
{
  "standardId": "frontend-vue-components",  // 规范 ID（必填）
  "topic": "命名规范",                       // 主题过滤（可选）
  "maxTokens": 2000                         // 最大 token 数（可选）
}
```

**输出示例**:
```markdown
# Vue 3 组件开发规范

> Vue 3 组件的编写规范和最佳实践

**分类**: frontend / vue | **标签**: vue, vue3, component | **版本**: 1.0.0

---

## 组件结构

### 推荐使用 `<script setup>` 语法

...（规范内容）
```

### list-standards

**用途**: 列出所有可用的规范分类和文档

**输入参数**:
```json
{
  "category": "frontend"  // 分类过滤（可选）
}
```

**输出示例**:
```json
{
  "projectTitle": "开发规范中心",
  "totalCount": 9,
  "categories": [
    {
      "category": "frontend",
      "count": 5,
      "standards": [
        {
          "id": "frontend-vue-components",
          "title": "Vue 3 组件开发规范",
          "description": "Vue 3 组件的编写规范和最佳实践",
          "subcategory": "vue",
          "tags": ["vue", "vue3", "component"]
        }
        // ...更多规范
      ]
    },
    {
      "category": "backend",
      "count": 3,
      "standards": [...]
    }
  ]
}
```

## 高级用法

### 结合多个规范

```
用户: 我要开发一个用户管理功能，包括前端 Vue 组件和后端 API，请先查看相关规范，然后给我一个完整的实现方案

AI 的处理流程:
1. 调用 resolve-standard-id，查询 "Vue 组件"
2. 调用 resolve-standard-id，查询 "RESTful API"
3. 调用 get-standard-docs，获取 Vue 组件规范
4. 调用 get-standard-docs，获取 API 设计规范
5. 综合两个规范，给出完整的实现方案
```

### 按主题获取部分内容

```
用户: 只看 Vue 组件规范中关于 Props 的部分

AI 的处理流程:
1. 调用 get-standard-docs，standardId="frontend-vue-components"，topic="Props"
2. 返回过滤后的内容
```

### 限制返回内容长度

```
用户: 简要介绍一下 React Hooks 规范

AI 的处理流程:
1. 调用 get-standard-docs，standardId="frontend-react-hooks"，maxTokens=500
2. 返回截断后的内容摘要
```

## 最佳实践

1. **先搜索再获取**: 使用 `resolve-standard-id` 确定正确的规范 ID，再用 `get-standard-docs` 获取内容

2. **使用主题过滤**: 当规范文档很长时，使用 `topic` 参数获取特定部分

3. **结合上下文**: 在编码任务中提及"按照规范"或"参考规范"，AI 会自动查询相关规范

4. **定期更新**: 如果规范有更新，服务器会在缓存过期后自动获取最新内容

## 常见问题

### Q: AI 没有自动查询规范怎么办？

明确提示 AI 使用规范：
```
"请先查看 Vue 组件规范，然后帮我写一个组件"
```

### Q: 搜索结果不准确？

尝试使用更具体的关键词：
```
# 不够具体
"组件"

# 更具体
"Vue3 组件 命名"
```

### Q: 如何知道有哪些规范可用？

使用 `list-standards` 工具查看所有可用规范。

