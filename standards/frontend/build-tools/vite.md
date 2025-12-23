---
title: Vite 开发规范
description: Vite 构建工具的配置规范和最佳实践，基于官方文档整理
category: frontend
subcategory: build-tools
tags:
  - vite
  - build-tool
  - bundler
  - esm
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Vite 开发规范

Vite 是一个现代化的前端构建工具，提供极速的开发服务器启动、闪电般的热模块替换（HMR）和优化的生产构建。本规范基于 Vite 官方文档整理。

## 1. 项目结构规范

### 1.1 推荐的项目结构

```
project/
├── public/                   # 静态资源（不经过构建）
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/               # 需要构建的静态资源
│   │   ├── images/
│   │   └── styles/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── App.vue               # 或 App.tsx
│   └── main.ts               # 入口文件
├── .env                      # 环境变量
├── .env.development          # 开发环境变量
├── .env.production           # 生产环境变量
├── index.html                # HTML 入口
├── package.json
├── tsconfig.json
└── vite.config.ts            # Vite 配置文件
```

## 2. 基础配置规范

### 2.1 配置文件结构

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // 项目根目录
  root: process.cwd(),
  
  // 开发或生产环境服务的公共基础路径
  base: '/',
  
  // 静态资源服务的目录
  publicDir: 'public',
  
  // 存储缓存文件的目录
  cacheDir: 'node_modules/.vite',
  
  // 插件配置
  plugins: [vue()],
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
    // 导入时省略的扩展名
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  
  // CSS 配置
  css: {
    // CSS 预处理器选项
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
      less: {
        math: 'parens-division',
      },
    },
    // CSS Modules 配置
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    // PostCSS 配置
    postcss: {
      plugins: [
        require('autoprefixer'),
      ],
    },
  },
  
  // JSON 配置
  json: {
    namedExports: true,
    stringify: false,
  },
  
  // 开发服务器配置
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    open: true,
    cors: true,
  },
  
  // 构建配置
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
  },
  
  // 预览配置
  preview: {
    port: 4173,
    strictPort: true,
  },
  
  // 依赖优化配置
  optimizeDeps: {
    include: ['lodash-es', 'axios'],
    exclude: ['your-package-name'],
  },
})
```

### 2.2 条件配置

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode, ssrBuild }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  // 根据命令和模式返回不同配置
  if (command === 'serve') {
    // 开发环境配置
    return {
      server: {
        port: 3000,
        hmr: {
          overlay: true,
        },
      },
      define: {
        __DEV__: true,
      },
    }
  } else {
    // 生产构建配置
    return {
      build: {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      },
      define: {
        __DEV__: false,
      },
    }
  }
})
```

## 3. 插件配置规范

### 3.1 官方插件

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    // Vue 3 支持
    vue(),
    
    // Vue JSX 支持
    vueJsx(),
    
    // React 支持
    // react(),
    
    // 旧版浏览器支持
    legacy({
      targets: ['defaults', 'not IE 11'],
      // 现代浏览器 polyfills
      modernPolyfills: ['es.string.at'],
      // 是否生成传统版本
      renderLegacyChunks: true,
    }),
  ],
})
```

### 3.2 条件插件

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import typescript2 from 'rollup-plugin-typescript2'

export default defineConfig({
  plugins: [
    // 仅在构建时启用
    {
      ...typescript2(),
      apply: 'build',
    },
    
    // 使用函数进行更精细的控制
    {
      name: 'conditional-plugin',
      apply(config, { command }) {
        // 仅在构建且非 SSR 时启用
        return command === 'build' && !config.build?.ssr
      },
    },
  ],
})
```

### 3.3 自定义插件

```typescript
// plugins/my-plugin.ts
import type { Plugin } from 'vite'

export function myPlugin(options?: { debug?: boolean }): Plugin {
  return {
    name: 'my-plugin',
    
    // 插件执行顺序
    enforce: 'pre', // 'pre' | 'post'
    
    // 仅在 serve 或 build 时应用
    apply: 'build',
    
    // Vite 独有钩子
    configResolved(config) {
      if (options?.debug) {
        console.log('Resolved config:', config)
      }
    },
    
    configureServer(server) {
      // 配置开发服务器
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next()
      })
    },
    
    transformIndexHtml(html) {
      // 转换 index.html
      return html.replace(
        /<title>(.*?)<\/title>/,
        `<title>My App</title>`
      )
    },
    
    // Rollup 通用钩子
    buildStart() {
      console.log('Build started')
    },
    
    transform(code, id) {
      if (id.endsWith('.md')) {
        // 转换 Markdown 文件
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null,
        }
      }
    },
    
    buildEnd() {
      console.log('Build ended')
    },
  }
}
```

