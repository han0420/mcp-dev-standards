---
title: AI 生成代码注释规范
description: AI 生成代码的强制注释要求，确保代码可读性、可维护性和知识传递
category: custom
subcategory: ai-coding
tags:
  - ai
  - comments
  - documentation
  - code-quality
  - mandatory
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# AI 生成代码注释规范

## 🎯 核心原则

**AI 生成的所有代码必须包含充分的中文注释。** 这是强制性要求，不可省略。

### 为什么需要注释

1. **可读性**: AI 生成的代码可能逻辑复杂，注释帮助人类理解
2. **可维护性**: 后续维护者需要理解代码意图
3. **知识传递**: 注释记录业务逻辑和设计决策
4. **调试便利**: 注释帮助快速定位问题
5. **团队协作**: 统一的注释规范提高协作效率

## 1. 强制注释要求

### 1.1 必须添加注释的场景

| 场景 | 要求 | 优先级 |
|------|------|--------|
| 文件头部 | 必须 | 🔴 最高 |
| 函数/方法 | 必须 | 🔴 最高 |
| 类/接口/类型 | 必须 | 🔴 最高 |
| 复杂逻辑 | 必须 | 🔴 最高 |
| API 调用 | 必须 | 🟡 高 |
| 状态管理 | 必须 | 🟡 高 |
| 正则表达式 | 必须 | 🟡 高 |
| 魔法数字/字符串 | 必须 | 🟡 高 |
| 临时解决方案 | 必须 | 🟡 高 |
| 循环和条件分支 | 建议 | 🟢 中 |

### 1.2 注释语言

- **所有注释必须使用中文**
- 技术术语可保留英文（如 API、DOM、Promise）
- 代码示例中的变量名保持英文

## 2. 文件级注释

### 2.1 文件头注释模板

```typescript
/**
 * @file 用户认证模块
 * @description 处理用户登录、注册、Token 刷新等认证相关功能
 * @author AI Assistant
 * @created 2024-12-23
 * @lastModified 2024-12-23
 * 
 * @module auth
 * @requires axios - HTTP 请求库
 * @requires jwt-decode - JWT 解码库
 * 
 * @example
 * // 导入认证模块
 * import { login, logout, refreshToken } from '@/modules/auth'
 * 
 * // 用户登录
 * const user = await login({ username: 'admin', password: '123456' })
 */
```

### 2.2 模块入口文件

```typescript
/**
 * @file 模块入口文件
 * @description 统一导出用户管理相关的所有功能
 * 
 * 本模块包含:
 * - useUser: 用户状态管理 Hook
 * - userApi: 用户相关 API 接口
 * - UserType: 用户相关类型定义
 * - UserUtils: 用户数据处理工具函数
 * 
 * @module user
 */

// 导出 Hooks
export { useUser } from './hooks/useUser'
export { useUserList } from './hooks/useUserList'

// 导出 API
export * as userApi from './api'

// 导出类型
export type { User, UserRole, UserStatus } from './types'

// 导出工具函数
export { formatUserName, validateUserData } from './utils'
```

## 3. 函数和方法注释

### 3.1 JSDoc 标准格式

```typescript
/**
 * 根据用户 ID 获取用户详细信息
 * 
 * @description 
 * 从服务器获取用户信息，包含缓存机制。
 * 如果缓存有效（5分钟内），直接返回缓存数据。
 * 
 * @param userId - 用户唯一标识符
 * @param options - 可选配置项
 * @param options.forceRefresh - 是否强制刷新缓存，默认 false
 * @param options.includeRoles - 是否包含角色信息，默认 true
 * 
 * @returns 用户信息对象，包含基本信息和权限数据
 * 
 * @throws {NotFoundError} 当用户不存在时抛出
 * @throws {NetworkError} 当网络请求失败时抛出
 * 
 * @example
 * // 基本用法
 * const user = await getUserById('user_123')
 * console.log(user.name)
 * 
 * @example
 * // 强制刷新缓存
 * const user = await getUserById('user_123', { forceRefresh: true })
 * 
 * @see {@link updateUser} 更新用户信息
 * @see {@link deleteUser} 删除用户
 * 
 * @since 1.0.0
 */
async function getUserById(
  userId: string,
  options: GetUserOptions = {}
): Promise<User> {
  // 实现代码...
}
```

### 3.2 箭头函数注释

```typescript
/**
 * 格式化手机号码
 * 将 11 位手机号格式化为 xxx-xxxx-xxxx 格式
 * 
 * @param phone - 原始手机号码
 * @returns 格式化后的手机号，如 138-1234-5678
 */
const formatPhone = (phone: string): string => {
  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '')
  
  // 验证长度
  if (cleaned.length !== 11) {
    return phone // 非标准格式，返回原值
  }
  
  // 格式化为 xxx-xxxx-xxxx
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
}
```

### 3.3 React/Vue 组件方法

```tsx
/**
 * 处理表单提交
 * 
 * @description
 * 1. 验证表单数据
 * 2. 显示加载状态
 * 3. 发送 API 请求
 * 4. 处理成功/失败响应
 * 
 * @param event - 表单提交事件
 */
const handleSubmit = async (event: React.FormEvent): Promise<void> => {
  // 阻止默认提交行为
  event.preventDefault()
  
  // 验证表单数据
  const validation = validateForm(formData)
  if (!validation.isValid) {
    setErrors(validation.errors)
    return
  }
  
  // 设置加载状态
  setLoading(true)
  
  try {
    // 发送创建请求
    const result = await api.create(formData)
    
    // 成功提示
    message.success('创建成功')
    
    // 重置表单
    resetForm()
    
    // 触发回调
    onSuccess?.(result)
  } catch (error) {
    // 错误处理
    handleApiError(error)
  } finally {
    // 恢复加载状态
    setLoading(false)
  }
}
```

