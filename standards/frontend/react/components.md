---
title: React 组件开发规范
description: React 函数组件的编写规范和最佳实践
category: frontend
subcategory: react
tags:
  - react
  - component
  - hooks
  - typescript
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# React 组件开发规范

本规范定义了 React 函数组件的编写标准，基于 React 18+ 和 TypeScript。

## 组件结构

### 标准组件模板

```tsx
import { useState, useCallback, useMemo, type FC } from 'react'

// 类型定义
type UserCardProps = {
  /** 用户ID */
  userId: string
  /** 用户名 */
  name: string
  /** 头像URL */
  avatar?: string
  /** 是否显示详情 */
  showDetails?: boolean
  /** 点击回调 */
  onClick?: (userId: string) => void
  /** 子元素 */
  children?: React.ReactNode
}

/**
 * 用户卡片组件
 * 显示用户基本信息
 */
export const UserCard: FC<UserCardProps> = ({
  userId,
  name,
  avatar,
  showDetails = false,
  onClick,
  children
}) => {
  // 状态
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 计算值
  const displayName = useMemo(() => {
    return name.length > 20 ? `${name.slice(0, 20)}...` : name
  }, [name])
  
  // 事件处理
  const handleClick = useCallback(() => {
    onClick?.(userId)
  }, [onClick, userId])
  
  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])
  
  return (
    <div className="user-card" onClick={handleClick}>
      {avatar && <img src={avatar} alt={name} />}
      <span>{displayName}</span>
      {showDetails && (
        <button onClick={handleToggle}>
          {isExpanded ? '收起' : '展开'}
        </button>
      )}
      {children}
    </div>
  )
}
```

## 命名规范

### 组件命名

- 使用 **PascalCase** 命名组件
- 文件名与组件名一致
- 使用描述性名称

```tsx
// ✅ 正确
export const UserProfile = () => { ... }
export const SearchInput = () => { ... }
export const NavigationMenu = () => { ... }

// ❌ 错误
export const userProfile = () => { ... }  // 小写开头
export const UP = () => { ... }           // 缩写不清晰
export const Component1 = () => { ... }   // 无意义名称
```

### Props 命名

```tsx
type ButtonProps = {
  // ✅ 布尔值使用 is/has/can/should 前缀
  isLoading?: boolean
  isDisabled?: boolean
  hasError?: boolean
  canSubmit?: boolean
  
  // ✅ 事件处理使用 on 前缀
  onClick?: () => void
  onSubmit?: (data: FormData) => void
  onChange?: (value: string) => void
  
  // ✅ 渲染函数使用 render 前缀
  renderIcon?: () => React.ReactNode
  renderFooter?: (data: Data) => React.ReactNode
}
```

## Props 规范

### 使用 TypeScript 类型

```tsx
// ✅ 推荐：使用 type 定义 props
type CardProps = {
  title: string
  description?: string
  variant?: 'default' | 'outlined' | 'filled'
}

// ✅ 也可以使用 interface（需要扩展时）
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}
```

### 默认值设置

```tsx
// ✅ 推荐：在解构时设置默认值
const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...rest
}) => {
  return (
    <button className={`btn-${variant} btn-${size}`} {...rest}>
      {children}
    </button>
  )
}

// ❌ 避免：使用 defaultProps（已废弃）
Button.defaultProps = {
  variant: 'primary'
}
```

### Children Props

```tsx
// 明确 children 类型
type LayoutProps = {
  children: React.ReactNode  // 任意内容
}

type ListProps = {
  children: React.ReactElement[]  // 必须是元素数组
}

type RenderProps = {
  children: (data: Data) => React.ReactNode  // 渲染函数
}
```

## Hooks 使用规范

### useState

```tsx
// ✅ 明确类型
const [user, setUser] = useState<User | null>(null)
const [items, setItems] = useState<Item[]>([])

// ✅ 使用函数式更新避免闭包问题
setCount(prev => prev + 1)

// ✅ 复杂状态使用 useReducer
const [state, dispatch] = useReducer(reducer, initialState)
```