## 4. 开发服务器配置

### 4.1 基础配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    // 监听地址
    host: '0.0.0.0',
    
    // 端口号
    port: 3000,
    
    // 端口被占用时是否退出
    strictPort: false,
    
    // 自动打开浏览器
    open: true,
    
    // HTTPS 配置
    https: false,
    
    // 允许跨域
    cors: true,
    
    // 强制预构建依赖
    force: false,
    
    // HMR 配置
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
    },
    
    // 文件监听配置
    watch: {
      usePolling: true, // WSL 环境需要
      interval: 100,
    },
  },
})
```

### 4.2 代理配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // 字符串简写
      '/foo': 'http://localhost:4567',
      
      // 带选项的配置
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 配置代理实例
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 添加请求头
            proxyReq.setHeader('X-Custom-Header', 'value')
          })
        },
      },
      
      // 正则匹配
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      
      // WebSocket 代理
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## 5. 构建配置规范

### 5.1 基础构建配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 构建目标
    target: 'esnext',
    
    // 输出目录
    outDir: 'dist',
    
    // 静态资源目录
    assetsDir: 'assets',
    
    // 小于此阈值的资源将内联为 base64
    assetsInlineLimit: 4096,
    
    // CSS 代码拆分
    cssCodeSplit: true,
    
    // CSS 目标
    cssTarget: 'chrome61',
    
    // 生成 source map
    sourcemap: false, // true | 'inline' | 'hidden'
    
    // 压缩方式
    minify: 'esbuild', // 'terser' | 'esbuild' | false
    
    // Terser 选项
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // 清空输出目录
    emptyOutDir: true,
    
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
    
    // 监听模式
    watch: null,
  },
})
```

### 5.2 Rollup 选项

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      // 外部化依赖
      external: ['vue', 'react'],
      
      // 多入口配置
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
      
      // 输出配置
      output: {
        // 入口文件命名
        entryFileNames: 'js/[name].[hash].js',
        
        // chunk 文件命名
        chunkFileNames: 'js/[name].[hash].js',
        
        // 静态资源命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `images/[name].[hash][extname]`
          }
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name].[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `fonts/[name].[hash][extname]`
          }
          return `assets/[name].[hash][extname]`
        },
        
        // 手动分包
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['lodash-es', 'dayjs'],
        },
        
        // 或使用函数
        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     return 'vendor'
        //   }
        // },
        
        // 全局变量（用于外部化依赖）
        globals: {
          vue: 'Vue',
          react: 'React',
        },
      },
    },
  },
})
```

### 5.3 库模式配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      // 入口文件
      entry: path.resolve(__dirname, 'src/index.ts'),
      
      // 库名称
      name: 'MyLib',
      
      // 输出文件名
      fileName: (format) => `my-lib.${format}.js`,
      
      // 输出格式
      formats: ['es', 'umd', 'cjs'],
    },
    
    rollupOptions: {
      // 确保外部化不需要打包的依赖
      external: ['vue', 'react'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React',
        },
      },
    },
  },
})
```

## 6. 环境变量规范

### 6.1 环境变量文件

```bash
# .env - 所有环境都会加载
VITE_APP_TITLE=My App

# .env.local - 所有环境都会加载，但被 git 忽略
VITE_SECRET_KEY=xxx

# .env.development - 开发环境
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production - 生产环境
VITE_API_BASE_URL=https://api.example.com

# .env.staging - 自定义模式
VITE_API_BASE_URL=https://staging-api.example.com
```

### 6.2 使用环境变量

```typescript
// 在代码中使用
console.log(import.meta.env.VITE_APP_TITLE)
console.log(import.meta.env.VITE_API_BASE_URL)

// 内置环境变量
console.log(import.meta.env.MODE)        // 'development' | 'production'
console.log(import.meta.env.BASE_URL)    // 部署基础路径
console.log(import.meta.env.PROD)        // 是否生产环境
console.log(import.meta.env.DEV)         // 是否开发环境
console.log(import.meta.env.SSR)         // 是否服务端渲染
```

### 6.3 TypeScript 类型声明

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 6.4 自定义前缀

```typescript
// vite.config.ts
export default defineConfig({
  // 更改环境变量前缀
  envPrefix: ['VITE_', 'APP_'],
  
  // 或者使用 define 暴露无前缀变量
  define: {
    'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE),
  },
})
```

## 7. 静态资源处理

### 7.1 资源导入