## 4. 类和接口注释

### 4.1 类注释

```typescript
/**
 * 购物车管理类
 * 
 * @description
 * 管理用户购物车的所有操作，包括：
 * - 添加/删除商品
 * - 修改商品数量
 * - 计算总价和优惠
 * - 与服务器同步数据
 * 
 * @example
 * const cart = new ShoppingCart(userId)
 * await cart.addItem(productId, 2)
 * console.log(cart.total)
 * 
 * @class
 */
class ShoppingCart {
  /**
   * 购物车 ID
   * @private
   */
  private id: string
  
  /**
   * 购物车商品列表
   * @private
   */
  private items: CartItem[] = []
  
  /**
   * 所属用户 ID
   * @readonly
   */
  readonly userId: string
  
  /**
   * 创建购物车实例
   * 
   * @param userId - 用户 ID
   * @param initialItems - 初始商品列表，可选
   */
  constructor(userId: string, initialItems?: CartItem[]) {
    this.userId = userId
    this.id = generateCartId()
    
    if (initialItems) {
      this.items = initialItems
    }
  }
  
  /**
   * 添加商品到购物车
   * 
   * @description
   * 如果商品已存在，则增加数量；
   * 否则添加新商品项。
   * 
   * @param productId - 商品 ID
   * @param quantity - 数量，默认为 1
   * @returns 添加后的购物车商品项
   * @throws {StockError} 当库存不足时抛出
   */
  async addItem(productId: string, quantity = 1): Promise<CartItem> {
    // 检查库存
    const stock = await this.checkStock(productId)
    if (stock < quantity) {
      throw new StockError('库存不足')
    }
    
    // 查找是否已存在
    const existingItem = this.items.find(item => item.productId === productId)
    
    if (existingItem) {
      // 已存在，增加数量
      existingItem.quantity += quantity
      return existingItem
    }
    
    // 不存在，添加新项
    const newItem: CartItem = {
      id: generateItemId(),
      productId,
      quantity,
      addedAt: new Date(),
    }
    
    this.items.push(newItem)
    
    return newItem
  }
  
  /**
   * 计算购物车总价
   * 
   * @description
   * 包含以下计算：
   * 1. 商品原价合计
   * 2. 优惠券折扣
   * 3. 满减优惠
   * 4. 运费（满 99 包邮）
   * 
   * @returns 价格明细对象
   */
  get priceDetail(): PriceDetail {
    // 计算商品原价合计
    const subtotal = this.items.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
    
    // 计算优惠券折扣
    const couponDiscount = this.calculateCouponDiscount(subtotal)
    
    // 计算满减优惠
    const promotionDiscount = this.calculatePromotionDiscount(subtotal)
    
    // 计算运费（满 99 包邮）
    const shipping = subtotal >= 99 ? 0 : 10
    
    // 最终价格
    const total = subtotal - couponDiscount - promotionDiscount + shipping
    
    return {
      subtotal,
      couponDiscount,
      promotionDiscount,
      shipping,
      total: Math.max(0, total), // 确保不为负数
    }
  }
}
```

### 4.2 接口和类型注释

```typescript
/**
 * 用户基本信息接口
 * 
 * @description 定义系统中用户的核心数据结构
 * @interface
 */
interface User {
  /** 用户唯一标识符，UUID 格式 */
  id: string
  
  /** 用户名，3-20 个字符，仅支持字母数字下划线 */
  username: string
  
  /** 用户邮箱，用于登录和通知 */
  email: string
  
  /** 用户头像 URL，可选 */
  avatar?: string
  
  /** 用户角色列表 */
  roles: UserRole[]
  
  /** 账号状态 */
  status: UserStatus
  
  /** 账号创建时间 */
  createdAt: Date
  
  /** 最后登录时间，未登录过则为 null */
  lastLoginAt: Date | null
  
  /**
   * 用户偏好设置
   * @default { theme: 'light', language: 'zh-CN' }
   */
  preferences: UserPreferences
}

/**
 * 用户角色枚举
 * 
 * @description 系统支持的用户角色类型
 */
type UserRole = 
  | 'admin'      // 管理员：拥有所有权限
  | 'editor'     // 编辑者：可以编辑内容
  | 'viewer'     // 查看者：只读权限
  | 'guest'      // 访客：受限访问

/**
 * 用户状态枚举
 */
type UserStatus = 
  | 'active'     // 正常：账号正常使用
  | 'inactive'   // 未激活：需要邮箱验证
  | 'suspended'  // 已暂停：违规被暂停
  | 'deleted'    // 已删除：软删除状态

/**
 * API 响应通用结构
 * 
 * @template T - 响应数据类型
 */
interface ApiResponse<T> {
  /** 响应状态码，200 表示成功 */
  code: number
  
  /** 响应消息，用于显示给用户 */
  message: string
  
  /** 响应数据，类型由泛型 T 决定 */
  data: T
  
  /** 请求追踪 ID，用于日志排查 */
  traceId: string
  
  /** 服务器时间戳 */
  timestamp: number
}

/**
 * 分页查询参数
 * 
 * @description 用于列表查询接口的分页参数
 */
interface PaginationParams {
  /** 当前页码，从 1 开始 */
  page: number
  
  /** 每页条数，默认 20，最大 100 */
  pageSize: number
  
  /** 排序字段 */
  sortBy?: string
  
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应数据
 * 
 * @template T - 列表项数据类型
 */
interface PaginatedData<T> {
  /** 数据列表 */
  list: T[]
  
  /** 总记录数 */
  total: number
  
  /** 当前页码 */
  page: number
  
  /** 每页条数 */
  pageSize: number
  
  /** 总页数 */
  totalPages: number
  
  /** 是否有下一页 */
  hasNext: boolean
  
  /** 是否有上一页 */
  hasPrev: boolean
}
```

