---
title: Vue 3 开发规范
description: Vue 3.x 组件开发规范和最佳实践，基于官方文档整理，重点介绍 Composition API
category: frontend
subcategory: vue
tags:
  - vue
  - vue3
  - composition-api
  - typescript
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Vue 3 开发规范

Vue 3 是一个渐进式 JavaScript 框架，用于构建用户界面。本规范基于 Vue 3 官方文档整理，重点介绍 Composition API 的使用规范。

## 1. 组件定义规范

### 1.1 Script Setup 语法（推荐）

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 计算属性
const doubled = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log(`初始值: ${count.value}`)
})
</script>

<template>
  <button @click="increment">
    Count: {{ count }}, Doubled: {{ doubled }}
  </button>
</template>

<style scoped>
button {
  padding: 8px 16px;
}
</style>
```

### 1.2 组件选项顺序（使用 setup() 函数时）

```vue
<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'MyComponent',
  
  components: {},
  
  props: {},
  
  emits: [],
  
  setup(props, { emit }) {
    const count = ref(0)
    
    // 返回需要暴露给模板的内容
    return {
      count
    }
  }
}
</script>
```

### 1.3 SFC 顶层元素顺序

```vue
<!-- ✅ 推荐顺序 -->
<script setup>
// ...
</script>

<template>
  <!-- ... -->
</template>

<style scoped>
/* ... */
</style>
```

## 2. 响应式 API 规范

### 2.1 ref vs reactive

```typescript
import { ref, reactive } from 'vue'

// ref：用于基本类型和需要重新赋值的场景
const count = ref(0)
const message = ref('Hello')

// 访问时需要 .value
count.value++
console.log(message.value)

// reactive：用于对象类型
const state = reactive({
  count: 0,
  user: {
    name: 'John',
    age: 25
  }
})

// 直接访问属性
state.count++
state.user.name = 'Jane'

// ⚠️ 注意：不能重新赋值整个对象
// state = { count: 1 } // 错误！会丢失响应性
```

### 2.2 ref 的使用场景

```typescript
import { ref } from 'vue'

// ✅ 基本类型
const count = ref(0)
const isLoading = ref(false)
const name = ref('')

// ✅ 需要重新赋值的数组
const list = ref<string[]>([])
list.value = ['a', 'b', 'c']

// ✅ 可能为 null 的对象
const user = ref<User | null>(null)
user.value = { name: 'John', age: 25 }
```

### 2.3 reactive 的使用场景

```typescript
import { reactive } from 'vue'

// ✅ 复杂状态对象
const state = reactive({
  user: {
    name: '',
    email: ''
  },
  settings: {
    theme: 'dark',
    language: 'zh-CN'
  }
})

// ✅ 表单数据
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})
```

### 2.4 toRef 和 toRefs

```typescript
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({
  foo: 1,
  bar: 2
})

// toRef：创建单个属性的 ref
const fooRef = toRef(state, 'foo')
fooRef.value++ // state.foo 也会更新

// toRefs：将 reactive 对象转换为普通对象，每个属性都是 ref
const { foo, bar } = toRefs(state)
foo.value++ // state.foo 也会更新

// 常用于 composables 返回值
function useFeature() {
  const state = reactive({
    x: 0,
    y: 0
  })
  
  return toRefs(state)
}

// 使用时可以解构
const { x, y } = useFeature()
```

## 3. 计算属性规范

### 3.1 基础用法

```typescript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(newValue: string) {
    const names = newValue.split(' ')
    firstName.value = names[0]
    lastName.value = names[names.length - 1]
  }
})
```

### 3.2 计算属性最佳实践

```typescript
import { ref, computed } from 'vue'

const items = ref<Item[]>([])
const searchQuery = ref('')

// ✅ 好的做法：纯计算，无副作用
const filteredItems = computed(() => {
  return items.value.filter(item => 
    item.name.includes(searchQuery.value)
  )
})

// ❌ 避免：在计算属性中有副作用
const badComputed = computed(() => {
  console.log('计算了！') // 副作用
  return items.value.length
})
```

## 4. 侦听器规范

### 4.1 watch 基础用法

```typescript
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`count 从 ${oldValue} 变为 ${newValue}`)
})

// 侦听 getter 函数
const x = ref(0)
const y = ref(0)

watch(
  () => x.value + y.value,
  (sum) => {
    console.log(`x + y = ${sum}`)
  }
)

// 侦听多个源
watch([x, y], ([newX, newY], [oldX, oldY]) => {
  console.log(`x: ${oldX} -> ${newX}, y: ${oldY} -> ${newY}`)
})
```

### 4.2 深度侦听

```typescript
import { reactive, watch } from 'vue'

const obj = reactive({ 
  count: 0,
  nested: { value: 1 }
})

// 直接侦听 reactive 对象会自动深度侦听
watch(obj, (newValue, oldValue) => {
  // 注意：newValue 和 oldValue 是同一个对象
  console.log('对象变化了')
})