```typescript
// 导入图片
import imgUrl from './img.png'

// 显式 URL 导入
import assetUrl from './asset.js?url'

// 以字符串形式导入
import assetRaw from './asset.js?raw'

// 导入 Web Worker
import Worker from './worker.js?worker'

// 内联 Web Worker
import InlineWorker from './worker.js?worker&inline'

// 导入 WASM
import init from './example.wasm?init'
```

### 7.2 public 目录

```typescript
// public 目录下的资源可以直接通过 / 访问
// 不会被构建处理，直接复制到输出目录

// 在代码中引用
const logoUrl = '/logo.png'

// 在 HTML 中引用
// <img src="/logo.png" />
```

### 7.3 JSON 导入

```typescript
// 导入整个对象
import json from './data.json'

// 具名导入
import { field } from './data.json'
```

## 8. CSS 配置规范

### 8.1 CSS 预处理器

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      // SCSS 配置
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `,
        // 使用 modern API
        api: 'modern-compiler',
      },
      
      // Less 配置
      less: {
        math: 'always',
        globalVars: {
          primaryColor: '#1890ff',
        },
      },
      
      // Stylus 配置
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
    },
  },
})
```

### 8.2 CSS Modules

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    modules: {
      // 类名转换规则
      localsConvention: 'camelCaseOnly',
      
      // 作用域类名生成规则
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      
      // 或使用函数
      generateScopedName: (name, filename, css) => {
        return `${name}_${hash(filename + css)}`
      },
      
      // 全局模式
      scopeBehaviour: 'local', // 'global' | 'local'
      
      // 哈希前缀
      hashPrefix: 'prefix',
    },
  },
})
```

### 8.3 PostCSS

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-nested'),
        require('postcss-preset-env')({
          stage: 3,
          features: {
            'nesting-rules': true,
          },
        }),
      ],
    },
  },
})

// 或使用 postcss.config.js
// module.exports = {
//   plugins: [
//     require('autoprefixer'),
//   ],
// }
```

## 9. 性能优化

### 9.1 依赖预构建

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 强制预构建的依赖
    include: [
      'lodash-es',
      'axios',
      'vue',
      'vue-router',
    ],
    
    // 排除预构建的依赖
    exclude: ['your-local-package'],
    
    // esbuild 配置
    esbuildOptions: {
      target: 'esnext',
      supported: {
        bigint: true,
      },
    },
    
    // 强制重新预构建
    force: false,
  },
})
```

### 9.2 分包策略

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // node_modules 单独打包
          if (id.includes('node_modules')) {
            // 大型库单独打包
            if (id.includes('lodash')) {
              return 'lodash'
            }
            if (id.includes('echarts')) {
              return 'echarts'
            }
            if (id.includes('@vue') || id.includes('vue')) {
              return 'vue-vendor'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
```

### 9.3 动态导入

```typescript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue'),
  },
  {
    path: '/settings',
    component: () => import('./views/Settings.vue'),
  },
]

// 组件懒加载
const AsyncComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
)
```

## 10. SSR 配置

### 10.1 基础 SSR 配置

```typescript
// vite.config.ts
export default defineConfig({
  // SSR 配置
  ssr: {
    // 外部化依赖
    external: ['express'],
    
    // 不外部化的依赖
    noExternal: ['your-esm-dep'],
    
    // 构建目标
    target: 'node',
  },
})
```

### 10.2 构建命令

```json
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

## 11. 常用插件推荐

### 11.1 官方插件

```typescript
// Vue
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// React
import react from '@vitejs/plugin-react'

// 旧版浏览器支持
import legacy from '@vitejs/plugin-legacy'
```

### 11.2 社区插件

```typescript
// 自动导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// SVG 组件
import svgLoader from 'vite-svg-loader'

// 压缩
import compression from 'vite-plugin-compression'

// 图片优化
import imagemin from 'vite-plugin-imagemin'

// PWA
import { VitePWA } from 'vite-plugin-pwa'

// Mock
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    vue(),
    
    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    
    // 自动导入组件
    Components({
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
    }),
    
    // SVG 作为组件
    svgLoader(),
    
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
})
```

## 12. TypeScript 配置

### 12.1 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 12.2 tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

## 13. 代码注释规范

```typescript
/**
 * Vite 配置文件
 * @description 项目构建和开发服务器配置
 */
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    /**
     * 插件配置
     * 按照执行顺序排列
     */
    plugins: [
      vue(), // Vue 3 支持
    ],

    /**
     * 开发服务器配置
     * @see https://vitejs.dev/config/server-options.html
     */
    server: {
      port: 3000,
    },

    /**
     * 构建配置
     * @see https://vitejs.dev/config/build-options.html
     */
    build: {
      target: 'esnext',
    },
  }
})
```