## 5. 复杂逻辑注释

### 5.1 算法注释

```typescript
/**
 * 计算两个日期之间的工作日数量
 * 
 * @description
 * 算法说明：
 * 1. 计算两个日期之间的总天数
 * 2. 计算完整周数和剩余天数
 * 3. 每个完整周包含 5 个工作日
 * 4. 处理剩余天数中的周末
 * 5. 排除法定节假日
 * 
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @param holidays - 法定节假日数组，可选
 * @returns 工作日数量
 * 
 * @complexity 时间复杂度 O(n)，n 为节假日数量
 */
function getWorkingDays(
  startDate: Date,
  endDate: Date,
  holidays: Date[] = []
): number {
  // 确保开始日期早于结束日期
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate]
  }
  
  // 计算总天数（包含首尾）
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1
  
  // 计算完整周数
  const fullWeeks = Math.floor(totalDays / 7)
  
  // 计算剩余天数
  const remainingDays = totalDays % 7
  
  // 完整周的工作日数量（每周 5 个工作日）
  let workingDays = fullWeeks * 5
  
  // 处理剩余天数
  const startDay = startDate.getDay() // 0 = 周日, 6 = 周六
  
  for (let i = 0; i < remainingDays; i++) {
    const currentDay = (startDay + i) % 7
    
    // 跳过周末（周六 = 6, 周日 = 0）
    if (currentDay !== 0 && currentDay !== 6) {
      workingDays++
    }
  }
  
  // 排除法定节假日
  const holidaySet = new Set(
    holidays.map(d => d.toISOString().split('T')[0])
  )
  
  // 遍历每一天，检查是否为节假日
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay()
    
    // 如果是工作日但在节假日列表中，减去
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && holidaySet.has(dateStr)) {
      workingDays--
    }
    
    // 移动到下一天
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return workingDays
}
```

### 5.2 正则表达式注释

```typescript
/**
 * 验证密码强度的正则表达式
 * 
 * @description
 * 密码要求：
 * - 长度 8-20 个字符
 * - 必须包含大写字母
 * - 必须包含小写字母
 * - 必须包含数字
 * - 必须包含特殊字符
 * 
 * 正则解析：
 * ^                    - 字符串开始
 * (?=.*[a-z])          - 前瞻断言：必须包含小写字母
 * (?=.*[A-Z])          - 前瞻断言：必须包含大写字母
 * (?=.*\d)             - 前瞻断言：必须包含数字
 * (?=.*[@$!%*?&])      - 前瞻断言：必须包含特殊字符
 * [A-Za-z\d@$!%*?&]    - 允许的字符集
 * {8,20}               - 长度限制 8-20
 * $                    - 字符串结束
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/

/**
 * 提取 URL 参数的正则表达式
 * 
 * @description
 * 匹配 URL 查询字符串中的键值对
 * 
 * 正则解析：
 * [?&]                 - 匹配 ? 或 & 符号
 * ([^=&]+)             - 捕获组1：参数名（非 = 和 & 的字符）
 * =                    - 匹配等号
 * ([^&]*)              - 捕获组2：参数值（非 & 的字符，可为空）
 * 
 * @example
 * const url = 'https://example.com?name=张三&age=18'
 * url.match(URL_PARAM_REGEX) // 匹配所有参数
 */
const URL_PARAM_REGEX = /[?&]([^=&]+)=([^&]*)/g

/**
 * 解析 URL 查询参数
 * 
 * @param url - 完整 URL 或查询字符串
 * @returns 参数对象
 */
function parseQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  
  // 使用正则匹配所有参数
  let match: RegExpExecArray | null
  
  // 重置正则的 lastIndex（因为使用了 g 标志）
  URL_PARAM_REGEX.lastIndex = 0
  
  while ((match = URL_PARAM_REGEX.exec(url)) !== null) {
    // match[1] = 参数名, match[2] = 参数值
    const key = decodeURIComponent(match[1])
    const value = decodeURIComponent(match[2])
    params[key] = value
  }
  
  return params
}
```

### 5.3 状态机注释

```typescript
/**
 * 订单状态枚举
 * 
 * @description 订单生命周期状态
 */
type OrderStatus = 
  | 'pending'      // 待支付
  | 'paid'         // 已支付
  | 'processing'   // 处理中
  | 'shipped'      // 已发货
  | 'delivered'    // 已送达
  | 'completed'    // 已完成
  | 'cancelled'    // 已取消
  | 'refunding'    // 退款中
  | 'refunded'     // 已退款

/**
 * 订单状态转换规则
 * 
 * @description
 * 状态转换图：
 * 
 *   pending ──┬──> paid ──> processing ──> shipped ──> delivered ──> completed
 *             │                  │            │            │
 *             │                  v            v            v
 *             └───> cancelled <──┴────────────┴────────────┘
 *                                               │
 *                                               v
 *                                          refunding ──> refunded
 * 
 * 允许的状态转换：
 * - pending -> paid, cancelled
 * - paid -> processing, cancelled, refunding
 * - processing -> shipped, cancelled
 * - shipped -> delivered, cancelled
 * - delivered -> completed, refunding
 * - refunding -> refunded
 */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunding'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['completed', 'refunding'],
  completed: [],
  cancelled: [],
  refunding: ['refunded'],
  refunded: [],
}

/**
 * 验证订单状态转换是否合法
 * 
 * @param currentStatus - 当前状态
 * @param nextStatus - 目标状态
 * @returns 是否允许转换
 */
function canTransitionTo(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  // 获取当前状态允许的下一状态列表
  const allowedStatuses = ORDER_STATUS_TRANSITIONS[currentStatus]
  
  // 检查目标状态是否在允许列表中
  return allowedStatuses.includes(nextStatus)
}
```

