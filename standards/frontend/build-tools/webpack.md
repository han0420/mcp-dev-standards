---
title: Webpack 开发规范
description: Webpack 构建工具的配置规范和最佳实践，基于官方文档整理
category: frontend
subcategory: build-tools
tags:
  - webpack
  - build-tool
  - bundler
  - module
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# Webpack 开发规范

Webpack 是一个强大的静态模块打包工具，用于构建现代 JavaScript 应用程序。本规范基于 Webpack 5 官方文档整理。

## 1. 项目结构规范

### 1.1 推荐的项目结构

```
project/
├── public/                   # 静态资源
│   └── index.html
├── src/
│   ├── assets/               # 静态资源
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── index.js              # 入口文件
├── config/                   # Webpack 配置
│   ├── webpack.common.js     # 公共配置
│   ├── webpack.dev.js        # 开发配置
│   └── webpack.prod.js       # 生产配置
├── .babelrc                  # Babel 配置
├── postcss.config.js         # PostCSS 配置
├── package.json
└── webpack.config.js         # 主配置文件
```

## 2. 基础配置规范

### 2.1 完整配置示例

```javascript
// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  // 模式
  mode: isDev ? 'development' : 'production',

  // 入口配置
  entry: {
    main: './src/index.js',
    // 多入口
    // admin: './src/admin.js',
  },

  // 输出配置
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[hash:8][ext]',
    clean: true, // 清理输出目录
    publicPath: '/',
  },

  // 模块解析配置
  resolve: {
    // 路径别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
    // 省略扩展名
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    // 模块查找目录
    modules: ['node_modules'],
  },

  // 模块配置
  module: {
    rules: [
      // JavaScript/TypeScript
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      // CSS
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      // SCSS
      {
        test: /\.scss$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      // 图片
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
      },
      // 字体
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // 插件配置
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: !isDev && {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
    }),
    !isDev && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
  ].filter(Boolean),

  // 优化配置
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },

  // 开发服务器配置
  devServer: {
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },

  // Source Map 配置
  devtool: isDev ? 'eval-cheap-module-source-map' : false,

  // 性能提示
  performance: {
    hints: isDev ? false : 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },

  // 缓存配置
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
}
```

## 3. 入口和输出配置

### 3.1 单入口配置

```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
```

### 3.2 多入口配置

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js',
  },
  output: {
    // 使用 [name] 占位符
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
```

### 3.3 输出文件命名

```javascript
module.exports = {
  output: {
    // 入口文件命名
    filename: '[name].[contenthash:8].js',
    
    // 非入口 chunk 命名
    chunkFilename: '[name].[contenthash:8].chunk.js',
    
    // 资源文件命名
    assetModuleFilename: 'assets/[name].[hash:8][ext]',
    
    // 输出路径
    path: path.resolve(__dirname, 'dist'),
    
    // 公共路径（用于 CDN）
    publicPath: '/',
    
    // 清理输出目录
    clean: true,
    
    // 库输出配置
    library: {
      name: 'MyLibrary',
      type: 'umd',
    },
  },
}
```

### 3.4 动态输出文件名

```javascript
module.exports = {
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'main' 
        ? '[name].js' 
        : '[name]/[name].js'
    },
  },
}
```

## 4. Loader 配置规范

### 4.1 JavaScript/TypeScript Loader

```javascript
module.exports = {
  module: {
    rules: [
      // Babel Loader
      {
        test: /\.(?:js|mjs|cjs|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              '@babel/preset-react',
            ],
            plugins: ['@babel/plugin-transform-runtime'],
            cacheDirectory: true,
          },
        },
      },
      
      // TypeScript Loader
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-typescript',
                '@babel/preset-react',
              ],
            },
          },
          // 或使用 ts-loader
          // {
          //   loader: 'ts-loader',
          //   options: {
          //     transpileOnly: true,
          //   },
          // },
        ],
      },
    ],
  },
}
```

### 4.2 CSS Loader

```javascript
module.exports = {
  module: {
    rules: [
      // 普通 CSS
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                auto: true, // 自动启用 CSS Modules
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          'postcss-loader',
        ],
      },
      
      // SCSS/SASS
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              // 注入全局变量
              additionalData: `@import "@/styles/variables.scss";`,
            },
          },
        ],
      },
      
      // Less
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                modifyVars: {
                  'primary-color': '#1890ff',
                },
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
}
```

### 4.3 资源 Loader（Webpack 5）

```javascript
module.exports = {
  module: {
    rules: [
      // 图片资源
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset', // asset/resource | asset/inline | asset/source
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 小于 8kb 转为 base64
          },
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
      },
      
      // 字体资源
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },
      
      // 原始资源（如 txt）
      {
        test: /\.txt$/i,
        type: 'asset/source',
      },
    ],
  },
}
```

### 4.4 其他常用 Loader

```javascript
module.exports = {
  module: {
    rules: [
      // HTML Loader
      {
        test: /\.html$/i,
        loader: 'html-loader',
        options: {
          minimize: true,
        },
      },
      
      // Markdown Loader
      {
        test: /\.md$/i,
        use: [
          'html-loader',
          {
            loader: 'remark-loader',
            options: {
              remarkOptions: {
                plugins: [require('remark-html')],
              },
            },
          },
        ],
      },
      
      // Worker Loader
      {
        test: /\.worker\.js$/i,
        use: { loader: 'worker-loader' },
      },
    ],
  },
}
```

## 5. Plugin 配置规范

### 5.1 常用插件

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { DefinePlugin, ProvidePlugin } = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  plugins: [
    // HTML 模板
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: 'My App',
      inject: 'body',
      favicon: './public/favicon.ico',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
    }),
    
    // 多页面配置
    new HtmlWebpackPlugin({
      template: './public/admin.html',
      filename: 'admin.html',
      chunks: ['admin'],
    }),
    
    // CSS 提取
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
    
    // 定义环境变量
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
    
    // 自动加载模块
    new ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      React: 'react',
    }),
    
    // 复制静态资源
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/static',
          to: 'static',
          noErrorOnMissing: true,
        },
      ],
    }),
    
    // Gzip 压缩
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240, // 10kb 以上压缩
      minRatio: 0.8,
    }),
    
    // Bundle 分析
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
}
```

