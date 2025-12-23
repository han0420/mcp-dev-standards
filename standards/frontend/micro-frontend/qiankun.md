---
title: Qiankun 微前端开发规范
description: Qiankun 微前端框架的开发规范和最佳实践，基于官方文档整理
category: frontend
subcategory: micro-frontend
tags:
  - qiankun
  - micro-frontend
  - 微前端
  - single-spa
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Qiankun 微前端开发规范

Qiankun（乾坤）是一款基于 single-spa 的微前端实现库，提供了更加简单、无痛的接入方式。本规范基于 qiankun 官方文档整理，涵盖主应用和子应用的配置规范。

## 1. 项目结构规范

### 1.1 推荐的项目结构

```
micro-frontend-project/
├── main-app/                 # 主应用（基座）
│   ├── src/
│   │   ├── micro-apps/       # 微应用注册配置
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── sub-app-react/            # React 子应用
│   ├── src/
│   │   ├── public-path.js    # 动态 publicPath
│   │   ├── App.tsx
│   │   └── index.tsx         # 入口文件，导出生命周期
│   └── package.json
├── sub-app-vue/              # Vue 子应用
│   ├── src/
│   │   ├── public-path.js
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
└── shared/                   # 共享模块
    ├── utils/
    └── components/
```

## 2. 主应用配置规范

### 2.1 安装依赖

```bash
npm install qiankun
# 或
yarn add qiankun
# 或
pnpm add qiankun
```

### 2.2 注册微应用

```typescript
// src/micro-apps/index.ts
import { registerMicroApps, start, addGlobalUncaughtErrorHandler } from 'qiankun'

// 微应用配置列表
const microApps = [
  {
    name: 'react-app',           // 应用名称（必须唯一）
    entry: '//localhost:7100',   // 应用入口（支持 HTML 或 JS）
    container: '#subapp-container', // 挂载容器
    activeRule: '/react',        // 激活规则（路由匹配）
    props: {                     // 传递给子应用的数据
      routerBase: '/react',
      getGlobalState: () => globalState,
    },
  },
  {
    name: 'vue-app',
    entry: '//localhost:7200',
    container: '#subapp-container',
    activeRule: '/vue',
    props: {
      routerBase: '/vue',
    },
  },
]

// 注册微应用
registerMicroApps(microApps, {
  // 生命周期钩子（可选）
  beforeLoad: [
    (app) => {
      console.log('[主应用] 加载前:', app.name)
      return Promise.resolve()
    },
  ],
  beforeMount: [
    (app) => {
      console.log('[主应用] 挂载前:', app.name)
      return Promise.resolve()
    },
  ],
  afterMount: [
    (app) => {
      console.log('[主应用] 挂载后:', app.name)
      return Promise.resolve()
    },
  ],
  afterUnmount: [
    (app) => {
      console.log('[主应用] 卸载后:', app.name)
      return Promise.resolve()
    },
  ],
})

// 全局错误处理
addGlobalUncaughtErrorHandler((event) => {
  console.error('[qiankun] 全局错误:', event)
})

// 导出启动函数
export function startQiankun() {
  start({
    prefetch: 'all',           // 预加载策略
    sandbox: {
      strictStyleIsolation: true,  // 严格样式隔离
      experimentalStyleIsolation: true, // 实验性样式隔离
    },
    singular: true,            // 单例模式
  })
}
```

### 2.3 启动配置选项

```typescript
import { start } from 'qiankun'

start({
  // 预加载策略
  // - true: 主应用 start 后即开始预加载所有子应用
  // - 'all': 加载所有子应用静态资源
  // - string[]: 加载指定子应用静态资源
  // - false: 关闭预加载
  prefetch: 'all',

  // 沙箱配置
  sandbox: {
    // 严格样式隔离（Shadow DOM）
    strictStyleIsolation: true,
    // 实验性样式隔离（添加属性选择器前缀）
    experimentalStyleIsolation: true,
  },

  // 是否为单例模式
  singular: true,

  // 自定义 fetch 函数（处理跨域）
  fetch(url, ...args) {
    if (url.includes('//app.example.com')) {
      return window.fetch(url, {
        ...args,
        mode: 'cors',
        credentials: 'include',
      })
    }
    return window.fetch(url, ...args)
  },

  // 获取模板的方法
  getTemplate: (tpl) => tpl,

  // 获取 publicPath 的方法
  getPublicPath: (entry) => entry,

  // 排除特定资源的沙箱
  excludeAssetFilter: (url) => url.includes('analytics'),
})
```

