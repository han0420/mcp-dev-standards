---
title: Tailwind CSS 开发规范
description: Tailwind CSS 的使用规范和最佳实践
category: frontend
subcategory: styles
tags:
  - tailwind
  - css
  - styling
  - utility-first
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Tailwind CSS 开发规范

本规范定义了 Tailwind CSS 的使用标准和最佳实践。

## 类名组织

### 推荐的类名顺序

按照以下顺序组织 Tailwind 类名：

1. **布局** (display, position, flex, grid)
2. **尺寸** (width, height, padding, margin)
3. **排版** (font, text, leading)
4. **背景** (bg, gradient)
5. **边框** (border, rounded)
6. **效果** (shadow, opacity)
7. **过渡/动画** (transition, animate)
8. **响应式/状态** (hover, focus, md:, lg:)

```html
<!-- ✅ 推荐：有组织的类名顺序 -->
<div class="
  flex items-center justify-between
  w-full max-w-md p-4 mx-auto
  text-sm font-medium text-gray-700
  bg-white
  border border-gray-200 rounded-lg
  shadow-sm
  transition-all duration-200
  hover:shadow-md hover:border-gray-300
">
  内容
</div>

<!-- ❌ 避免：混乱的类名顺序 -->
<div class="hover:shadow-md p-4 flex text-sm bg-white border shadow-sm rounded-lg w-full">
  内容
</div>
```

## 响应式设计

### Mobile First 原则

```html
<!-- ✅ 推荐：移动优先 -->
<div class="
  flex flex-col
  md:flex-row
  lg:gap-8
">
  <div class="w-full md:w-1/2 lg:w-1/3">侧边栏</div>
  <div class="w-full md:w-1/2 lg:w-2/3">主内容</div>
</div>

<!-- ❌ 避免：桌面优先 -->
<div class="flex-row flex-col-sm">
  <!-- 不符合 Tailwind 的设计理念 -->
</div>
```

### 断点使用

```html
<!-- 标准断点 -->
<div class="
  text-sm          <!-- 默认（移动端） -->
  sm:text-base     <!-- >= 640px -->
  md:text-lg       <!-- >= 768px -->
  lg:text-xl       <!-- >= 1024px -->
  xl:text-2xl      <!-- >= 1280px -->
  2xl:text-3xl     <!-- >= 1536px -->
">
  响应式文字
</div>
```

## 状态变体

### 交互状态

```html
<button class="
  bg-blue-500 text-white
  hover:bg-blue-600
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  active:bg-blue-700
  disabled:opacity-50 disabled:cursor-not-allowed
">
  按钮
</button>
```

### 组状态

```html
<!-- 使用 group 处理父子交互 -->
<a href="#" class="group block p-4 rounded-lg hover:bg-gray-50">
  <h3 class="text-lg font-semibold group-hover:text-blue-600">
    标题
  </h3>
  <p class="text-gray-500 group-hover:text-gray-700">
    描述文字
  </p>
</a>
```

### 同级状态

```html
<!-- 使用 peer 处理同级交互 -->
<input type="checkbox" class="peer sr-only" />
<label class="
  block p-4 border rounded-lg cursor-pointer
  peer-checked:border-blue-500 peer-checked:bg-blue-50
">
  选项
</label>
```

## 组件抽象

### 使用 @apply 抽取重复样式

```css
/* styles/components.css */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center
           px-4 py-2
           text-sm font-medium
           rounded-md
           transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply btn
           bg-blue-600 text-white
           hover:bg-blue-700
           focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply btn
           bg-gray-100 text-gray-700
           hover:bg-gray-200
           focus:ring-gray-500;
  }
}
```

### 何时使用 @apply