## 6. React/Vue 组件注释

### 6.1 React 组件

```tsx
/**
 * 用户信息卡片组件
 * 
 * @description
 * 展示用户头像、姓名、角色等基本信息。
 * 支持点击查看详情和编辑功能。
 * 
 * @component
 * @example
 * // 基本用法
 * <UserCard userId="user_123" />
 * 
 * @example
 * // 可编辑模式
 * <UserCard 
 *   userId="user_123" 
 *   editable 
 *   onEdit={(user) => console.log('编辑', user)} 
 * />
 */
interface UserCardProps {
  /** 用户 ID，用于获取用户数据 */
  userId: string
  
  /** 是否显示编辑按钮 */
  editable?: boolean
  
  /** 编辑按钮点击回调 */
  onEdit?: (user: User) => void
  
  /** 卡片点击回调 */
  onClick?: (user: User) => void
  
  /** 自定义类名 */
  className?: string
  
  /** 是否显示骨架屏加载 */
  showSkeleton?: boolean
}

/**
 * 用户信息卡片
 */
export const UserCard: React.FC<UserCardProps> = memo(function UserCard({
  userId,
  editable = false,
  onEdit,
  onClick,
  className,
  showSkeleton = true,
}) {
  // ==================== 状态管理 ====================
  
  /** 用户数据 */
  const [user, setUser] = useState<User | null>(null)
  
  /** 加载状态 */
  const [loading, setLoading] = useState(true)
  
  /** 错误信息 */
  const [error, setError] = useState<string | null>(null)
  
  // ==================== 数据获取 ====================
  
  /**
   * 获取用户数据
   * 组件挂载时自动执行
   */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 调用 API 获取用户数据
        const data = await userApi.getById(userId)
        setUser(data)
      } catch (err) {
        // 记录错误信息
        setError(err instanceof Error ? err.message : '获取用户信息失败')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [userId]) // userId 变化时重新获取
  
  // ==================== 事件处理 ====================
  
  /**
   * 处理卡片点击
   */
  const handleClick = useCallback(() => {
    if (user && onClick) {
      onClick(user)
    }
  }, [user, onClick])
  
  /**
   * 处理编辑按钮点击
   * 阻止事件冒泡，避免触发卡片点击
   */
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (user && onEdit) {
      onEdit(user)
    }
  }, [user, onEdit])
  
  // ==================== 条件渲染 ====================
  
  // 加载状态：显示骨架屏
  if (loading && showSkeleton) {
    return <UserCardSkeleton className={className} />
  }
  
  // 错误状态：显示错误提示
  if (error) {
    return (
      <div className={cn('user-card user-card--error', className)}>
        <span className="user-card__error-text">{error}</span>
      </div>
    )
  }
  
  // 无数据：返回空
  if (!user) {
    return null
  }
  
  // ==================== 正常渲染 ====================
  
  return (
    <div 
      className={cn('user-card', className)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* 用户头像 */}
      <Avatar 
        src={user.avatar} 
        alt={user.username}
        size="large"
      />
      
      {/* 用户信息 */}
      <div className="user-card__info">
        <h3 className="user-card__name">{user.username}</h3>
        <p className="user-card__email">{user.email}</p>
        <RoleBadge role={user.roles[0]} />
      </div>
      
      {/* 编辑按钮 */}
      {editable && (
        <button 
          className="user-card__edit-btn"
          onClick={handleEdit}
          aria-label="编辑用户"
        >
          <EditIcon />
        </button>
      )}
    </div>
  )
})
```

### 6.2 Vue 组件