### 2.4 手动加载微应用

```tsx
// 适用于非路由激活场景
import { loadMicroApp } from 'qiankun'
import React from 'react'

class MicroAppContainer extends React.Component {
  containerRef = React.createRef<HTMLDivElement>()
  microApp: any = null

  componentDidMount() {
    // 手动加载微应用
    this.microApp = loadMicroApp({
      name: 'dialog-app',
      entry: '//localhost:7300',
      container: this.containerRef.current!,
      props: {
        brand: 'qiankun',
        onClose: () => this.handleClose(),
      },
    })
  }

  componentWillUnmount() {
    // 卸载微应用
    this.microApp?.unmount()
  }

  componentDidUpdate(prevProps: any) {
    // 更新微应用 props
    if (prevProps.data !== this.props.data) {
      this.microApp?.update({ data: this.props.data })
    }
  }

  handleClose() {
    this.microApp?.unmount()
  }

  render() {
    return <div ref={this.containerRef} />
  }
}
```

### 2.5 预加载微应用

```typescript
import { prefetchApps } from 'qiankun'

// 手动预加载指定微应用
prefetchApps([
  { name: 'app1', entry: '//localhost:7001' },
  { name: 'app2', entry: '//localhost:7002' },
])
```

## 3. React 子应用配置规范

### 3.1 配置动态 publicPath

```javascript
// src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  // 动态设置 webpack publicPath
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}
```

### 3.2 修改入口文件

```tsx
// src/index.tsx
import './public-path'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

let root: ReactDOM.Root | null = null

/**
 * 渲染函数
 * @param props - qiankun 传递的 props
 */
function render(props: any = {}) {
  const { container } = props
  const rootElement = container
    ? container.querySelector('#root')
    : document.querySelector('#root')

  root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

/**
 * bootstrap 只会在微应用初始化时调用一次
 * 下次进入会直接调用 mount，不会再触发 bootstrap
 * 通常用于全局变量初始化、缓存等
 */
export async function bootstrap() {
  console.log('[react] app bootstraped')
}

/**
 * 应用每次进入都会调用 mount 方法
 * 通常在这里触发应用的渲染
 */
export async function mount(props: any) {
  console.log('[react] props from main framework', props)
  render(props)
}

/**
 * 应用每次切出/卸载时调用
 * 通常在这里卸载应用实例
 */
export async function unmount(props: any) {
  const { container } = props
  root?.unmount()
  root = null
}

/**
 * 可选生命周期，仅使用 loadMicroApp 方式加载时生效
 */
export async function update(props: any) {
  console.log('[react] update props', props)
}
```

### 3.3 Webpack 配置（Create React App）

```javascript
// .rescriptsrc.js 或 config-overrides.js
const { name } = require('./package.json')

module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`
    config.output.libraryTarget = 'umd'
    // Webpack 5 使用 chunkLoadingGlobal
    config.output.chunkLoadingGlobal = `webpackJsonp_${name}`
    // Webpack 4 使用 jsonpFunction
    // config.output.jsonpFunction = `webpackJsonp_${name}`
    config.output.globalObject = 'window'

    return config
  },

  devServer: (config) => {
    // 允许跨域
    config.headers = {
      'Access-Control-Allow-Origin': '*',
    }
    config.historyApiFallback = true
    config.hot = false
    config.liveReload = false

    return config
  },
}
```

### 3.4 Vite 配置（React）

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    react(),
    qiankun('react-app', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 7100,
    cors: true,
    origin: 'http://localhost:7100',
  },
})
```

## 4. Vue 子应用配置规范

### 4.1 配置动态 publicPath

```javascript
// src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}
```

### 4.2 修改入口文件（Vue 2）