### useEffect

```tsx
// ✅ 单一职责
useEffect(() => {
  // 只做一件事：订阅数据
  const unsubscribe = subscribe(userId)
  return () => unsubscribe()
}, [userId])

// ✅ 正确的依赖数组
useEffect(() => {
  fetchUser(userId)
}, [userId])  // 包含所有依赖

// ❌ 避免：空依赖数组中使用外部变量
useEffect(() => {
  console.log(userId)  // userId 变化时不会重新执行
}, [])
```

### useCallback 和 useMemo

```tsx
// ✅ 传递给子组件的回调使用 useCallback
const handleSubmit = useCallback((data: FormData) => {
  onSubmit(data)
}, [onSubmit])

// ✅ 昂贵计算使用 useMemo
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}, [items])

// ❌ 避免过度优化简单操作
const doubled = useMemo(() => count * 2, [count])  // 不必要
```

### 自定义 Hooks

```tsx
// hooks/useUser.ts
export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    let cancelled = false
    
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const data = await api.getUser(userId)
        if (!cancelled) {
          setUser(data)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e as Error)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }
    
    fetchUser()
    
    return () => {
      cancelled = true
    }
  }, [userId])
  
  return { user, isLoading, error }
}
```

## 条件渲染

### 推荐模式

```tsx
// ✅ 短路求值
{isVisible && <Modal />}

// ✅ 三元表达式
{isLoading ? <Spinner /> : <Content />}

// ✅ 提前返回
if (isLoading) return <Spinner />
if (error) return <Error message={error.message} />
return <Content data={data} />

// ✅ 复杂条件抽取
const renderContent = () => {
  if (isLoading) return <Spinner />
  if (error) return <Error />
  if (!data) return <Empty />
  return <DataView data={data} />
}

return <div>{renderContent()}</div>
```

### 避免的模式

```tsx
// ❌ 避免：数字 0 会被渲染
{count && <Badge count={count} />}  // count=0 时显示 "0"

// ✅ 正确
{count > 0 && <Badge count={count} />}
{Boolean(count) && <Badge count={count} />}
```

## 列表渲染

### Key 的使用

```tsx
// ✅ 使用唯一且稳定的 key
{items.map(item => (
  <ListItem key={item.id} item={item} />
))}

// ❌ 避免使用 index 作为 key（除非列表是静态的）
{items.map((item, index) => (
  <ListItem key={index} item={item} />  // 排序/删除时会出问题
))}
```

## 事件处理

### 事件类型

```tsx
// ✅ 明确事件类型
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault()
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value)
}

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  // 提交逻辑
}
```

### 事件委托

```tsx
// ✅ 使用 data 属性进行事件委托
const handleItemClick = (e: React.MouseEvent<HTMLUListElement>) => {
  const target = e.target as HTMLElement
  const itemId = target.dataset.itemId
  if (itemId) {
    onSelect(itemId)
  }
}

return (
  <ul onClick={handleItemClick}>
    {items.map(item => (
      <li key={item.id} data-item-id={item.id}>{item.name}</li>
    ))}
  </ul>
)
```

## 性能优化

### React.memo

```tsx
// ✅ 纯展示组件使用 memo
export const ExpensiveList = memo(({ items }: { items: Item[] }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
})

// ✅ 自定义比较函数
export const UserCard = memo(
  ({ user }: { user: User }) => <div>{user.name}</div>,
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
)
```

### 懒加载

```tsx
import { lazy, Suspense } from 'react'

// 路由级别懒加载
const Dashboard = lazy(() => import('./pages/Dashboard'))

// 使用 Suspense 包裹
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

## 错误边界

```tsx
import { Component, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>出错了</div>
    }
    return this.props.children
  }
}
```

