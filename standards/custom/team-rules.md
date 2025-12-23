---
title: 团队开发规范
description: 团队内部的自定义开发规范和约定
category: custom
tags:
  - team
  - convention
  - rules
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# 团队开发规范

本文档定义了团队内部的开发规范和约定，作为所有项目的基础标准。

## 代码风格

### 通用规则

1. **缩进**: 使用 2 个空格
2. **行宽**: 最大 100 字符
3. **文件编码**: UTF-8
4. **换行符**: LF（Unix 风格）
5. **文件末尾**: 保留一个空行

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `userName`, `getUserById` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 类/组件 | PascalCase | `UserService`, `LoginForm` |
| 文件（组件） | PascalCase | `UserCard.vue`, `Button.tsx` |
| 文件（工具） | camelCase | `utils.ts`, `apiClient.ts` |
| 目录 | kebab-case | `user-management/` |
| CSS 类名 | kebab-case | `user-card`, `btn-primary` |

### 注释规范

```typescript
/**
 * 函数描述
 * @param userId - 用户ID
 * @param options - 配置选项
 * @returns 用户信息
 * @throws {NotFoundError} 用户不存在时抛出
 */
const getUser = async (userId: string, options?: GetUserOptions): Promise<User> => {
  // 单行注释：解释复杂逻辑
  // ...
}

// TODO: 待完成的功能
// FIXME: 需要修复的问题
// HACK: 临时解决方案，需要优化
// NOTE: 重要说明
```

## Git 规范

### 分支命名

```
main                    # 主分支
develop                 # 开发分支
feature/user-login      # 功能分支
bugfix/login-error      # 修复分支
hotfix/security-patch   # 紧急修复
release/v1.2.0          # 发布分支
```

### Commit 信息

使用 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 Bug |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构（不是新功能或修复） |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具相关 |
| ci | CI 配置 |
| revert | 回滚 |

#### 示例

```
feat(auth): 添加微信登录功能

- 集成微信 OAuth 2.0
- 添加微信用户信息同步
- 支持绑定已有账号

Closes #123
```

```
fix(order): 修复订单金额计算错误

修复了在使用优惠券时，订单总金额计算不正确的问题。

Fixes #456
```

## 项目结构

### 前端项目（Vue/Nuxt）

```
src/
  components/           # 通用组件
    ui/                 # 基础 UI 组件
    business/           # 业务组件
  composables/          # 组合式函数
  pages/                # 页面组件
  layouts/              # 布局组件
  stores/               # Pinia 状态管理
  services/             # API 服务
  utils/                # 工具函数
  types/                # TypeScript 类型
  assets/               # 静态资源
  styles/               # 全局样式
```

### 后端项目（Node.js）

```
src/
  controllers/          # 控制器
  services/             # 业务服务
  repositories/         # 数据访问层
  models/               # 数据模型
  middlewares/          # 中间件
  routes/               # 路由定义
  utils/                # 工具函数
  types/                # TypeScript 类型
  config/               # 配置文件
  errors/               # 自定义错误
```

## 代码审查

### 审查清单

- [ ] 代码符合团队规范
- [ ] 有适当的注释和文档
- [ ] 没有明显的性能问题
- [ ] 没有安全漏洞
- [ ] 测试覆盖关键逻辑
- [ ] 没有硬编码的配置
- [ ] 错误处理完善

### PR 规范

1. **标题**: 简洁描述改动内容
2. **描述**: 详细说明改动原因和影响
3. **关联**: 关联相关 Issue
4. **截图**: UI 改动需附截图
5. **测试**: 说明测试情况

## 环境配置

### 环境变量

```bash
# .env.example - 必须提供示例文件
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

### 配置文件

```typescript
// config/index.ts
export const config = {
  app: {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  // 不要在代码中硬编码敏感信息
}
```

## 错误处理

### 前端

```typescript
// 统一错误处理
try {
  await api.createUser(data)
} catch (error) {
  if (error instanceof ValidationError) {
    // 显示验证错误
    showFieldErrors(error.details)
  } else if (error instanceof NetworkError) {
    // 显示网络错误
    showToast('网络错误，请重试')
  } else {
    // 上报未知错误
    reportError(error)
    showToast('操作失败，请稍后重试')
  }
}
```

### 后端

```typescript
// 使用自定义错误类
throw new ValidationError([
  { field: 'email', message: '邮箱格式不正确' }
])

throw new NotFoundError('User', userId)

throw new BusinessError('INSUFFICIENT_BALANCE', '余额不足')
```

## 日志规范

### 日志级别

| 级别 | 使用场景 |
|------|----------|
| error | 错误，需要立即处理 |
| warn | 警告，潜在问题 |
| info | 重要业务信息 |
| debug | 调试信息（生产环境不输出） |

### 日志格式

```typescript
// 结构化日志
logger.info('用户登录成功', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent']
})

logger.error('支付失败', {
  orderId: order.id,
  error: error.message,
  stack: error.stack
})
```

## 测试规范

### 测试文件命名

```
UserService.test.ts     # 单元测试
UserService.spec.ts     # 也可以用 spec
user.e2e.test.ts        # E2E 测试
```

### 测试结构

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { name: '张三', email: 'test@example.com' }
      
      // Act
      const user = await userService.createUser(userData)
      
      // Assert
      expect(user.name).toBe('张三')
      expect(user.id).toBeDefined()
    })
    
    it('should throw ValidationError with invalid email', async () => {
      const userData = { name: '张三', email: 'invalid' }
      
      await expect(userService.createUser(userData))
        .rejects
        .toThrow(ValidationError)
    })
  })
})
```

## 文档规范

### README 必须包含

1. 项目简介
2. 技术栈
3. 快速开始
4. 环境变量说明
5. 常用命令
6. 项目结构
7. 部署说明

### API 文档

- 使用 OpenAPI/Swagger 规范
- 保持文档与代码同步
- 提供请求/响应示例

## 安全规范

### 禁止事项

- ❌ 提交敏感信息到代码仓库
- ❌ 在前端存储敏感数据
- ❌ 使用不安全的依赖
- ❌ 禁用 HTTPS
- ❌ 使用弱密码策略

### 必须事项

- ✅ 所有输入必须验证
- ✅ SQL 使用参数化查询
- ✅ 密码必须加密存储
- ✅ 定期更新依赖
- ✅ 实施访问控制

## 性能规范

### 前端

- 图片使用 WebP 格式
- 实施懒加载
- 代码分割
- 缓存静态资源

### 后端

- 数据库查询优化
- 使用缓存
- 实施分页
- 异步处理耗时操作

