---
title: Vue 2 开发规范
description: Vue 2.x 组件开发规范和最佳实践，基于官方文档整理
category: frontend
subcategory: vue
tags:
  - vue
  - vue2
  - component
  - javascript
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Vue 2 开发规范

Vue.js 是一个渐进式 JavaScript 框架，以其易用性、灵活性和高性能著称。本规范基于 Vue 2.x 官方文档整理，适用于使用 Options API 的项目。

## 1. 组件定义规范

### 1.1 单文件组件结构

```vue
<template>
  <div class="my-component">
    <!-- 模板内容 -->
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  
  // 组件选项顺序（推荐）
  components: {},
  
  props: {},
  
  data() {
    return {}
  },
  
  computed: {},
  
  watch: {},
  
  // 生命周期钩子（按执行顺序）
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  
  methods: {}
}
</script>

<style scoped>
/* 样式 */
</style>
```

### 1.2 组件命名规范

```javascript
// ✅ 好的做法 - 使用 PascalCase
export default {
  name: 'TodoItem'
}

// ✅ 好的做法 - 多单词组件名
export default {
  name: 'TodoList'
}

// ❌ 避免 - 单个单词（可能与 HTML 元素冲突）
export default {
  name: 'Todo'
}
```

## 2. Props 规范

### 2.1 Props 定义

```javascript
export default {
  props: {
    // 基础类型检查
    propA: Number,
    
    // 多个可能的类型
    propB: [String, Number],
    
    // 必填的字符串
    propC: {
      type: String,
      required: true
    },
    
    // 带有默认值的数字
    propD: {
      type: Number,
      default: 100
    },
    
    // 带有默认值的对象
    propE: {
      type: Object,
      default() {
        return { message: 'hello' }
      }
    },
    
    // 自定义验证函数
    propF: {
      validator(value) {
        return ['success', 'warning', 'danger'].includes(value)
      }
    }
  }
}
```

### 2.2 Props 转换（使用计算属性）

```javascript
// ✅ 推荐：使用计算属性转换 props
export default {
  props: ['size'],
  computed: {
    normalizedSize() {
      return this.size.trim().toLowerCase()
    }
  }
}

// ❌ 不推荐：直接修改 props
export default {
  props: ['size'],
  mounted() {
    this.size = this.size.trim() // 错误！
  }
}
```

## 3. 计算属性规范

### 3.1 基础用法

```javascript
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  computed: {
    // 只读计算属性
    reversedMessage() {
      return this.message.split('').reverse().join('')
    }
  }
}
```

### 3.2 Getter 和 Setter

```javascript
export default {
  data() {
    return {
      firstName: 'Foo',
      lastName: 'Bar'
    }
  },
  computed: {
    fullName: {
      // getter
      get() {
        return this.firstName + ' ' + this.lastName
      },
      // setter
      set(newValue) {
        const names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    }
  }
}
```

### 3.3 计算属性 vs 方法

```javascript
export default {
  computed: {
    // ✅ 计算属性会缓存，依赖不变时不会重新计算
    computedNow() {
      return Date.now() // 注意：Date.now() 不是响应式的
    }
  },
  methods: {
    // 方法每次调用都会执行
    methodNow() {
      return Date.now()
    }
  }
}
```

## 4. 侦听器规范

### 4.1 基础用法

```javascript
export default {
  data() {
    return {
      question: ''
    }
  },
  watch: {
    // 简单侦听
    question(newVal, oldVal) {
      console.log('问题改变了:', newVal)
    }
  }
}
```

### 4.2 深度侦听

```javascript
export default {
  data() {
    return {
      user: {
        name: '',
        profile: {
          age: 0
        }
      }
    }
  },
  watch: {
    // 深度侦听对象
    user: {
      handler(newVal, oldVal) {
        console.log('用户信息改变了')
      },
      deep: true
    },
    
    // 侦听对象的特定属性
    'user.name'(newVal, oldVal) {
      console.log('用户名改变了:', newVal)
    }
  }
}
```

### 4.3 立即执行

```javascript
export default {
  watch: {
    searchQuery: {
      handler(newVal) {
        this.fetchResults(newVal)
      },
      immediate: true // 组件创建时立即执行
    }
  }
}
```

### 4.4 使用 $watch

```javascript
export default {
  mounted() {
    // 动态创建侦听器
    const unwatch = this.$watch('a.b.c', (newVal, oldVal) => {
      // do something
    })
    
    // 稍后停止侦听
    // unwatch()
  }
}
```

## 5. 生命周期规范

### 5.1 生命周期钩子

```javascript
export default {
  beforeCreate() {
    // 实例初始化之后，数据观测和事件配置之前
    // 此时 data 和 methods 都不可用
  },
  
  created() {
    // 实例创建完成后
    // 可以访问 data、computed、methods
    // 适合发起 API 请求
    this.fetchData()
  },
  
  beforeMount() {
    // 挂载开始之前
    // 模板编译完成，但尚未挂载到 DOM
  },
  
  mounted() {
    // 挂载完成后
    // 可以访问 DOM 元素
    // 适合初始化第三方库
    this.initChart()
  },
  
  beforeUpdate() {
    // 数据更新时，DOM 更新之前
  },
  
  updated() {
    // DOM 更新完成后
    // 避免在此修改数据，可能导致无限循环
  },
  
  beforeDestroy() {
    // 实例销毁之前
    // 适合清理定时器、解绑事件
    clearInterval(this.timer)
  },
  
  destroyed() {
    // 实例销毁后
  }
}
```

### 5.2 第三方库集成

