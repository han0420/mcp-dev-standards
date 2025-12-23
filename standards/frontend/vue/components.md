---
title: Vue 3 组件开发规范
description: Vue 3 组件的编写规范和最佳实践
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

本规范定义了 Vue 3 组件的编写标准，确保代码一致性和可维护性。

## 组件结构

### 推荐使用 `<script setup>` 语法

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'

// Props 定义
const props = defineProps<{
  title: string
  count?: number
}>()

// Emits 定义
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'close'): void
}>()

// 响应式状态
const isLoading = ref(false)
const items = ref<string[]>([])

// 计算属性
const displayTitle = computed(() => `${props.title} (${props.count ?? 0})`)

// 方法
const handleClick = () => {
  emit('update', 1)
}

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<template>
  <div class="component-name">
    <h1>{{ displayTitle }}</h1>
    <button @click="handleClick">点击</button>
  </div>
</template>

<style scoped>
.component-name {
  /* 样式 */
}
</style>
```

## 命名规范

### 组件文件命名

- 使用 **PascalCase** 命名组件文件：`UserProfile.vue`、`SearchInput.vue`
- 基础组件使用 `Base` 前缀：`BaseButton.vue`、`BaseInput.vue`
- 单例组件使用 `The` 前缀：`TheHeader.vue`、`TheSidebar.vue`

### Props 命名

- 使用 **camelCase** 命名 props
- 布尔类型使用 `is`、`has`、`can` 前缀

```typescript
// ✅ 正确
defineProps<{
  userName: string
  isVisible: boolean
  hasError: boolean
  canEdit: boolean
}>()

// ❌ 错误
defineProps<{
  user_name: string
  visible: boolean
  error: boolean
}>()
```

### Events 命名

- 使用 **kebab-case** 命名事件
- 使用动词开头：`update:modelValue`、`item-click`、`form-submit`

## Props 规范

### 必须定义类型

```typescript
// ✅ 使用 TypeScript 类型定义
defineProps<{
  title: string
  items: Item[]
  config?: Config
}>()

// ✅ 使用 withDefaults 设置默认值
const props = withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}>(), {
  size: 'medium',
  disabled: false
})
```

### Props 验证

```typescript
// 复杂类型使用 PropType
import type { PropType } from 'vue'

defineProps({
  user: {
    type: Object as PropType<User>,
    required: true,
    validator: (value: User) => value.id > 0
  }
})
```

## Composables 使用规范

### 命名规范

- 使用 `use` 前缀：`useUser`、`useAuth`、`useFetch`

### 结构规范

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue'

export const useCounter = (initialValue = 0) => {
  const count = ref(initialValue)
  
  const doubleCount = computed(() => count.value * 2)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement
  }
}
```

## 模板规范

### 指令缩写

```vue
<!-- ✅ 使用缩写 -->
<input :value="name" @input="onInput" />

<!-- ❌ 避免完整写法 -->
<input v-bind:value="name" v-on:input="onInput" />
```

### v-for 必须使用 key

```vue
<!-- ✅ 正确 -->
<li v-for="item in items" :key="item.id">{{ item.name }}</li>

<!-- ❌ 错误 -->
<li v-for="item in items">{{ item.name }}</li>
```

### 避免 v-if 和 v-for 同时使用

```vue
<!-- ✅ 使用计算属性过滤 -->
<script setup>
const visibleItems = computed(() => items.filter(item => item.isVisible))
</script>
<template>
  <li v-for="item in visibleItems" :key="item.id">{{ item.name }}</li>
</template>

<!-- ❌ 避免同时使用 -->
<li v-for="item in items" v-if="item.isVisible" :key="item.id">{{ item.name }}</li>
```

## 样式规范

### 使用 scoped 样式

```vue
<style scoped>
.component-name {
  /* 组件样式 */
}
</style>
```

### 深度选择器

```vue
<style scoped>
/* 使用 :deep() 修改子组件样式 */
:deep(.child-class) {
  color: red;
}
</style>
```

## 性能优化

### 使用 shallowRef 处理大型对象

```typescript
import { shallowRef } from 'vue'

// 大型列表使用 shallowRef
const largeList = shallowRef<Item[]>([])
```

### 使用 v-once 和 v-memo

```vue
<!-- 静态内容使用 v-once -->
<span v-once>{{ staticContent }}</span>

<!-- 条件性缓存使用 v-memo -->
<div v-memo="[item.id]">{{ item.name }}</div>
```