### 5.2 开发环境插件

```javascript
const webpack = require('webpack')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

module.exports = {
  plugins: [
    // 热更新
    new webpack.HotModuleReplacementPlugin(),
    
    // React Fast Refresh
    new ReactRefreshWebpackPlugin(),
    
    // 显示进度
    new webpack.ProgressPlugin(),
  ],
}
```

## 6. 优化配置规范

### 6.1 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,      // 最小分割大小
      minRemainingSize: 0,
      minChunks: 1,        // 最少引用次数
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        // 第三方库
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: 20,
          chunks: 'initial',
        },
        
        // React 相关
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
          priority: 30,
          chunks: 'all',
        },
        
        // 公共模块
        common: {
          name: 'common',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
        
        // 默认配置
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    
    // 运行时代码单独打包
    runtimeChunk: {
      name: 'runtime',
    },
    
    // 模块 ID 稳定化
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
  },
}
```

### 6.2 压缩配置

```javascript
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      // JavaScript 压缩
      new TerserPlugin({
        parallel: true, // 并行压缩
        extractComments: false, // 不提取注释
        terserOptions: {
          parse: {
            ecma: 2020,
          },
          compress: {
            ecma: 5,
            comparisons: false,
            inline: 2,
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'],
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      
      // CSS 压缩
      new CssMinimizerPlugin({
        parallel: true,
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
  },
}
```

### 6.3 Tree Shaking

```javascript
module.exports = {
  mode: 'production',
  
  optimization: {
    // 启用 Tree Shaking
    usedExports: true,
    
    // 标记副作用
    sideEffects: true,
  },
}

// package.json 中配置
// {
//   "sideEffects": [
//     "*.css",
//     "*.scss",
//     "./src/polyfills.js"
//   ]
// }
```

## 7. 开发服务器配置

### 7.1 基础配置

```javascript
module.exports = {
  devServer: {
    // 端口
    port: 3000,
    
    // 主机
    host: 'localhost',
    
    // 自动打开浏览器
    open: true,
    
    // 热更新
    hot: true,
    
    // Gzip 压缩
    compress: true,
    
    // 历史路由回退
    historyApiFallback: true,
    
    // HTTPS
    https: false,
    
    // 静态文件目录
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/',
    },
    
    // 客户端配置
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
      logging: 'info',
    },
    
    // 允许的 hosts
    allowedHosts: 'all',
    
    // 请求头
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
}
```

### 7.2 代理配置

```javascript
module.exports = {
  devServer: {
    proxy: {
      // 简单配置
      '/api': 'http://localhost:4000',
      
      // 详细配置
      '/api': {
        target: 'http://localhost:4000',
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
        secure: false,
        // 自定义请求头
        headers: {
          'X-Custom-Header': 'value',
        },
        // 处理 WebSocket
        ws: true,
        // 过滤请求
        bypass: (req, res, proxyOptions) => {
          if (req.headers.accept.indexOf('html') !== -1) {
            return '/index.html'
          }
        },
      },
      
      // 多个目标
      '/api/*': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
}
```

## 8. 缓存配置

### 8.1 构建缓存

```javascript
module.exports = {
  cache: {
    // 文件系统缓存
    type: 'filesystem',
    
    // 缓存目录
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
    
    // 缓存依赖
    buildDependencies: {
      // 配置文件变化时重新构建
      config: [__filename],
    },
    
    // 缓存版本
    version: '1.0',
    
    // 缓存名称
    name: 'production-cache',
  },
}
```

### 8.2 Loader 缓存

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          // 缓存 loader
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: path.resolve('.cache'),
            },
          },
          'babel-loader',
        ],
      },
    ],
  },
}
```

## 9. Source Map 配置

### 9.1 开发环境

```javascript
module.exports = {
  // 快速，有行信息
  devtool: 'eval-cheap-module-source-map',
  
  // 或者更详细
  // devtool: 'eval-source-map',
}
```

### 9.2 生产环境

```javascript
module.exports = {
  // 不生成 source map
  devtool: false,
  
  // 或者隐藏源代码
  // devtool: 'hidden-source-map',
  
  // 或者只显示行号
  // devtool: 'nosources-source-map',
}
```

## 10. 环境区分配置

### 10.1 配置拆分

```javascript
// webpack.common.js - 公共配置
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
}
```

```javascript
// webpack.dev.js - 开发配置
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: {
    filename: '[name].js',
  },
  devServer: {
    port: 3000,
    hot: true,
    open: true,
  },
})
```

```javascript
// webpack.prod.js - 生产配置
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    filename: '[name].[contenthash:8].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
    }),
  ],
  optimization: {
    minimizer: [
      `...`, // 保留默认压缩器
      new CssMinimizerPlugin(),
    ],
  },
})
```

### 10.2 package.json 脚本

```json
{
  "scripts": {
    "dev": "webpack serve --config config/webpack.dev.js",
    "build": "webpack --config config/webpack.prod.js",
    "build:analyze": "ANALYZE=true webpack --config config/webpack.prod.js"
  }
}
```

## 11. 性能优化

### 11.1 构建速度优化

```javascript
const os = require('os')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  // 1. 缩小解析范围
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // 2. 缩小 loader 作用范围
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },

  // 3. 并行处理
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: os.cpus().length - 1,
      }),
    ],
  },

  // 4. 文件系统缓存
  cache: {
    type: 'filesystem',
  },

  // 5. 开发环境跳过压缩
  // mode: 'development' 时自动跳过
}
```

### 11.2 构建产物优化

```javascript
module.exports = {
  optimization: {
    // 代码分割
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
    },
    
    // Tree Shaking
    usedExports: true,
    
    // 提取 runtime
    runtimeChunk: 'single',
    
    // 稳定的模块 ID
    moduleIds: 'deterministic',
  },
  
  // 外部化大型库
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
}
```

## 12. 常用插件列表

### 12.1 开发相关

| 插件名 | 用途 |
|--------|------|
| webpack-dev-server | 开发服务器 |
| html-webpack-plugin | HTML 模板 |
| react-refresh-webpack-plugin | React 快速刷新 |
| friendly-errors-webpack-plugin | 友好错误提示 |

### 12.2 构建相关

| 插件名 | 用途 |
|--------|------|
| mini-css-extract-plugin | CSS 提取 |
| css-minimizer-webpack-plugin | CSS 压缩 |
| terser-webpack-plugin | JS 压缩 |
| copy-webpack-plugin | 复制文件 |
| compression-webpack-plugin | Gzip 压缩 |
| image-minimizer-webpack-plugin | 图片优化 |

### 12.3 分析相关

| 插件名 | 用途 |
|--------|------|
| webpack-bundle-analyzer | Bundle 分析 |
| speed-measure-webpack-plugin | 构建速度分析 |
| webpack-dashboard | CLI 仪表盘 |

## 13. TypeScript 配置

### 13.1 ts-loader 配置

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // 只转译，不类型检查
              happyPackMode: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    // 单独进行类型检查
    new ForkTsCheckerWebpackPlugin(),
  ],
}
```

### 13.2 babel-loader + TypeScript

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
          },
        },
      },
    ],
  },
}
```

## 14. 代码注释规范

```javascript
/**
 * Webpack 配置文件
 * @description 项目构建配置
 * @author Your Name
 * @date 2024-12-23
 */

const path = require('path')

/**
 * 是否为开发环境
 * @type {boolean}
 */
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  /**
   * 入口配置
   * @see https://webpack.js.org/concepts/entry-points/
   */
  entry: {
    main: './src/index.js',
  },

  /**
   * 输出配置
   * @see https://webpack.js.org/concepts/output/
   */
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
  },

  /**
   * 模块配置
   * @description 配置各类资源的处理方式
   */
  module: {
    rules: [
      // JavaScript 处理规则
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
}
```

