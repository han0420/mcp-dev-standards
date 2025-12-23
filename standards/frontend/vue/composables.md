---
title: Vue 3 Composables 开发规范
description: Vue 3 组合式函数的编写规范和最佳实践
category: frontend
subcategory: vue
tags:
  - vue
  - vue3
  - composables
  - composition-api
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Vue 3 Composables 开发规范

Composables（组合式函数）是 Vue 3 Composition API 的核心概念，用于封装和复用有状态的逻辑。

## 基本结构

### 标准 Composable 模板

```typescript
// composables/useFeature.ts
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'

// 类型定义
type UseFeatureOptions = {
  immediate?: boolean
  onSuccess?: (data: Data) => void
  onError?: (error: Error) => void
}

type UseFeatureReturn = {
  // 状态
  data: Ref<Data | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  
  // 计算属性
  isEmpty: ComputedRef<boolean>
  
  // 方法
  execute: () => Promise<void>
  reset: () => void
}

export const useFeature = (
  options: UseFeatureOptions = {}
): UseFeatureReturn => {
  const { immediate = true, onSuccess, onError } = options
  
  // 响应式状态
  const data = ref<Data | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  // 计算属性
  const isEmpty = computed(() => data.value === null)
  
  // 核心方法
  const execute = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await fetchData()
      data.value = result
      onSuccess?.(result)
    } catch (e) {
      error.value = e as Error
      onError?.(e as Error)
    } finally {
      isLoading.value = false
    }
  }
  
  const reset = () => {
    data.value = null
    error.value = null
    isLoading.value = false
  }
  
  // 生命周期
  if (immediate) {
    onMounted(execute)
  }
  
  // 返回值
  return {
    data,
    isLoading,
    error,
    isEmpty,
    execute,
    reset
  }
}
```

## 命名规范

### 函数命名

- 必须使用 `use` 前缀
- 使用 camelCase 命名
- 名称应描述功能而非实现

```typescript
// ✅ 正确命名
useAuth()
useUser()
useFetch()
useLocalStorage()
useDebounce()

// ❌ 错误命名
auth()           // 缺少 use 前缀
UseAuth()        // 不应使用 PascalCase
use_auth()       // 不应使用 snake_case
useGetUserData() // 过于冗长
```

### 文件命名

```
composables/
  useAuth.ts        # 认证相关
  useUser.ts        # 用户相关
  useFetch.ts       # 数据请求
  useStorage.ts     # 存储相关
  index.ts          # 统一导出
```

## 参数设计

### 使用 Options 对象

```typescript
// ✅ 推荐：使用 options 对象
export const useFetch = <T>(
  url: string | Ref<string>,
  options: UseFetchOptions<T> = {}
) => {
  const {
    immediate = true,
    initialData = null,
    timeout = 5000,
    onSuccess,
    onError
  } = options
  // ...
}

// ❌ 避免：过多位置参数
export const useFetch = <T>(
  url: string,
  immediate: boolean,
  initialData: T | null,
  timeout: number,
  onSuccess: Function,
  onError: Function
) => {
  // ...
}
```

### 支持响应式参数

```typescript
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useTitle = (
  title: MaybeRefOrGetter<string>
) => {
  watch(
    () => toValue(title),
    (newTitle) => {
      document.title = newTitle
    },
    { immediate: true }
  )
}

// 使用方式
useTitle('静态标题')
useTitle(titleRef)
useTitle(() => `${page.value} - 网站名`)
```

## 返回值设计

### 返回对象而非数组

```typescript
// ✅ 推荐：返回对象（可解构、可扩展）
export const useCounter = () => {
  const count = ref(0)
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return { count, increment, decrement }
}

// 使用时可选择性解构
const { count } = useCounter()
const counter = useCounter() // 也可以整体使用

// ❌ 避免：返回数组（不够灵活）
export const useCounter = () => {
  return [count, increment, decrement]
}
```

### 明确的类型定义

```typescript
type UseCounterReturn = {
  count: Ref<number>
  doubleCount: ComputedRef<number>
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useCounter = (initial = 0): UseCounterReturn => {
  // 实现...
}
```

## 副作用处理

### 清理副作用

```typescript
export const useEventListener = <K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void
) => {
  onMounted(() => {
    window.addEventListener(event, handler)
  })
  
  // ✅ 必须清理副作用
  onUnmounted(() => {
    window.removeEventListener(event, handler)
  })
}
```

### 使用 watchEffect 自动清理

```typescript
export const useInterval = (
  callback: () => void,
  interval: MaybeRefOrGetter<number>
) => {
  const isActive = ref(true)
  
  watchEffect((onCleanup) => {
    if (!isActive.value) return
    
    const timer = setInterval(callback, toValue(interval))
    
    // 自动清理
    onCleanup(() => clearInterval(timer))
  })
  
  const pause = () => { isActive.value = false }
  const resume = () => { isActive.value = true }
  
  return { isActive, pause, resume }
}
```

## 异步 Composables

### 标准异步模式

```typescript
export const useAsyncData = <T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions = {}
) => {
  const { immediate = true } = options
  
  const data = ref<T | null>(null) as Ref<T | null>
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const isReady = computed(() => !isLoading.value && !error.value)
  
  const execute = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      isLoading.value = false
    }
  }
  
  const refresh = () => execute()
  
  if (immediate) {
    execute()
  }
  
  return {
    data,
    isLoading,
    error,
    isReady,
    execute,
    refresh
  }
}
```

## 组合 Composables

### 在 Composable 中使用其他 Composables

```typescript
import { useLocalStorage } from './useLocalStorage'
import { useDebounce } from './useDebounce'

export const useSearchHistory = () => {
  // 组合其他 composables
  const { value: history, setValue } = useLocalStorage<string[]>(
    'search-history',
    []
  )
  
  const addToHistory = (term: string) => {
    const newHistory = [term, ...history.value.filter(h => h !== term)]
    setValue(newHistory.slice(0, 10))
  }
  
  // 使用防抖
  const debouncedAdd = useDebounce(addToHistory, 300)
  
  return {
    history,
    addToHistory: debouncedAdd,
    clearHistory: () => setValue([])
  }
}
```

## 测试规范

### Composable 单元测试

```typescript
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })
  
  it('should initialize with custom value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })
  
  it('should increment', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })
})
```