```javascript
// src/main.js
import './public-path'
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import routes from './router'
import store from './store'

Vue.config.productionTip = false

let router = null
let instance = null

/**
 * 渲染函数
 */
function render(props = {}) {
  const { container } = props

  router = new VueRouter({
    // qiankun 环境下使用子应用路由前缀
    base: window.__POWERED_BY_QIANKUN__ ? '/vue/' : '/',
    mode: 'history',
    routes,
  })

  instance = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// 导出生命周期钩子
export async function bootstrap() {
  console.log('[vue] app bootstraped')
}

export async function mount(props) {
  console.log('[vue] props from main framework', props)
  render(props)
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
  router = null
}
```

### 4.3 修改入口文件（Vue 3）

```typescript
// src/main.ts
import './public-path'
import { createApp, App as VueApp } from 'vue'
import { createRouter, createWebHistory, Router } from 'vue-router'
import App from './App.vue'
import routes from './router'
import { createPinia, Pinia } from 'pinia'

let app: VueApp<Element> | null = null
let router: Router | null = null
let pinia: Pinia | null = null

/**
 * 渲染函数
 */
function render(props: any = {}) {
  const { container } = props

  router = createRouter({
    history: createWebHistory(
      window.__POWERED_BY_QIANKUN__ ? '/vue/' : '/'
    ),
    routes,
  })

  pinia = createPinia()

  app = createApp(App)
  app.use(router)
  app.use(pinia)

  const mountElement = container
    ? container.querySelector('#app')
    : document.querySelector('#app')

  app.mount(mountElement)
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// 导出生命周期钩子
export async function bootstrap() {
  console.log('[vue3] app bootstraped')
}

export async function mount(props: any) {
  console.log('[vue3] props from main framework', props)
  render(props)
}

export async function unmount() {
  app?.unmount()
  app = null
  router = null
  pinia = null
}

export async function update(props: any) {
  console.log('[vue3] update props', props)
}
```

### 4.4 Vue CLI 配置

```javascript
// vue.config.js
const { name } = require('./package.json')

module.exports = {
  devServer: {
    port: 7200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      // Webpack 5
      chunkLoadingGlobal: `webpackJsonp_${name}`,
      // Webpack 4
      // jsonpFunction: `webpackJsonp_${name}`,
    },
  },
}
```

### 4.5 Vite 配置（Vue 3）

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('vue-app', {
      useDevMode: true,
    }),
  ],
  server: {
    port: 7200,
    cors: true,
    origin: 'http://localhost:7200',
  },
})
```

## 5. Angular 子应用配置规范

### 5.1 修改入口文件

```typescript
// src/main.ts
import './public-path'
import { enableProdMode, NgModuleRef } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}

let app: NgModuleRef<AppModule> | null = null

async function render() {
  app = await platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => {
      console.error(err)
      return null
    })
}

// 独立运行时
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render()
}

// 导出生命周期钩子
export async function bootstrap(props: object) {
  console.log('[angular] app bootstraped', props)
}

export async function mount(props: object) {
  console.log('[angular] props from main framework', props)
  await render()
}

export async function unmount(props: object) {
  console.log('[angular] unmount', props)
  app?.destroy()
  app = null
}
```

### 5.2 修改组件选择器

```typescript
// src/app/app.component.ts
import { Component } from '@angular/core'