// 侦听特定属性
watch(
  () => obj.count,
  (newCount) => {
    console.log(`count: ${newCount}`)
  }
)

// 手动开启深度侦听
watch(
  () => obj.nested,
  (newNested) => {
    console.log('nested 变化了')
  },
  { deep: true }
)
```

### 4.3 watchEffect

```typescript
import { ref, watchEffect } from 'vue'

const count = ref(0)
const message = ref('Hello')

// 自动追踪依赖
watchEffect(() => {
  console.log(`count: ${count.value}, message: ${message.value}`)
})

// 立即执行，并在依赖变化时重新执行

// 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    count.value++
  }, 1000)
  
  onCleanup(() => {
    clearInterval(timer)
  })
})
```

### 4.4 异步数据获取

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const question = ref('')
const answer = ref('问题通常包含问号 ;-)')
const loading = ref(false)

watch(question, async (newQuestion) => {
  if (newQuestion.includes('?')) {
    loading.value = true
    answer.value = '思考中...'
    
    try {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    } catch (error) {
      answer.value = '请求失败: ' + error
    } finally {
      loading.value = false
    }
  }
})
</script>
```

## 5. 生命周期规范

### 5.1 生命周期钩子

```typescript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue'

// 在 setup 中使用
onBeforeMount(() => {
  console.log('组件挂载前')
})

onMounted(() => {
  console.log('组件已挂载')
  // 适合：DOM 操作、第三方库初始化、API 请求
})

onBeforeUpdate(() => {
  console.log('组件更新前')
})

onUpdated(() => {
  console.log('组件已更新')
  // 避免在此修改状态
})

onBeforeUnmount(() => {
  console.log('组件卸载前')
  // 适合：清理定时器、解绑事件、取消订阅
})

onUnmounted(() => {
  console.log('组件已卸载')
})

// keep-alive 专用
onActivated(() => {
  console.log('组件被激活')
})

onDeactivated(() => {
  console.log('组件被停用')
})

// 错误处理
onErrorCaptured((err, instance, info) => {
  console.error('捕获到错误:', err)
  return false // 阻止错误继续传播
})
```

### 5.2 生命周期最佳实践

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

// ✅ 好的做法：在 onMounted 中初始化，在 onUnmounted 中清理
const chartRef = ref<HTMLElement | null>(null)
let chart: Chart | null = null

onMounted(() => {
  if (chartRef.value) {
    chart = new Chart(chartRef.value, {
      // 配置
    })
  }
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
```

## 6. Props 规范

### 6.1 TypeScript 类型定义

```vue
<script setup lang="ts">
// 使用 defineProps 定义 props
interface Props {
  title: string
  count?: number
  items: string[]
  user: {
    name: string
    age: number
  }
}

const props = defineProps<Props>()

// 带默认值
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
})
</script>
```

### 6.2 运行时声明

```vue
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  },
  status: {
    type: String,
    validator: (value) => ['pending', 'success', 'error'].includes(value)
  }
})
</script>
```

## 7. Emits 规范

### 7.1 定义和使用

```vue
<script setup lang="ts">
// TypeScript 类型定义
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
  (e: 'submit'): void
}>()

// 或运行时声明
const emit = defineEmits(['update', 'delete', 'submit'])

// 带验证的运行时声明
const emit = defineEmits({
  update: (value: string) => {
    return value.length > 0
  },
  delete: (id: number) => {
    return id > 0
  }
})

// 触发事件
function handleUpdate() {
  emit('update', 'new value')
}

function handleDelete(id: number) {
  emit('delete', id)
}
</script>
```

### 7.2 v-model 支持

```vue
<script setup lang="ts">
// 单个 v-model
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 多个 v-model
const props = defineProps<{
  firstName: string
  lastName: string
}>()

const emit = defineEmits<{
  (e: 'update:firstName', value: string): void
  (e: 'update:lastName', value: string): void
}>()
</script>

<template>
  <input
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
```

## 8. 依赖注入规范

### 8.1 provide/inject

```typescript
// 父组件
import { provide, ref } from 'vue'
import type { InjectionKey } from 'vue'

// 定义注入 key（推荐使用 Symbol）
export const countKey: InjectionKey<Ref<number>> = Symbol('count')

const count = ref(0)
provide(countKey, count)

// 子组件
import { inject } from 'vue'
import { countKey } from './keys'

const count = inject(countKey)

// 带默认值
const count = inject(countKey, ref(0))

// 确保非空
const count = inject(countKey)!
```

### 8.2 应用级 provide

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.provide('globalConfig', {
  theme: 'dark',
  language: 'zh-CN'
})

app.mount('#app')
```

## 9. 模板引用规范

### 9.1 基础用法

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 声明模板引用
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  // 组件挂载后才能访问
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="inputRef" />
</template>
```

### 9.2 组件引用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

function callChildMethod() {
  childRef.value?.someMethod()
}
</script>

<template>
  <ChildComponent ref="childRef" />
</template>
```