```css
/* ✅ 适合使用 @apply 的场景 */

/* 1. 高频复用的基础组件 */
.btn { @apply px-4 py-2 rounded-md font-medium; }

/* 2. 复杂的伪元素样式 */
.custom-checkbox::before {
  @apply absolute inset-0 bg-blue-500 rounded;
}

/* ❌ 避免使用 @apply 的场景 */

/* 1. 只用一次的样式 - 直接用类名 */
.unique-element { @apply p-4 text-lg; } /* 不必要 */

/* 2. 过度抽象 */
.text-blue-large { @apply text-blue-500 text-lg; } /* 过度抽象 */
```

## 颜色使用

### 使用语义化颜色

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // ✅ 语义化命名
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      }
    }
  }
}
```

```html
<!-- ✅ 使用语义化颜色 -->
<button class="bg-primary-500 hover:bg-primary-600">主要按钮</button>
<span class="text-success">成功</span>
<span class="text-error">错误</span>

<!-- ❌ 避免硬编码颜色 -->
<button class="bg-blue-500">按钮</button>
```

## 间距系统

### 一致的间距

```html
<!-- ✅ 使用一致的间距比例 -->
<div class="space-y-4">
  <div class="p-4">卡片 1</div>
  <div class="p-4">卡片 2</div>
  <div class="p-4">卡片 3</div>
</div>

<!-- 常用间距：4 (1rem), 6 (1.5rem), 8 (2rem) -->
```

### 负间距

```html
<!-- 用于重叠效果 -->
<div class="flex -space-x-2">
  <img class="w-8 h-8 rounded-full ring-2 ring-white" src="avatar1.jpg" />
  <img class="w-8 h-8 rounded-full ring-2 ring-white" src="avatar2.jpg" />
  <img class="w-8 h-8 rounded-full ring-2 ring-white" src="avatar3.jpg" />
</div>
```

## 暗色模式

### 系统偏好

```html
<!-- 自动跟随系统设置 -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <h1 class="text-gray-900 dark:text-white">标题</h1>
  <p class="text-gray-600 dark:text-gray-400">内容</p>
</div>
```

### 手动切换

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // 使用 class 策略
}
```

```html
<!-- 通过 class 控制 -->
<html class="dark">
  <body class="bg-white dark:bg-gray-900">
    <!-- 内容 -->
  </body>
</html>
```

## 动画

### 内置动画

```html
<!-- 加载动画 -->
<svg class="animate-spin h-5 w-5 text-blue-500">...</svg>

<!-- 脉冲动画 -->
<span class="animate-pulse bg-gray-200 rounded">加载中...</span>

<!-- 弹跳动画 -->
<div class="animate-bounce">↓</div>
```

### 自定义过渡

```html
<button class="
  transform
  transition-all duration-200 ease-in-out
  hover:scale-105 hover:-translate-y-0.5
  active:scale-95
">
  按钮
</button>
```

## 性能优化

### 清除未使用的样式

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,vue}',
    './public/index.html',
  ],
  // 生产环境自动清除未使用的样式
}
```

### 避免过多的类名

```html
<!-- ❌ 过多的类名 -->
<div class="p-1 p-2 p-3 p-4 text-sm text-base text-lg">
  <!-- 冗余的类名 -->
</div>

<!-- ✅ 简洁明了 -->
<div class="p-4 text-base">
  内容
</div>
```

## 常用模式

### 卡片

```html
<div class="
  bg-white rounded-lg shadow-md
  overflow-hidden
  transition-shadow duration-200
  hover:shadow-lg
">
  <img class="w-full h-48 object-cover" src="image.jpg" alt="" />
  <div class="p-4">
    <h3 class="text-lg font-semibold text-gray-900">标题</h3>
    <p class="mt-2 text-gray-600">描述内容</p>
  </div>
</div>
```

### 表单输入

```html
<input
  type="text"
  class="
    w-full px-3 py-2
    text-gray-900 placeholder-gray-400
    bg-white border border-gray-300 rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
  "
  placeholder="请输入..."
/>
```

### 徽章

```html
<span class="
  inline-flex items-center
  px-2.5 py-0.5
  text-xs font-medium
  bg-blue-100 text-blue-800
  rounded-full
">
  标签
</span>
```