```javascript
export default {
  mounted() {
    // 使用 $once 自动清理
    const picker = new Pikaday({
      field: this.$refs.input,
      format: 'YYYY-MM-DD'
    })
    
    this.$once('hook:beforeDestroy', () => {
      picker.destroy()
    })
  }
}
```

## 6. 事件处理规范

### 6.1 事件绑定

```html
<!-- 方法处理器 -->
<button @click="handleClick">点击</button>

<!-- 内联处理器 -->
<button @click="count++">增加</button>

<!-- 传递参数 -->
<button @click="handleClick($event, item)">点击</button>

<!-- 事件修饰符 -->
<form @submit.prevent="onSubmit">
  <button @click.stop="onClick">阻止冒泡</button>
  <input @keyup.enter="onEnter">
</form>
```

### 6.2 自定义事件

```javascript
// 子组件
export default {
  methods: {
    submit() {
      this.$emit('submit', this.formData)
    }
  }
}

// 父组件
<child-component @submit="handleSubmit" />
```

## 7. 插槽规范

### 7.1 默认插槽

```vue
<!-- 子组件 BaseLayout.vue -->
<template>
  <div class="container">
    <slot>默认内容</slot>
  </div>
</template>

<!-- 父组件使用 -->
<base-layout>
  <p>自定义内容</p>
</base-layout>
```

### 7.2 具名插槽

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

<!-- 父组件使用 -->
<base-layout>
  <template v-slot:header>
    <h1>页面标题</h1>
  </template>
  
  <p>主要内容</p>
  
  <template v-slot:footer>
    <p>页脚信息</p>
  </template>
</base-layout>
```

### 7.3 作用域插槽

```vue
<!-- 子组件 TodoList.vue -->
<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <slot :todo="todo">
        {{ todo.text }}
      </slot>
    </li>
  </ul>
</template>

<!-- 父组件使用 -->
<todo-list :todos="todos">
  <template v-slot:default="slotProps">
    <span :class="{ done: slotProps.todo.done }">
      {{ slotProps.todo.text }}
    </span>
  </template>
</todo-list>
```

## 8. 样式规范

### 8.1 Scoped 样式

```vue
<style scoped>
/* 只作用于当前组件 */
.example {
  color: red;
}
</style>
```

### 8.2 深度选择器

```vue
<style scoped>
/* 影响子组件 */
.parent >>> .child {
  color: red;
}

/* 或使用 /deep/ */
.parent /deep/ .child {
  color: red;
}

/* 或使用 ::v-deep */
::v-deep .child {
  color: red;
}
</style>
```

### 8.3 动态样式

```html
<!-- 对象语法 -->
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>

<!-- 数组语法（带前缀） -->
<div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>

<!-- 动态 class -->
<div :class="{ active: isActive, 'text-danger': hasError }"></div>
```

## 9. 混入规范

### 9.1 基础混入

```javascript
// mixins/formValidation.js
export const formValidation = {
  data() {
    return {
      errors: []
    }
  },
  methods: {
    validate() {
      this.errors = []
      // 验证逻辑
    }
  }
}

// 组件中使用
import { formValidation } from '@/mixins/formValidation'

export default {
  mixins: [formValidation],
  // ...
}
```

### 9.2 私有属性命名

```javascript
// ✅ 好的做法 - 使用 $_mixinName_propertyName 格式
const myMixin = {
  methods: {
    $_myMixin_update() {
      // 私有方法
    }
  }
}

// ❌ 避免 - 可能与 Vue 内部冲突
const myMixin = {
  methods: {
    _update() {}, // 可能与 Vue 冲突
    $update() {}  // 可能与 Vue 冲突
  }
}
```

## 10. 过渡动画规范

### 10.1 基础过渡

```vue
<template>
  <transition name="fade">
    <p v-if="show">Hello</p>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
```

### 10.2 列表过渡

```vue
<template>
  <transition-group name="list" tag="ul">
    <li v-for="item in items" :key="item.id" class="list-item">
      {{ item.text }}
    </li>
  </transition-group>
</template>

<style>
.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
```

## 11. 性能优化

### 11.1 v-if vs v-show

```html
<!-- v-if：条件为假时不渲染，适合不频繁切换 -->
<div v-if="isVisible">内容</div>

<!-- v-show：始终渲染，通过 CSS 控制显隐，适合频繁切换 -->
<div v-show="isVisible">内容</div>
```

### 11.2 列表渲染优化

```html
<!-- 始终使用 key -->
<li v-for="item in items" :key="item.id">
  {{ item.text }}
</li>

<!-- 避免 v-if 和 v-for 同时使用 -->
<!-- ❌ 不推荐 -->
<li v-for="user in users" v-if="user.isActive" :key="user.id">
  {{ user.name }}
</li>

<!-- ✅ 推荐：使用计算属性过滤 -->
<li v-for="user in activeUsers" :key="user.id">
  {{ user.name }}
</li>
```

### 11.3 组件懒加载

```javascript
// 路由懒加载
const UserDetails = () => import('./views/UserDetails.vue')

// 组件懒加载
export default {
  components: {
    AsyncComponent: () => import('./AsyncComponent.vue')
  }
}
```

## 12. 代码注释规范

```javascript
/**
 * 用户列表组件
 * @description 展示用户列表，支持分页和搜索
 */
export default {
  name: 'UserList',
  
  props: {
    /**
     * 每页显示数量
     * @type {number}
     * @default 10
     */
    pageSize: {
      type: Number,
      default: 10
    }
  },
  
  methods: {
    /**
     * 获取用户列表
     * @param {number} page - 页码
     * @returns {Promise<Array>} 用户列表
     */
    async fetchUsers(page) {
      // 实现逻辑
    }
  }
}
```