### 9.3 暴露组件方法

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

// 显式暴露给父组件
defineExpose({
  count,
  increment
})
</script>
```

## 10. 插槽规范

### 10.1 默认插槽

```vue
<!-- 子组件 -->
<template>
  <div class="card">
    <slot>默认内容</slot>
  </div>
</template>

<!-- 父组件 -->
<Card>
  <p>自定义内容</p>
</Card>
```

### 10.2 具名插槽

```vue
<!-- 子组件 BaseLayout.vue -->
<template>
  <div class="container">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<!-- 父组件 -->
<BaseLayout>
  <template #header>
    <h1>页面标题</h1>
  </template>

  <p>主要内容</p>

  <template #footer>
    <p>页脚信息</p>
  </template>
</BaseLayout>
```

### 10.3 作用域插槽

```vue
<!-- 子组件 -->
<script setup lang="ts">
interface Item {
  id: number
  text: string
  done: boolean
}

defineProps<{
  items: Item[]
}>()
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="index">
        {{ item.text }}
      </slot>
    </li>
  </ul>
</template>

<!-- 父组件 -->
<ItemList :items="items">
  <template #default="{ item, index }">
    <span :class="{ done: item.done }">
      {{ index + 1 }}. {{ item.text }}
    </span>
  </template>
</ItemList>
```

## 11. Composables 规范

### 11.1 基础 Composable

```typescript
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}

// 使用
const { x, y } = useMouse()
```

### 11.2 带参数的 Composable

```typescript
// composables/useFetch.ts
import { ref, watchEffect, toValue, type MaybeRefOrGetter } from 'vue'

export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function fetchData() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(toValue(url))
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error, loading, refetch: fetchData }
}

// 使用
const { data, error, loading } = useFetch<User[]>('/api/users')
```

### 11.3 Composable 命名规范

```typescript
// ✅ 好的命名：以 use 开头
export function useCounter() {}
export function useFetch() {}
export function useLocalStorage() {}

// ✅ 返回响应式状态
export function useCounter() {
  const count = ref(0)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,      // 响应式状态
    increment,  // 方法
    decrement   // 方法
  }
}
```

## 12. 样式规范

### 12.1 Scoped 样式

```vue
<style scoped>
.example {
  color: red;
}
</style>
```

### 12.2 深度选择器

```vue
<style scoped>
/* Vue 3 推荐写法 */
:deep(.child-class) {
  color: red;
}

/* 插槽内容 */
:slotted(.slot-class) {
  color: blue;
}

/* 全局样式 */
:global(.global-class) {
  color: green;
}
</style>
```

### 12.3 CSS v-bind

```vue
<script setup>
import { ref } from 'vue'

const color = ref('red')
const fontSize = ref(16)
</script>

<template>
  <p class="text">Hello</p>
</template>

<style scoped>
.text {
  color: v-bind(color);
  font-size: v-bind(fontSize + 'px');
}
</style>
```

## 13. 性能优化

### 13.1 代码分割

```typescript
// 路由懒加载
const UserDetails = () => import('./views/UserDetails.vue')

// 动态导入
async function loadModule() {
  const module = await import('./heavy-module.js')
  return module.default
}
```

### 13.2 v-memo

```vue
<template>
  <!-- 仅在 id 变化时重新渲染 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id]">
    {{ item.name }}
  </div>
</template>
```

### 13.3 shallowRef 和 shallowReactive

```typescript
import { shallowRef, shallowReactive } from 'vue'

// 只有 .value 的变化会触发更新
const state = shallowRef({ count: 0 })
state.value = { count: 1 } // 触发更新
state.value.count = 2 // 不触发更新

// 只有顶层属性的变化会触发更新
const obj = shallowReactive({ nested: { count: 0 } })
obj.nested = { count: 1 } // 触发更新
obj.nested.count = 2 // 不触发更新
```

## 14. TypeScript 集成

### 14.1 组件 Props 类型

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  disabled: false
})
</script>
```

### 14.2 事件类型

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()
</script>
```

### 14.3 Ref 类型

```typescript
import { ref } from 'vue'

// 自动推断
const count = ref(0) // Ref<number>

// 显式类型
const message = ref<string>('hello')

// 复杂类型
interface User {
  name: string
  age: number
}

const user = ref<User | null>(null)
```

## 15. 代码注释规范

```typescript
/**
 * 用户列表组件
 * @description 展示用户列表，支持分页和搜索
 */

import { ref, computed, onMounted } from 'vue'

interface Props {
  /** 每页显示数量 */
  pageSize?: number
  /** 是否显示搜索框 */
  showSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  showSearch: true
})

/**
 * 获取用户列表
 * @param page - 页码
 * @returns 用户列表
 */
async function fetchUsers(page: number): Promise<User[]> {
  // 实现逻辑
}
```

