---
title: RESTful API 设计规范
description: RESTful API 的设计规范和最佳实践
category: backend
subcategory: api
tags:
  - api
  - restful
  - http
  - design
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# RESTful API 设计规范

本规范定义了 RESTful API 的设计标准，确保 API 的一致性、可用性和可维护性。

## URL 设计

### 资源命名

- 使用**名词**表示资源，使用**复数**形式
- 使用**小写字母**和**连字符**
- 避免使用动词

```
# ✅ 正确
GET    /api/users              # 获取用户列表
GET    /api/users/123          # 获取单个用户
POST   /api/users              # 创建用户
PUT    /api/users/123          # 更新用户
DELETE /api/users/123          # 删除用户

GET    /api/user-profiles      # 使用连字符分隔多词
GET    /api/order-items        # 资源名使用复数

# ❌ 错误
GET    /api/getUsers           # 不应使用动词
GET    /api/user               # 应使用复数
GET    /api/User               # 不应使用大写
GET    /api/user_profiles      # 不应使用下划线
```

### 资源层级

```
# ✅ 正确的层级关系
GET    /api/users/123/orders           # 用户的订单列表
GET    /api/users/123/orders/456       # 用户的特定订单
POST   /api/users/123/orders           # 为用户创建订单

# ❌ 避免过深的层级（超过 3 层）
GET    /api/users/123/orders/456/items/789/details  # 太深

# ✅ 使用查询参数代替
GET    /api/order-items/789?include=details
```

### 版本控制

```
# ✅ 推荐：URL 路径版本
GET    /api/v1/users
GET    /api/v2/users

# 也可以：请求头版本
GET    /api/users
Header: Accept: application/vnd.api+json;version=1
```

## HTTP 方法

### 标准方法使用

| 方法 | 用途 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 完整更新资源 | 是 | 否 |
| PATCH | 部分更新资源 | 否 | 否 |
| DELETE | 删除资源 | 是 | 否 |

### PUT vs PATCH

```json
// PUT - 完整替换资源
PUT /api/users/123
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "address": "北京市"
}

// PATCH - 部分更新
PATCH /api/users/123
{
  "phone": "13900139000"
}
```

## 状态码

### 成功响应

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | GET、PUT、PATCH 成功 |
| 201 | Created | POST 创建成功 |
| 204 | No Content | DELETE 成功，无返回内容 |

### 客户端错误

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 验证失败 |
| 429 | Too Many Requests | 请求频率超限 |

### 服务端错误

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |

## 请求格式

### 请求头

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
X-Request-ID: <uuid>
```

### 请求体

```json
// POST /api/users
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

## 响应格式

### 成功响应

```json
// 单个资源
{
  "data": {
    "id": "123",
    "type": "user",
    "attributes": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}

// 资源列表
{
  "data": [
    { "id": "1", "name": "用户1" },
    { "id": "2", "name": "用户2" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### 错误响应

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      },
      {
        "field": "password",
        "message": "密码长度至少8位"
      }
    ]
  },
  "requestId": "abc-123-def"
}
```

## 查询参数

### 分页

```
GET /api/users?page=1&pageSize=20
GET /api/users?offset=0&limit=20
```

### 排序

```
GET /api/users?sort=createdAt        # 升序
GET /api/users?sort=-createdAt       # 降序
GET /api/users?sort=name,-createdAt  # 多字段排序
```

### 过滤

```
GET /api/users?status=active
GET /api/users?role=admin&status=active
GET /api/users?createdAt[gte]=2024-01-01
GET /api/users?name[like]=张
```

### 字段选择

```
GET /api/users?fields=id,name,email
GET /api/users?fields[user]=id,name&fields[orders]=id,total
```

### 关联加载

```
GET /api/users/123?include=orders,profile
GET /api/orders?include=user,items
```

## 认证与授权

### Bearer Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### API Key

```http
X-API-Key: your-api-key
```

### 错误处理

```json
// 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "认证失败，请重新登录"
  }
}

// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "没有权限访问此资源"
  }
}
```

## 速率限制

### 响应头

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

### 超限响应

```json
// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求频率超限，请稍后重试",
    "retryAfter": 60
  }
}
```

## 批量操作

### 批量创建

```json
POST /api/users/batch
{
  "data": [
    { "name": "用户1", "email": "user1@example.com" },
    { "name": "用户2", "email": "user2@example.com" }
  ]
}
```

### 批量更新

```json
PATCH /api/users/batch
{
  "data": [
    { "id": "1", "status": "active" },
    { "id": "2", "status": "inactive" }
  ]
}
```

### 批量删除

```json
DELETE /api/users/batch
{
  "ids": ["1", "2", "3"]
}
```

## 文件上传

### 单文件上传

```http
POST /api/files
Content-Type: multipart/form-data

file: <binary>
```

### 响应

```json
{
  "data": {
    "id": "file-123",
    "filename": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "url": "https://cdn.example.com/files/document.pdf"
  }
}
```

## 搜索

### 简单搜索

```
GET /api/users?q=张三
```

### 高级搜索

```json
POST /api/users/search
{
  "query": "张三",
  "filters": {
    "status": "active",
    "role": ["admin", "user"]
  },
  "sort": [
    { "field": "createdAt", "order": "desc" }
  ],
  "page": 1,
  "pageSize": 20
}
```

## HATEOAS（可选）

```json
{
  "data": {
    "id": "123",
    "name": "张三"
  },
  "links": {
    "self": "/api/users/123",
    "orders": "/api/users/123/orders",
    "profile": "/api/users/123/profile"
  }
}
```

## 文档

### OpenAPI/Swagger

```yaml
openapi: 3.0.0
info:
  title: 用户服务 API
  version: 1.0.0
paths:
  /users:
    get:
      summary: 获取用户列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
```