```vue
<template>
  <!--
    用户列表组件
    
    功能说明：
    - 展示用户列表，支持分页
    - 支持搜索过滤
    - 支持批量操作
    
    使用示例：
    <UserList 
      :initial-page="1" 
      :page-size="20"
      @select="handleSelect"
    />
  -->
  <div class="user-list">
    <!-- 搜索栏 -->
    <div class="user-list__search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名或邮箱"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <!-- 用户表格 -->
    <el-table
      v-loading="loading"
      :data="users"
      @selection-change="handleSelectionChange"
    >
      <!-- 多选列 -->
      <el-table-column type="selection" width="55" />
      
      <!-- 用户名列 -->
      <el-table-column prop="username" label="用户名">
        <template #default="{ row }">
          <!-- 带头像的用户名 -->
          <div class="user-list__name-cell">
            <el-avatar :src="row.avatar" :size="32" />
            <span>{{ row.username }}</span>
          </div>
        </template>
      </el-table-column>
      
      <!-- 邮箱列 -->
      <el-table-column prop="email" label="邮箱" />
      
      <!-- 状态列 -->
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <StatusTag :status="row.status" />
        </template>
      </el-table-column>
      
      <!-- 操作列 -->
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页器 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * @file 用户列表组件
 * @description 展示系统用户列表，支持搜索、分页和批量操作
 * @author AI Assistant
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { User } from '@/types'
import { userApi } from '@/api'

// ==================== 类型定义 ====================

/**
 * 组件 Props
 */
interface Props {
  /** 初始页码 */
  initialPage?: number
  /** 每页条数 */
  pageSize?: number
}

/**
 * 组件 Emits
 */
interface Emits {
  /** 选中用户变化 */
  (e: 'select', users: User[]): void
  /** 编辑用户 */
  (e: 'edit', user: User): void
  /** 删除用户 */
  (e: 'delete', user: User): void
}

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<Props>(), {
  initialPage: 1,
  pageSize: 20,
})

const emit = defineEmits<Emits>()

// ==================== 响应式状态 ====================

/** 用户列表数据 */
const users = ref<User[]>([])

/** 当前页码 */
const currentPage = ref(props.initialPage)

/** 每页条数 */
const pageSize = ref(props.pageSize)

/** 总记录数 */
const total = ref(0)

/** 加载状态 */
const loading = ref(false)

/** 搜索关键词 */
const searchKeyword = ref('')

/** 选中的用户 */
const selectedUsers = ref<User[]>([])

// ==================== 数据获取 ====================

/**
 * 获取用户列表
 * 
 * @description
 * 根据当前页码、每页条数和搜索关键词获取用户数据
 */
const fetchUsers = async (): Promise<void> => {
  loading.value = true
  
  try {
    // 构建查询参数
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
    }
    
    // 调用 API
    const response = await userApi.getList(params)
    
    // 更新数据
    users.value = response.list
    total.value = response.total
  } catch (error) {
    // 错误提示
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// ==================== 事件处理 ====================

/**
 * 处理搜索（防抖 300ms）
 * 
 * @description
 * 使用防抖避免频繁请求，搜索时重置到第一页
 */
const handleSearch = useDebounceFn(() => {
  // 重置到第一页
  currentPage.value = 1
  // 重新获取数据
  fetchUsers()
}, 300)

/**
 * 处理页码变化
 */
const handlePageChange = (page: number): void => {
  currentPage.value = page
  fetchUsers()
}

/**
 * 处理每页条数变化
 */
const handleSizeChange = (size: number): void => {
  pageSize.value = size
  // 重置到第一页
  currentPage.value = 1
  fetchUsers()
}

/**
 * 处理表格选中变化
 */
const handleSelectionChange = (selection: User[]): void => {
  selectedUsers.value = selection
  emit('select', selection)
}

/**
 * 处理编辑用户
 */
const handleEdit = (user: User): void => {
  emit('edit', user)
}

/**
 * 处理删除用户
 * 
 * @description
 * 弹出确认框，确认后执行删除
 */
const handleDelete = async (user: User): Promise<void> => {
  try {
    // 确认对话框
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 执行删除
    await userApi.delete(user.id)
    
    // 成功提示
    ElMessage.success('删除成功')
    
    // 触发事件
    emit('delete', user)
    
    // 刷新列表
    fetchUsers()
  } catch (error) {
    // 用户取消，不做处理
    if (error === 'cancel') return
    
    // 其他错误
    ElMessage.error('删除失败')
  }
}

// ==================== 生命周期 ====================

/**
 * 组件挂载后获取初始数据
 */
onMounted(() => {
  fetchUsers()
})

// ==================== 暴露方法 ====================

/**
 * 刷新列表（供父组件调用）
 */
const refresh = (): void => {
  fetchUsers()
}

defineExpose({
  refresh,
})
</script>

<style scoped lang="scss">
/* 用户列表样式 */
.user-list {
  /* 搜索栏 */
  &__search {
    margin-bottom: 16px;
  }
  
  /* 用户名单元格 */
  &__name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
```

## 7. Hooks/Composables 注释

### 7.1 React Hook