@Component({
  // 添加唯一 ID 前缀，避免冲突
  selector: '#angular-app app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-app'
}
```

## 6. 非 Webpack 项目配置

### 6.1 纯 HTML + jQuery

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
  <div id="purehtml-container"></div>

  <script>
    // 渲染函数
    const render = ($) => {
      $('#purehtml-container').html('Hello, render with jQuery')
      return Promise.resolve()
    }

    // 暴露生命周期到全局
    ;((global) => {
      global['purehtml'] = {
        bootstrap: () => {
          console.log('purehtml bootstrap')
          return Promise.resolve()
        },
        mount: () => {
          console.log('purehtml mount')
          return render($)
        },
        unmount: () => {
          console.log('purehtml unmount')
          $('#purehtml-container').html('')
          return Promise.resolve()
        },
      }
    })(window)
  </script>
</body>
</html>
```

### 6.2 主应用注册配置

```typescript
registerMicroApps([
  {
    name: 'purehtml',
    entry: '//localhost:7500',
    container: '#subapp-container',
    activeRule: '/purehtml',
  },
])
```

## 7. 应用间通信规范

### 7.1 使用 props 传递

```typescript
// 主应用
registerMicroApps([
  {
    name: 'sub-app',
    entry: '//localhost:7100',
    container: '#container',
    activeRule: '/sub',
    props: {
      // 传递数据
      userInfo: { name: 'John', role: 'admin' },
      // 传递方法
      onLogout: () => {
        console.log('logout from main app')
      },
      // 传递状态管理
      getGlobalState: () => store.getState(),
      setGlobalState: (state) => store.setState(state),
    },
  },
])
```

```typescript
// 子应用
export async function mount(props) {
  const { userInfo, onLogout, getGlobalState } = props

  console.log('User:', userInfo)
  console.log('Global State:', getGlobalState())

  // 使用传递的方法
  document.getElementById('logout-btn')?.addEventListener('click', onLogout)

  render(props)
}
```

### 7.2 使用 initGlobalState

```typescript
// 主应用
import { initGlobalState, MicroAppStateActions } from 'qiankun'

// 初始化全局状态
const actions: MicroAppStateActions = initGlobalState({
  user: null,
  token: '',
  theme: 'light',
})

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听到状态变化:', state, prev)
})

// 修改状态
actions.setGlobalState({
  user: { name: 'John' },
})

// 导出给子应用使用
export { actions }
```

```typescript
// 子应用
export async function mount(props) {
  const { onGlobalStateChange, setGlobalState } = props

  // 监听全局状态变化
  onGlobalStateChange((state, prev) => {
    console.log('子应用监听到状态变化:', state, prev)
  }, true) // true 表示立即触发一次

  // 修改全局状态
  setGlobalState({
    token: 'new-token',
  })

  render(props)
}
```

### 7.3 使用 EventBus

```typescript
// shared/event-bus.ts
type Handler = (...args: any[]) => void

class EventBus {
  private events: Map<string, Handler[]> = new Map()

  on(event: string, handler: Handler) {
    const handlers = this.events.get(event) || []
    handlers.push(handler)
    this.events.set(event, handlers)
  }

  off(event: string, handler?: Handler) {
    if (!handler) {
      this.events.delete(event)
      return
    }
    const handlers = this.events.get(event) || []
    this.events.set(
      event,
      handlers.filter((h) => h !== handler)
    )
  }

  emit(event: string, ...args: any[]) {
    const handlers = this.events.get(event) || []
    handlers.forEach((handler) => handler(...args))
  }
}

export const eventBus = new EventBus()
```

## 8. 样式隔离规范

### 8.1 严格样式隔离（Shadow DOM）

```typescript
start({
  sandbox: {
    strictStyleIsolation: true,
  },
})
```

### 8.2 实验性样式隔离

```typescript
start({
  sandbox: {
    experimentalStyleIsolation: true,
  },
})
```

这会将子应用的样式规则添加前缀：

```css
/* 原始样式 */
.app-main {
  font-size: 14px;
}

/* 隔离后（假设应用名为 react-app） */
div[data-qiankun-react-app] .app-main {
  font-size: 14px;
}
```

### 8.3 CSS 命名规范

```css
/* ✅ 推荐：使用应用前缀 */
.react-app-header {
  background: #fff;
}

.react-app-sidebar {
  width: 200px;
}

/* ✅ 推荐：使用 CSS Modules */
.header_abc123 {
  background: #fff;
}

/* ❌ 避免：使用通用类名 */
.header {
  background: #fff;
}

.container {
  padding: 20px;
}
```

## 9. 路由配置规范

### 9.1 主应用路由

```typescript
// 主应用路由配置
const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: 'about',
        component: About,
      },
    ],
  },
  // 子应用路由由 qiankun 接管
  // 不需要在主应用中配置
]
```

### 9.2 子应用路由 base 配置

```typescript
// Vue Router
const router = new VueRouter({
  base: window.__POWERED_BY_QIANKUN__ ? '/sub-app/' : '/',
  mode: 'history',
  routes,
})

// React Router
<BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/sub-app' : '/'}>
  <Routes>
    {/* ... */}
  </Routes>
</BrowserRouter>
```

## 10. 错误处理规范

### 10.1 全局错误处理

```typescript
import { addGlobalUncaughtErrorHandler } from 'qiankun'

addGlobalUncaughtErrorHandler((event) => {
  const { message, filename, error } = event as ErrorEvent

  // 记录错误日志
  console.error('[qiankun] 全局错误:', {
    message,
    filename,
    error,
  })

  // 上报错误
  reportError({
    type: 'qiankun',
    message,
    stack: error?.stack,
  })
})
```

### 10.2 加载失败处理

```typescript
registerMicroApps(
  [
    {
      name: 'sub-app',
      entry: '//localhost:7100',
      container: '#container',
      activeRule: '/sub',
      loader: (loading) => {
        // 显示/隐藏 loading
        if (loading) {
          showLoading()
        } else {
          hideLoading()
        }
      },
    },
  ],
  {
    beforeLoad: [
      (app) => {
        console.log('开始加载:', app.name)
        return Promise.resolve()
      },
    ],
    afterMount: [
      (app) => {
        console.log('加载成功:', app.name)
        return Promise.resolve()
      },
    ],
  }
)
```

## 11. 性能优化

### 11.1 预加载策略

```typescript
start({
  // 预加载所有子应用
  prefetch: 'all',
  // 或指定预加载
  // prefetch: ['app1', 'app2'],
  // 或关闭预加载
  // prefetch: false,
})
```

### 11.2 资源缓存

```typescript
// 子应用 Webpack 配置
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
  },
}
```

### 11.3 按需加载

```typescript
// 使用 loadMicroApp 按需加载
const loadApp = async () => {
  const microApp = loadMicroApp({
    name: 'lazy-app',
    entry: '//localhost:7100',
    container: '#container',
  })

  // 等待加载完成
  await microApp.mountPromise
}

// 按需触发
button.addEventListener('click', loadApp)
```

## 12. 常见问题处理

### 12.1 跨域配置

```typescript
// 子应用开发服务器
module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
}
```

### 12.2 Cookie 问题

```typescript
start({
  fetch(url, ...args) {
    // 需要携带 cookie 的请求
    if (url.includes('//app.example.com')) {
      return window.fetch(url, {
        ...args,
        mode: 'cors',
        credentials: 'include',
      })
    }
    return window.fetch(url, ...args)
  },
})
```

### 12.3 入口脚本标记

```html
<!-- 如果入口脚本不是最后一个，需要手动标记 -->
<script src="/antd.js"></script>
<script src="/appEntry.js" entry></script>
<script src="https://analytics.example.com/track.js"></script>
```

### 12.4 IE 兼容

```javascript
// 在入口文件顶部引入 polyfills
import 'whatwg-fetch'
import 'custom-event-polyfill'
import 'core-js/stable/promise'
import 'core-js/stable/symbol'
import 'core-js/stable/string/starts-with'
import 'core-js/web/url'
```

## 13. TypeScript 类型定义

```typescript
// types/qiankun.d.ts
declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string
  }
}

// 子应用 props 类型
interface MicroAppProps {
  container?: HTMLElement
  routerBase?: string
  onGlobalStateChange?: (
    callback: (state: any, prev: any) => void,
    fireImmediately?: boolean
  ) => void
  setGlobalState?: (state: any) => void
  [key: string]: any
}

// 生命周期类型
type LifecycleHook = (props: MicroAppProps) => Promise<void>

export const bootstrap: LifecycleHook
export const mount: LifecycleHook
export const unmount: LifecycleHook
export const update: LifecycleHook
```

## 14. 代码注释规范

```typescript
/**
 * 微应用入口文件
 * @description 配置 qiankun 生命周期钩子，处理独立运行和微前端环境
 */

/**
 * 渲染函数
 * @param props - qiankun 传递的属性
 * @param props.container - 挂载容器
 * @param props.routerBase - 路由基础路径
 */
function render(props: MicroAppProps = {}) {
  // 实现逻辑
}

/**
 * 微应用初始化钩子
 * 只在应用首次加载时调用一次
 * 适合做全局变量初始化、缓存初始化等
 */
export async function bootstrap() {
  // 初始化逻辑
}
```

