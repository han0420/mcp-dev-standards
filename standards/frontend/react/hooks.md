---
title: React Hooks 开发规范
description: React 自定义 Hooks 的编写规范和最佳实践
category: frontend
subcategory: react
tags:
  - react
  - hooks
  - custom-hooks
  - typescript
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# React Hooks 开发规范

本规范定义了 React 自定义 Hooks 的编写标准和最佳实践。

## 基本规则

### Hooks 调用规则

1. **只在顶层调用 Hooks**
2. **只在 React 函数组件或自定义 Hooks 中调用**

```tsx
// ✅ 正确：顶层调用
const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])
  
  return user
}

// ❌ 错误：条件调用
const useUser = (userId: string) => {
  if (!userId) return null  // 提前返回后不能调用 hooks
  
  const [user, setUser] = useState<User | null>(null)  // 错误！
  // ...
}

// ✅ 正确：条件逻辑在 hooks 内部
const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    if (!userId) return  // 条件在 effect 内部
    fetchUser(userId).then(setUser)
  }, [userId])
  
  return user
}
```

## 命名规范

### 函数命名

- 必须以 `use` 开头
- 使用 camelCase
- 描述功能而非实现

```tsx
// ✅ 正确命名
useAuth()
useLocalStorage()
useDebounce()
useIntersectionObserver()
usePrevious()

// ❌ 错误命名
getAuth()           // 缺少 use 前缀
UseAuth()           // 不应大写
use_auth()          // 不应使用下划线
useGetUserFromAPI() // 过于冗长
```

### 文件结构

```
hooks/
  useAuth.ts
  useLocalStorage.ts
  useDebounce.ts
  useFetch.ts
  index.ts          # 统一导出
```

## 返回值设计

### 返回对象

```tsx
// ✅ 推荐：返回对象（易于扩展和解构）
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)
  
  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  
  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue
  }
}

// 使用
const { value: isOpen, toggle, setFalse: close } = useToggle()
```

### 返回元组（特定场景）

```tsx
// 简单状态可以返回元组
export const useBoolean = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue(v => !v), [])
  
  return [value, toggle, setValue] as const
}

// 使用
const [isOpen, toggleOpen] = useBoolean()
```

## 类型定义

### 明确的返回类型

```tsx
type UseCounterReturn = {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  set: (value: number) => void
}

export const useCounter = (initialValue = 0): UseCounterReturn => {
  const [count, setCount] = useState(initialValue)
  
  const increment = useCallback(() => setCount(c => c + 1), [])
  const decrement = useCallback(() => setCount(c => c - 1), [])
  const reset = useCallback(() => setCount(initialValue), [initialValue])
  const set = useCallback((value: number) => setCount(value), [])
  
  return { count, increment, decrement, reset, set }
}
```

### 泛型 Hooks

```tsx
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })
  
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      return valueToStore
    })
  }, [key])
  
  return [storedValue, setValue]
}
```

## 常用 Hooks 模式

### useFetch - 数据请求

```tsx
type UseFetchOptions<T> = {
  immediate?: boolean
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

type UseFetchReturn<T> = {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useFetch = <T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> => {
  const { immediate = true, initialData = null, onSuccess, onError } = options
  
  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetcher()
      setData(result)
      onSuccess?.(result)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }, [fetcher, onSuccess, onError])
  
  useEffect(() => {
    if (immediate) {
      refetch()
    }
  }, [immediate, refetch])
  
  return { data, isLoading, error, refetch }
}
```

### useDebounce - 防抖

```tsx
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}

// 防抖函数版本
export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const callbackRef = useRef(callback)
  callbackRef.current = callback
  
  return useCallback(
    ((...args) => {
      const timer = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
      return () => clearTimeout(timer)
    }) as T,
    [delay]
  )
}
```

### useThrottle - 节流

```tsx
export const useThrottle = <T>(value: T, interval: number): T => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef(Date.now())
  
  useEffect(() => {
    const now = Date.now()
    
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - (now - lastUpdated.current))
      
      return () => clearTimeout(timer)
    }
  }, [value, interval])
  
  return throttledValue
}
```

### usePrevious - 获取上一个值

```tsx
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}
```

### useClickOutside - 点击外部

```tsx
export const useClickOutside = <T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> => {
  const ref = useRef<T>(null)
  
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }
    
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [callback])
  
  return ref
}
```

### useMediaQuery - 媒体查询

```tsx
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])
  
  return matches
}

// 使用
const isMobile = useMediaQuery('(max-width: 768px)')
```

### useIntersectionObserver - 交叉观察

```tsx
type UseIntersectionObserverOptions = {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export const useIntersectionObserver = <T extends Element>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean] => {
  const ref = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    )
    
    observer.observe(element)
    return () => observer.disconnect()
  }, [options.threshold, options.root, options.rootMargin])
  
  return [ref, isIntersecting]
}
```

## 副作用清理

### 必须清理的场景

```tsx
// 订阅
useEffect(() => {
  const subscription = eventEmitter.subscribe(handler)
  return () => subscription.unsubscribe()  // ✅ 清理
}, [])

// 定时器
useEffect(() => {
  const timer = setInterval(callback, 1000)
  return () => clearInterval(timer)  // ✅ 清理
}, [])

// 事件监听
useEffect(() => {
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)  // ✅ 清理
}, [])

// 异步操作
useEffect(() => {
  let cancelled = false
  
  fetchData().then(data => {
    if (!cancelled) {  // ✅ 检查是否已取消
      setData(data)
    }
  })
  
  return () => { cancelled = true }
}, [])
```

## 测试

### Hook 测试示例

```tsx
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })
  
  it('should increment', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
  
  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10))
    
    act(() => {
      result.current.increment()
      result.current.reset()
    })
    
    expect(result.current.count).toBe(10)
  })
})
```