```typescript
/**
 * 用户认证状态管理 Hook
 * 
 * @description
 * 管理用户登录状态、Token 刷新和权限检查。
 * 
 * 功能：
 * - 自动从本地存储恢复登录状态
 * - 提供登录、登出方法
 * - 自动刷新即将过期的 Token
 * - 权限检查工具方法
 * 
 * @example
 * function App() {
 *   const { user, isAuthenticated, login, logout } = useAuth()
 *   
 *   if (!isAuthenticated) {
 *     return <LoginPage onLogin={login} />
 *   }
 *   
 *   return <Dashboard user={user} onLogout={logout} />
 * }
 * 
 * @returns 认证状态和操作方法
 */
export function useAuth(): UseAuthReturn {
  // ==================== 状态 ====================
  
  /** 当前用户信息 */
  const [user, setUser] = useState<User | null>(null)
  
  /** 加载状态（初始化时） */
  const [loading, setLoading] = useState(true)
  
  /** 登录中状态 */
  const [loginLoading, setLoginLoading] = useState(false)
  
  /** 错误信息 */
  const [error, setError] = useState<string | null>(null)
  
  // ==================== 计算属性 ====================
  
  /**
   * 是否已认证
   */
  const isAuthenticated = useMemo(() => user !== null, [user])
  
  /**
   * 用户角色列表
   */
  const roles = useMemo(() => user?.roles || [], [user])
  
  // ==================== 初始化 ====================
  
  /**
   * 从本地存储恢复登录状态
   * 组件挂载时执行一次
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 检查本地是否有 Token
        const token = tokenManager.getAccessToken()
        
        if (!token) {
          // 无 Token，未登录
          return
        }
        
        // 验证 Token 并获取用户信息
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      } catch (error) {
        // Token 无效，清除
        tokenManager.clearTokens()
        console.warn('自动登录失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
  }, [])
  
  // ==================== 方法 ====================
  
  /**
   * 用户登录
   * 
   * @param credentials - 登录凭证
   * @returns 登录后的用户信息
   * @throws {AuthError} 登录失败时抛出
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setLoginLoading(true)
    setError(null)
    
    try {
      // 调用登录 API
      const { accessToken, refreshToken, user } = await authApi.login(credentials)
      
      // 保存 Token
      tokenManager.setTokens(accessToken, refreshToken)
      
      // 更新用户状态
      setUser(user)
      
      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      setError(message)
      throw error
    } finally {
      setLoginLoading(false)
    }
  }, [])
  
  /**
   * 用户登出
   * 
   * @param options - 登出选项
   * @param options.redirect - 是否重定向到登录页，默认 true
   */
  const logout = useCallback(async (options: LogoutOptions = {}): Promise<void> => {
    const { redirect = true } = options
    
    try {
      // 调用登出 API（可选，通知服务器使 Token 失效）
      await authApi.logout()
    } catch {
      // 登出失败不影响本地清理
    } finally {
      // 清除本地 Token
      tokenManager.clearTokens()
      
      // 清除用户状态
      setUser(null)
      
      // 重定向到登录页
      if (redirect) {
        window.location.href = '/login'
      }
    }
  }, [])
  
  /**
   * 检查用户是否拥有指定权限
   * 
   * @param permission - 权限标识
   * @returns 是否拥有该权限
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false
    
    // 管理员拥有所有权限
    if (roles.includes('admin')) return true
    
    // 检查用户权限列表
    return user.permissions?.includes(permission) || false
  }, [user, roles])
  
  /**
   * 检查用户是否拥有指定角色
   * 
   * @param role - 角色标识
   * @returns 是否拥有该角色
   */
  const hasRole = useCallback((role: UserRole): boolean => {
    return roles.includes(role)
  }, [roles])
  
  // ==================== 返回值 ====================
  
  return {
    // 状态
    user,
    loading,
    loginLoading,
    error,
    isAuthenticated,
    roles,
    
    // 方法
    login,
    logout,
    hasPermission,
    hasRole,
  }
}

/**
 * useAuth 返回值类型
 */
interface UseAuthReturn {
  /** 当前用户信息 */
  user: User | null
  /** 初始化加载状态 */
  loading: boolean
  /** 登录加载状态 */
  loginLoading: boolean
  /** 错误信息 */
  error: string | null
  /** 是否已认证 */
  isAuthenticated: boolean
  /** 用户角色列表 */
  roles: UserRole[]
  /** 登录方法 */
  login: (credentials: LoginCredentials) => Promise<User>
  /** 登出方法 */
  logout: (options?: LogoutOptions) => Promise<void>
  /** 权限检查 */
  hasPermission: (permission: string) => boolean
  /** 角色检查 */
  hasRole: (role: UserRole) => boolean
}
```

### 7.2 Vue Composable

```typescript
/**
 * @file 分页数据管理 Composable
 * @description 通用的分页数据获取和管理逻辑
 * 
 * @example
 * // 使用示例
 * const {
 *   data,
 *   loading,
 *   pagination,
 *   refresh,
 *   changePage,
 * } = usePagination(
 *   (params) => api.getList(params),
 *   { pageSize: 20 }
 * )
 */

import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { Ref } from 'vue'

/**
 * 分页参数类型
 */
interface PaginationParams {
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 其他查询参数 */
  [key: string]: unknown
}

/**
 * 分页响应类型
 */
interface PaginationResponse<T> {
  /** 数据列表 */
  list: T[]
  /** 总记录数 */
  total: number
}

/**
 * Composable 配置选项
 */
interface UsePaginationOptions {
  /** 初始页码，默认 1 */
  initialPage?: number
  /** 每页条数，默认 20 */
  pageSize?: number
  /** 是否立即加载，默认 true */
  immediate?: boolean
  /** 额外的查询参数 */
  extraParams?: Record<string, unknown>
}

/**
 * Composable 返回值类型
 */
interface UsePaginationReturn<T> {
  /** 数据列表 */
  data: Ref<T[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<string | null>
  /** 分页信息 */
  pagination: {
    page: Ref<number>
    pageSize: Ref<number>
    total: Ref<number>
    totalPages: Ref<number>
  }
  /** 刷新数据 */
  refresh: () => Promise<void>
  /** 切换页码 */
  changePage: (page: number) => Promise<void>
  /** 切换每页条数 */
  changePageSize: (size: number) => Promise<void>
  /** 重置到第一页 */
  reset: () => Promise<void>
  /** 更新查询参数 */
  updateParams: (params: Record<string, unknown>) => void
}

/**
 * 分页数据管理 Composable
 * 
 * @description
 * 封装分页数据的获取、状态管理和操作方法。
 * 
 * 功能：
 * - 自动管理加载状态和错误状态
 * - 提供分页切换方法
 * - 支持额外查询参数
 * - 支持手动刷新和重置
 * 
 * @template T - 列表项数据类型
 * @param fetcher - 数据获取函数
 * @param options - 配置选项
 * @returns 分页状态和操作方法
 */
export function usePagination<T>(
  fetcher: (params: PaginationParams) => Promise<PaginationResponse<T>>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  // ==================== 解构配置 ====================
  
  const {
    initialPage = 1,
    pageSize: initialPageSize = 20,
    immediate = true,
    extraParams = {},
  } = options
  
  // ==================== 响应式状态 ====================
  
  /** 数据列表 */
  const data = ref<T[]>([]) as Ref<T[]>
  
  /** 加载状态 */
  const loading = ref(false)
  
  /** 错误信息 */
  const error = ref<string | null>(null)
  
  /** 当前页码 */
  const page = ref(initialPage)
  
  /** 每页条数 */
  const pageSize = ref(initialPageSize)
  
  /** 总记录数 */
  const total = ref(0)
  
  /** 额外查询参数 */
  const params = reactive({ ...extraParams })
  
  // ==================== 计算属性 ====================
  
  /**
   * 总页数
   */
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value) || 1
  })
  
  // ==================== 核心方法 ====================
  
  /**
   * 获取数据
   * 
   * @description
   * 根据当前分页参数获取数据
   */
  const fetchData = async (): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      // 构建请求参数
      const requestParams: PaginationParams = {
        page: page.value,
        pageSize: pageSize.value,
        ...params,
      }
      
      // 调用获取函数
      const response = await fetcher(requestParams)
      
      // 更新数据
      data.value = response.list
      total.value = response.total
    } catch (err) {
      // 记录错误
      error.value = err instanceof Error ? err.message : '获取数据失败'
      console.error('分页数据获取失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 刷新当前页数据
   */
  const refresh = async (): Promise<void> => {
    await fetchData()
  }
  
  /**
   * 切换页码
   * 
   * @param newPage - 新页码
   */
  const changePage = async (newPage: number): Promise<void> => {
    // 边界检查
    if (newPage < 1) newPage = 1
    if (newPage > totalPages.value) newPage = totalPages.value
    
    page.value = newPage
    await fetchData()
  }
  
  /**
   * 切换每页条数
   * 
   * @param newSize - 新的每页条数
   */
  const changePageSize = async (newSize: number): Promise<void> => {
    pageSize.value = newSize
    // 重置到第一页
    page.value = 1
    await fetchData()
  }
  
  /**
   * 重置到第一页
   */
  const reset = async (): Promise<void> => {
    page.value = 1
    await fetchData()
  }
  
  /**
   * 更新查询参数
   * 
   * @param newParams - 新的查询参数
   */
  const updateParams = (newParams: Record<string, unknown>): void => {
    Object.assign(params, newParams)
    // 重置到第一页
    page.value = 1
    // 重新获取数据
    fetchData()
  }
  
  // ==================== 生命周期 ====================
  
  /**
   * 组件挂载后立即加载数据（如果配置了 immediate）
   */
  onMounted(() => {
    if (immediate) {
      fetchData()
    }
  })
  
  // ==================== 返回值 ====================
  
  return {
    // 状态
    data,
    loading,
    error,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
    
    // 方法
    refresh,
    changePage,
    changePageSize,
    reset,
    updateParams,
  }
}
```

