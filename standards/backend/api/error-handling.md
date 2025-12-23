---
title: API 错误处理规范
description: API 错误处理的设计规范和最佳实践
category: backend
subcategory: api
tags:
  - api
  - error-handling
  - exception
  - http
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# API 错误处理规范

本规范定义了 API 错误处理的标准，确保错误响应的一致性和可用性。

## 错误响应格式

### 标准错误结构

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "用户可读的错误信息",
    "details": [],
    "timestamp": "2024-01-01T00:00:00Z",
    "path": "/api/users",
    "requestId": "req-abc-123"
  }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 错误代码，用于程序识别 |
| message | string | 是 | 错误描述，用于用户展示 |
| details | array | 否 | 详细错误信息 |
| timestamp | string | 否 | 错误发生时间 |
| path | string | 否 | 请求路径 |
| requestId | string | 是 | 请求追踪 ID |

## 错误代码设计

### 代码命名规范

- 使用大写字母和下划线
- 格式：`[CATEGORY]_[SPECIFIC_ERROR]`
- 保持简洁明了

```typescript
// 错误代码枚举
const ErrorCodes = {
  // 认证相关
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  // 验证相关
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  
  // 资源相关
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // 权限相关
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_INSUFFICIENT: 'PERMISSION_INSUFFICIENT',
  
  // 业务相关
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  
  // 系统相关
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const
```

## 验证错误

### 字段验证错误

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "邮箱格式不正确",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "code": "MIN_LENGTH",
        "message": "密码长度至少8位",
        "constraint": {
          "minLength": 8
        }
      },
      {
        "field": "age",
        "code": "OUT_OF_RANGE",
        "message": "年龄必须在18-120之间",
        "constraint": {
          "min": 18,
          "max": 120
        }
      }
    ]
  }
}
```

### 常见验证错误代码

| 代码 | 说明 |
|------|------|
| REQUIRED | 必填字段为空 |
| INVALID_FORMAT | 格式不正确 |
| MIN_LENGTH | 长度不足 |
| MAX_LENGTH | 长度超限 |
| OUT_OF_RANGE | 超出范围 |
| INVALID_TYPE | 类型错误 |
| DUPLICATE | 重复值 |

## 业务错误

### 业务规则违反

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "订单金额超出用户信用额度",
    "details": {
      "orderAmount": 10000,
      "creditLimit": 5000,
      "availableCredit": 3000
    }
  }
}
```

### 操作不允许

```json
{
  "error": {
    "code": "OPERATION_NOT_ALLOWED",
    "message": "已发货的订单不能取消",
    "details": {
      "orderId": "order-123",
      "currentStatus": "shipped",
      "allowedOperations": ["track", "confirm_receipt"]
    }
  }
}
```

## 认证错误

### Token 无效

```json
// 401 Unauthorized
{
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "message": "认证令牌无效"
  }
}
```

### Token 过期

```json
// 401 Unauthorized
{
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "认证令牌已过期，请重新登录",
    "details": {
      "expiredAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

## 权限错误

### 无权限

```json
// 403 Forbidden
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "没有权限执行此操作",
    "details": {
      "requiredPermission": "users:delete",
      "userPermissions": ["users:read", "users:update"]
    }
  }
}
```

## 资源错误

### 资源不存在

```json
// 404 Not Found
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "用户不存在",
    "details": {
      "resourceType": "User",
      "resourceId": "user-123"
    }
  }
}
```

### 资源冲突

```json
// 409 Conflict
{
  "error": {
    "code": "RESOURCE_CONFLICT",
    "message": "该邮箱已被注册",
    "details": {
      "field": "email",
      "value": "user@example.com"
    }
  }
}
```

## 系统错误

### 内部错误

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "服务器内部错误，请稍后重试",
    "requestId": "req-abc-123"
  }
}
```

**注意**: 生产环境不应暴露内部错误详情。

### 服务不可用

```json
// 503 Service Unavailable
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "服务暂时不可用，请稍后重试",
    "retryAfter": 30
  }
}
```

## 错误处理实现

### TypeScript 错误类

```typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
  
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// 预定义错误
export class ValidationError extends AppError {
  constructor(details: ValidationDetail[]) {
    super('VALIDATION_FAILED', '请求参数验证失败', 400, details)
  }
}

export class NotFoundError extends AppError {
  constructor(resourceType: string, resourceId: string) {
    super('RESOURCE_NOT_FOUND', `${resourceType}不存在`, 404, {
      resourceType,
      resourceId
    })
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '认证失败') {
    super('AUTH_UNAUTHORIZED', message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '没有权限') {
    super('PERMISSION_DENIED', message, 403)
  }
}
```

### 全局错误处理中间件

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 生成请求 ID
  const requestId = req.headers['x-request-id'] || generateRequestId()
  
  // 记录错误日志
  logger.error({
    requestId,
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  })
  
  // 处理已知错误
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      ...error.toJSON(),
      error: {
        ...error.toJSON().error,
        requestId,
        path: req.path
      }
    })
  }
  
  // 处理未知错误
  const isProduction = process.env.NODE_ENV === 'production'
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? '服务器内部错误' : error.message,
      requestId,
      path: req.path,
      timestamp: new Date().toISOString(),
      // 仅开发环境返回堆栈信息
      ...(isProduction ? {} : { stack: error.stack })
    }
  })
}
```

### 异步错误包装器

```typescript
// utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express'

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 使用示例
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id)
  
  if (!user) {
    throw new NotFoundError('User', req.params.id)
  }
  
  res.json({ data: user })
}))
```

## 客户端错误处理

### 统一错误处理

```typescript
// api/client.ts
import axios, { AxiosError } from 'axios'

const apiClient = axios.create({
  baseURL: '/api'
})

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<ApiError>) => {
    const apiError = error.response?.data?.error
    
    if (apiError) {
      // 根据错误代码处理
      switch (apiError.code) {
        case 'AUTH_TOKEN_EXPIRED':
          // 刷新 token 或跳转登录
          authStore.refreshToken()
          break
        case 'VALIDATION_FAILED':
          // 显示验证错误
          showValidationErrors(apiError.details)
          break
        default:
          // 显示通用错误
          showError(apiError.message)
      }
    }
    
    return Promise.reject(error)
  }
)
```

## 错误监控

### 错误上报

```typescript
// 错误上报服务
const reportError = (error: AppError, context: ErrorContext) => {
  // 发送到错误监控服务（如 Sentry）
  errorReporter.captureException(error, {
    extra: {
      code: error.code,
      details: error.details,
      requestId: context.requestId,
      userId: context.userId
    }
  })
}
```

### 错误指标

```typescript
// 错误指标收集
const errorMetrics = {
  increment: (errorCode: string) => {
    metrics.counter('api_errors_total', {
      code: errorCode
    }).inc()
  }
}
```