## 8. ESLint 强制注释规则

### 8.1 ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['jsdoc'],
  extends: [
    'plugin:jsdoc/recommended-typescript',
  ],
  rules: {
    // ==================== JSDoc 强制规则 ====================
    
    // 要求函数必须有 JSDoc 注释
    'jsdoc/require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: true,
        FunctionExpression: true,
      },
      contexts: [
        // Vue <script setup> 中的函数
        'TSMethodSignature',
        // React 函数组件
        'VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
      ],
      // 排除小型函数（少于 3 行）
      minLineCount: 3,
    }],
    
    // 要求必须有 @description 或描述文本
    'jsdoc/require-description': ['error', {
      contexts: ['FunctionDeclaration', 'ClassDeclaration'],
    }],
    
    // 要求必须有 @param 注释
    'jsdoc/require-param': 'error',
    
    // 要求 @param 必须有描述
    'jsdoc/require-param-description': 'error',
    
    // 要求 @param 必须有类型（TypeScript 项目可关闭）
    'jsdoc/require-param-type': 'off',
    
    // 要求必须有 @returns 注释
    'jsdoc/require-returns': 'error',
    
    // 要求 @returns 必须有描述
    'jsdoc/require-returns-description': 'error',
    
    // 检查 @param 名称与函数参数匹配
    'jsdoc/check-param-names': 'error',
    
    // 检查 JSDoc 标签有效性
    'jsdoc/check-tag-names': 'error',
    
    // 检查类型语法
    'jsdoc/valid-types': 'error',
    
    // ==================== 额外规则 ====================
    
    // 要求类必须有注释
    'jsdoc/require-description-complete-sentence': 'off',
    
    // 允许空行
    'jsdoc/no-blank-blocks': 'off',
    
    // 接口和类型必须有注释
    'jsdoc/require-jsdoc': ['error', {
      contexts: [
        'TSInterfaceDeclaration',
        'TSTypeAliasDeclaration',
      ],
    }],
  },
  
  overrides: [
    {
      // Vue 文件特殊规则
      files: ['*.vue'],
      rules: {
        'jsdoc/require-jsdoc': ['error', {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
          },
        }],
      },
    },
    {
      // 测试文件放宽要求
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'jsdoc/require-jsdoc': 'off',
      },
    },
  ],
}
```

### 8.2 VSCode 配置

```json
// .vscode/settings.json
{
  // 保存时自动检查 JSDoc
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  
  // JSDoc 自动补全
  "editor.suggest.showSnippets": true,
  "javascript.suggest.completeFunctionCalls": true,
  "typescript.suggest.completeFunctionCalls": true,
  
  // 文档注释样式
  "jsdoc-generator.includeDescription": true,
  "jsdoc-generator.includeReturns": true,
  "jsdoc-generator.includeParams": true,
  "jsdoc-generator.descriptionPlaceholder": "TODO: 添加函数描述"
}
```

## 9. AI 提示词模板

### 9.1 代码生成提示词

```markdown
请生成以下功能的代码，必须满足注释要求：

## 功能需求
[描述需要实现的功能]

## 注释要求（强制）
1. 文件头部必须包含 @file、@description、@author 标签
2. 所有函数/方法必须有完整的 JSDoc 注释
3. 复杂逻辑必须添加行内注释说明
4. 所有类型定义必须有注释
5. 注释语言：中文

## 注释模板
函数注释必须包含：
- 函数说明
- @param 参数说明
- @returns 返回值说明
- @example 使用示例（可选）
- @throws 异常说明（如适用）

## 示例
/**
 * 函数简要说明
 * 
 * @description 详细描述（如需要）
 * @param paramName - 参数说明
 * @returns 返回值说明
 */
```

### 9.2 代码审查清单

```markdown
## AI 生成代码注释审查清单

### 文件级别
- [ ] 文件头部有 @file 和 @description
- [ ] 导入部分有分组注释

### 类型定义
- [ ] interface/type 有注释
- [ ] 每个属性有注释

### 函数/方法
- [ ] 有 JSDoc 注释块
- [ ] 有函数描述
- [ ] 所有参数有 @param
- [ ] 返回值有 @returns
- [ ] 异常有 @throws

### 复杂逻辑
- [ ] 算法有说明注释
- [ ] 正则表达式有解析注释
- [ ] 循环/条件有目的说明
- [ ] 魔法数字有注释

### 语言规范
- [ ] 注释使用中文
- [ ] 术语使用准确
- [ ] 描述清晰易懂
```

## 10. 违规示例与修正

### 10.1 缺少函数注释

```typescript
// ❌ 违规：缺少函数注释
function calculateTotal(items, discount) {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 - discount)
}

// ✅ 正确：完整的函数注释
/**
 * 计算订单总金额
 * 
 * @description 根据商品列表和折扣比例计算最终金额
 * @param items - 商品列表，每个商品包含 price 属性
 * @param discount - 折扣比例，0-1 之间的小数
 * @returns 折扣后的总金额
 * 
 * @example
 * const total = calculateTotal([{ price: 100 }, { price: 200 }], 0.1)
 * // 返回: 270 (300 * 0.9)
 */
function calculateTotal(items: CartItem[], discount: number): number {
  // 计算商品原价总和
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  
  // 应用折扣
  return subtotal * (1 - discount)
}
```

### 10.2 缺少类型注释

```typescript
// ❌ 违规：类型定义缺少注释
interface Config {
  apiUrl: string
  timeout: number
  retryCount: number
  headers: Record<string, string>
}

// ✅ 正确：完整的类型注释
/**
 * API 客户端配置
 * 
 * @description 用于初始化 HTTP 请求客户端的配置选项
 */
interface Config {
  /** API 基础 URL，例如 https://api.example.com */
  apiUrl: string
  
  /** 请求超时时间，单位毫秒，默认 30000 */
  timeout: number
  
  /** 失败重试次数，默认 3 */
  retryCount: number
  
  /** 自定义请求头，会与默认请求头合并 */
  headers: Record<string, string>
}
```

### 10.3 复杂逻辑缺少注释

```typescript
// ❌ 违规：复杂逻辑没有注释
function processData(data) {
  return data
    .filter(x => x.status === 'active' && x.score > 60)
    .map(x => ({ ...x, level: x.score > 90 ? 'A' : x.score > 75 ? 'B' : 'C' }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

// ✅ 正确：完整的逻辑注释
/**
 * 处理学生数据，筛选并排名
 * 
 * @description
 * 处理步骤：
 * 1. 筛选：仅保留状态为 active 且分数大于 60 的学生
 * 2. 评级：根据分数添加等级（A/B/C）
 * 3. 排序：按分数从高到低排序
 * 4. 截取：只返回前 10 名
 * 
 * @param data - 原始学生数据列表
 * @returns 处理后的前 10 名学生列表
 */
function processData(data: Student[]): RankedStudent[] {
  return data
    // 步骤1：筛选有效学生（状态为 active 且及格）
    .filter(student => {
      const isActive = student.status === 'active'
      const isPassing = student.score > 60 // 60 分为及格线
      return isActive && isPassing
    })
    // 步骤2：添加评级
    .map(student => ({
      ...student,
      level: calculateLevel(student.score),
    }))
    // 步骤3：按分数降序排列
    .sort((a, b) => b.score - a.score)
    // 步骤4：只取前 10 名
    .slice(0, 10)
}

/**
 * 根据分数计算等级
 * 
 * @param score - 学生分数
 * @returns 等级：A (>90), B (>75), C (其他)
 */
function calculateLevel(score: number): 'A' | 'B' | 'C' {
  if (score > 90) return 'A'
  if (score > 75) return 'B'
  return 'C'
}
```

## 11. 总结

### 11.1 核心要求

1. **所有 AI 生成的代码必须包含中文注释**
2. **函数/方法必须有完整的 JSDoc 注释**
3. **类型定义必须有属性说明**
4. **复杂逻辑必须有行内注释**
5. **使用 ESLint 规则强制检查**

### 11.2 注释质量标准

| 标准 | 要求 |
|------|------|
| 完整性 | 所有公共 API 必须有注释 |
| 准确性 | 注释必须与代码行为一致 |
| 清晰性 | 注释必须易于理解 |
| 及时性 | 代码修改后注释必须同步更新 |
| 规范性 | 遵循 JSDoc 标准格式 |

### 11.3 执行保障

- ESLint 规则强制检查
- CI/CD 流程集成
- 代码审查必查项
- IDE 实时提示

