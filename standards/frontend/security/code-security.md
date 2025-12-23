---
title: 前端代码安全检查规范
description: 前端代码安全检查清单、漏洞防护和最佳实践，涵盖 XSS、CSRF、敏感数据保护等
category: frontend
subcategory: security
tags:
  - security
  - xss
  - csrf
  - csp
  - vulnerability
version: "1.0.0"
lastUpdated: "2024-12-23"
---

# 前端代码安全检查规范

前端安全是 Web 应用安全的第一道防线。本规范涵盖常见安全漏洞的防护措施、代码安全检查清单和最佳实践。

## 1. XSS（跨站脚本攻击）防护

### 1.1 XSS 攻击类型

| 类型 | 描述 | 攻击向量 |
|------|------|----------|
| 反射型 XSS | 恶意脚本来自当前 HTTP 请求 | URL 参数、表单提交 |
| 存储型 XSS | 恶意脚本存储在服务器数据库 | 评论、用户资料、消息 |
| DOM 型 XSS | 恶意脚本由客户端代码注入 | DOM 操作、innerHTML |

### 1.2 危险的 DOM 操作

```javascript
// ❌ 危险：直接使用 innerHTML
element.innerHTML = userInput

// ❌ 危险：使用 document.write
document.write(userInput)

// ❌ 危险：使用 eval
eval(userInput)

// ❌ 危险：使用 Function 构造器
new Function(userInput)()

// ❌ 危险：使用 setTimeout/setInterval 执行字符串
setTimeout(userInput, 1000)
setInterval(userInput, 1000)

// ❌ 危险：直接设置 href
element.href = userInput

// ❌ 危险：使用 outerHTML
element.outerHTML = userInput

// ❌ 危险：jQuery html()
$(element).html(userInput)
```

### 1.3 安全的替代方案

```javascript
// ✅ 安全：使用 textContent
element.textContent = userInput

// ✅ 安全：使用 createTextNode
const textNode = document.createTextNode(userInput)
element.appendChild(textNode)

// ✅ 安全：使用 setAttribute（非事件属性）
element.setAttribute('data-value', userInput)

// ✅ 安全：使用模板字面量（需要编码）
element.innerHTML = `<span>${escapeHtml(userInput)}</span>`

// ✅ 安全：jQuery text()
$(element).text(userInput)

// ✅ 安全：React 自动转义
function Component({ userInput }) {
  return <div>{userInput}</div> // 自动转义
}

// ✅ 安全：Vue 自动转义
// <template>
//   <div>{{ userInput }}</div> <!-- 自动转义 -->
// </template>
```

### 1.4 HTML 实体编码函数

```typescript
/**
 * HTML 实体编码
 * @param str - 需要编码的字符串
 * @returns 编码后的安全字符串
 */
function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  }
  
  return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char])
}

/**
 * HTML 属性值编码
 * @param str - 属性值
 * @returns 编码后的安全属性值
 */
function escapeAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * JavaScript 字符串编码
 * @param str - 需要编码的字符串
 * @returns 编码后的安全字符串
 */
function escapeJs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/</g, '\\x3c')
    .replace(/>/g, '\\x3e')
}

/**
 * URL 编码
 * @param str - 需要编码的字符串
 * @returns 编码后的安全 URL 参数
 */
function escapeUrl(str: string): string {
  return encodeURIComponent(str)
}
```

### 1.5 框架特定的 XSS 防护

#### React

```tsx
// ❌ 危险：dangerouslySetInnerHTML
function Dangerous({ htmlContent }: { htmlContent: string }) {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
}

// ✅ 安全：如果必须使用，先进行净化
import DOMPurify from 'dompurify'

function SafeHtml({ htmlContent }: { htmlContent: string }) {
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
  })
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
}

// ✅ 安全：URL 验证
function SafeLink({ url }: { url: string }) {
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }
  
  if (!isValidUrl(url)) {
    return <span>无效链接</span>
  }
  
  return <a href={url} rel="noopener noreferrer">{url}</a>
}
```

#### Vue

```vue
<template>
  <!-- ❌ 危险：v-html -->
  <div v-html="htmlContent"></div>
  
  <!-- ✅ 安全：使用插值表达式 -->
  <div>{{ userInput }}</div>
  
  <!-- ✅ 安全：净化后使用 v-html -->
  <div v-html="sanitizedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  htmlContent: string
  userInput: string
}>()

// 净化 HTML 内容
const sanitizedHtml = computed(() => {
  return DOMPurify.sanitize(props.htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href'],
  })
})
</script>
```

### 1.6 URL 参数安全

```typescript
/**
 * 安全获取 URL 参数
 * @param name - 参数名
 * @returns 解码后的参数值
 */
function getUrlParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search)
  const value = params.get(name)
  
  if (value === null) {
    return null
  }
  
  // 验证参数值
  if (containsMaliciousContent(value)) {
    console.warn(`检测到恶意参数: ${name}`)
    return null
  }
  
  return value
}

/**
 * 检测恶意内容
 */
function containsMaliciousContent(value: string): boolean {
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:/gi,
    /vbscript:/gi,
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(value))
}

/**
 * 安全的 URL 跳转
 */
function safeRedirect(url: string): void {
  const allowedOrigins = [
    'https://example.com',
    'https://www.example.com',
  ]
  
  try {
    const parsed = new URL(url, window.location.origin)
    
    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('不允许的协议')
    }
    
    // 检查是否为允许的域名（防止开放重定向）
    if (!allowedOrigins.includes(parsed.origin)) {
      throw new Error('不允许的域名')
    }
    
    window.location.href = parsed.href
  } catch (error) {
    console.error('不安全的重定向:', error)
    window.location.href = '/'
  }
}
```

## 2. CSRF（跨站请求伪造）防护

### 2.1 CSRF 攻击原理

```
攻击者网站                           目标网站
    |                                   |
    | 1. 用户已登录目标网站              |
    |                                   |
    | 2. 诱导用户访问攻击者页面           |
    |                                   |
    | 3. 攻击者页面自动发起请求 -------->  |
    |    （携带用户的 Cookie）           |
    |                                   |
    | 4. 目标网站执行恶意操作             |
```

### 2.2 防护措施

#### CSRF Token

```typescript
// 获取 CSRF Token
function getCsrfToken(): string {
  // 从 meta 标签获取
  const meta = document.querySelector('meta[name="csrf-token"]')
  if (meta) {
    return meta.getAttribute('content') || ''
  }
  
  // 从 cookie 获取
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value)
    }
  }
  
  return ''
}

// Axios 拦截器配置
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // 发送 Cookie
})

// 请求拦截器：添加 CSRF Token
api.interceptors.request.use((config) => {
  const token = getCsrfToken()
  if (token) {
    config.headers['X-CSRF-TOKEN'] = token
  }
  return config
})

export default api
```

#### SameSite Cookie

```typescript
// 服务端设置 Cookie（参考）
// Set-Cookie: session=xxx; SameSite=Strict; Secure; HttpOnly

// 前端检查 Cookie 配置
function checkCookieSecurity(): void {
  const cookies = document.cookie
  
  // 检查是否存在非 HttpOnly 的敏感 Cookie
  const sensitiveNames = ['session', 'token', 'auth']
  
  sensitiveNames.forEach(name => {
    if (cookies.includes(name)) {
      console.warn(`敏感 Cookie "${name}" 可能未设置 HttpOnly`)
    }
  })
}
```

#### 请求来源验证

```typescript
// Fetch 请求配置
async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'same-origin', // 同源时发送 Cookie
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // 标识 AJAX 请求
    },
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }
  
  return fetch(url, mergedOptions)
}
```

### 2.3 表单安全

```tsx
// React 安全表单示例
function SecureForm() {
  const [csrfToken, setCsrfToken] = useState('')
  
  useEffect(() => {
    setCsrfToken(getCsrfToken())
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.target as HTMLFormElement)
    
    await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
      body: formData,
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {/* 其他表单字段 */}
      <button type="submit">提交</button>
    </form>
  )
}
```

## 3. 敏感数据保护

### 3.1 前端存储安全

```typescript
/**
 * 安全存储工具类
 * 注意：前端存储本质上不安全，敏感数据应尽量避免存储在前端
 */
class SecureStorage {
  private readonly prefix: string
  
  constructor(prefix = 'app_') {
    this.prefix = prefix
  }
  
  /**
   * 存储数据（非敏感数据）
   */
  set(key: string, value: unknown): void {
    try {
      const data = JSON.stringify({
        value,
        timestamp: Date.now(),
      })
      localStorage.setItem(this.prefix + key, data)
    } catch (error) {
      console.error('存储失败:', error)
    }
  }
  
  /**
   * 获取数据
   */
  get<T>(key: string, maxAge?: number): T | null {
    try {
      const data = localStorage.getItem(this.prefix + key)
      if (!data) return null
      
      const parsed = JSON.parse(data)
      
      // 检查是否过期
      if (maxAge && Date.now() - parsed.timestamp > maxAge) {
        this.remove(key)
        return null
      }
      
      return parsed.value as T
    } catch {
      return null
    }
  }
  
  /**
   * 删除数据
   */
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }
  
  /**
   * 清除所有数据
   */
  clear(): void {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}

// ❌ 不安全：存储敏感信息
localStorage.setItem('password', 'secret123')
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIs...')
localStorage.setItem('creditCard', '4111111111111111')

// ✅ 安全：只存储非敏感数据
const storage = new SecureStorage()
storage.set('theme', 'dark')
storage.set('language', 'zh-CN')
storage.set('lastVisited', '/dashboard')
```

### 3.2 Token 存储策略

```typescript
/**
 * Token 存储策略对比
 * 
 * | 存储方式 | XSS 风险 | CSRF 风险 | 推荐场景 |
 * |----------|----------|-----------|----------|
 * | localStorage | 高 | 低 | 不推荐存储 Token |
 * | sessionStorage | 高 | 低 | 短期会话 |
 * | Cookie (HttpOnly) | 低 | 高 | 配合 CSRF 防护使用 |
 * | 内存 | 低 | 低 | 最安全，但刷新丢失 |
 */

// 内存存储 Token（最安全但刷新会丢失）
class TokenManager {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  
  setTokens(access: string, refresh: string): void {
    this.accessToken = access
    this.refreshToken = refresh
  }
  
  getAccessToken(): string | null {
    return this.accessToken
  }
  
  getRefreshToken(): string | null {
    return this.refreshToken
  }
  
  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
  }
  
  isAuthenticated(): boolean {
    return this.accessToken !== null
  }
}

export const tokenManager = new TokenManager()

// 配合 HttpOnly Cookie 使用的方案
// 服务端设置:
// Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/api/refresh
```

### 3.3 敏感数据处理

```typescript
/**
 * 敏感数据脱敏工具
 */
const DataMasking = {
  /**
   * 手机号脱敏
   */
  phone(phone: string): string {
    if (!phone || phone.length < 11) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },
  
  /**
   * 邮箱脱敏
   */
  email(email: string): string {
    if (!email || !email.includes('@')) return email
    const [name, domain] = email.split('@')
    const maskedName = name.length > 2 
      ? name[0] + '***' + name[name.length - 1]
      : '***'
    return `${maskedName}@${domain}`
  },
  
  /**
   * 身份证号脱敏
   */
  idCard(idCard: string): string {
    if (!idCard || idCard.length < 15) return idCard
    return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2')
  },
  
  /**
   * 银行卡号脱敏
   */
  bankCard(card: string): string {
    if (!card || card.length < 8) return card
    return card.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2')
  },
  
  /**
   * 姓名脱敏
   */
  name(name: string): string {
    if (!name) return name
    if (name.length === 2) {
      return name[0] + '*'
    }
    if (name.length > 2) {
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
    }
    return '*'
  },
}

// 使用示例
console.log(DataMasking.phone('13812345678'))    // 138****5678
console.log(DataMasking.email('test@example.com')) // t***t@example.com
console.log(DataMasking.idCard('110101199001011234')) // 1101**********1234
```

### 3.4 源代码安全

```typescript
// ❌ 不安全：硬编码敏感信息
const API_KEY = 'sk-1234567890abcdef'
const DB_PASSWORD = 'supersecret'
const PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----...'

// ✅ 安全：使用环境变量
const API_KEY = import.meta.env.VITE_API_KEY
const API_URL = import.meta.env.VITE_API_URL

// ✅ 安全：敏感操作应在后端进行
// 前端只处理公开的配置
const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  publicKey: import.meta.env.VITE_PUBLIC_KEY, // 公钥可以暴露
}

// .env 文件不应提交到版本控制
// .gitignore:
// .env
// .env.local
// .env.*.local
```

## 4. 内容安全策略（CSP）

### 4.1 CSP 配置

```html
<!-- HTML meta 标签方式 -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.example.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

### 4.2 CSP 指令说明

| 指令 | 说明 | 推荐值 |
|------|------|--------|
| `default-src` | 默认加载策略 | `'self'` |
| `script-src` | JavaScript 来源 | `'self'` (避免 `'unsafe-inline'`) |
| `style-src` | CSS 来源 | `'self'` |
| `img-src` | 图片来源 | `'self' data: https:` |
| `font-src` | 字体来源 | `'self'` |
| `connect-src` | AJAX/WebSocket 来源 | `'self' https://api.example.com` |
| `frame-src` | iframe 来源 | `'none'` 或指定域名 |
| `frame-ancestors` | 可嵌入此页面的来源 | `'none'` |
| `base-uri` | base 标签 URL | `'self'` |
| `form-action` | 表单提交目标 | `'self'` |
| `object-src` | Flash/插件来源 | `'none'` |

### 4.3 CSP Nonce 方案

```typescript
// 服务端生成 nonce（示例）
// const nonce = crypto.randomBytes(16).toString('base64')
// 响应头: Content-Security-Policy: script-src 'nonce-${nonce}'

// 前端使用 nonce
// <script nonce="${nonce}">
//   // 内联脚本
// </script>

// React 中使用 nonce
function App() {
  // 从服务端获取 nonce
  const nonce = window.__CSP_NONCE__
  
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `console.log('内联脚本')`
      }}
    />
  )
}
```

### 4.4 CSP 报告

```html
<!-- 配置 CSP 违规报告 -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  report-uri /api/csp-report;
">

<!-- 仅报告模式（不阻止，用于测试） -->
<meta http-equiv="Content-Security-Policy-Report-Only" content="
  default-src 'self';
  report-uri /api/csp-report;
">
```

## 5. 安全 HTTP 头

### 5.1 必要的安全头

```typescript
// Nginx 配置示例
/*
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
*/

// 前端检查安全头
function checkSecurityHeaders(): void {
  const requiredHeaders = [
    'content-security-policy',
    'x-content-type-options',
    'x-frame-options',
    'strict-transport-security',
  ]
  
  fetch(window.location.href, { method: 'HEAD' })
    .then(response => {
      requiredHeaders.forEach(header => {
        if (!response.headers.get(header)) {
          console.warn(`缺少安全头: ${header}`)
        }
      })
    })
}
```

### 5.2 安全头说明

| 头部 | 值 | 作用 |
|------|------|------|
| `X-Content-Type-Options` | `nosniff` | 防止 MIME 类型嗅探 |
| `X-Frame-Options` | `DENY` / `SAMEORIGIN` | 防止点击劫持 |
| `X-XSS-Protection` | `1; mode=block` | 启用浏览器 XSS 过滤（已废弃但仍有用） |
| `Strict-Transport-Security` | `max-age=31536000` | 强制 HTTPS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 控制 Referrer 信息 |
| `Permissions-Policy` | `camera=()` | 控制浏览器功能权限 |

## 6. 第三方依赖安全

### 6.1 依赖审计

```bash
# npm 内置审计
npm audit

# 修复漏洞
npm audit fix

# 强制修复（可能有破坏性更改）
npm audit fix --force

# 生成详细报告
npm audit --json > audit-report.json

# pnpm 审计
pnpm audit

# yarn 审计
yarn audit
```

### 6.2 依赖锁定

```json
// package.json - 锁定版本
{
  "dependencies": {
    "lodash": "4.17.21",        // 精确版本
    "axios": "~1.6.0",          // 允许补丁更新
    "vue": "^3.4.0"             // 允许小版本更新（谨慎使用）
  },
  "overrides": {
    // 强制覆盖依赖版本
    "lodash": "4.17.21"
  }
}
```

### 6.3 安全依赖检查脚本

```typescript
// scripts/security-check.ts
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface AuditResult {
  vulnerabilities: {
    info: number
    low: number
    moderate: number
    high: number
    critical: number
  }
}

async function runSecurityCheck(): Promise<void> {
  console.log('🔍 正在检查依赖安全...\n')
  
  try {
    // 运行 npm audit
    const { stdout } = await execAsync('npm audit --json')
    const result: AuditResult = JSON.parse(stdout)
    
    const { vulnerabilities } = result
    const total = Object.values(vulnerabilities).reduce((a, b) => a + b, 0)
    
    if (total === 0) {
      console.log('✅ 未发现安全漏洞')
      return
    }
    
    console.log('⚠️ 发现安全漏洞:')
    console.log(`  - 严重: ${vulnerabilities.critical}`)
    console.log(`  - 高危: ${vulnerabilities.high}`)
    console.log(`  - 中危: ${vulnerabilities.moderate}`)
    console.log(`  - 低危: ${vulnerabilities.low}`)
    console.log(`  - 信息: ${vulnerabilities.info}`)
    
    // 如果有高危或严重漏洞，退出构建
    if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
      console.error('\n❌ 存在高危或严重漏洞，请修复后再构建')
      process.exit(1)
    }
  } catch (error) {
    console.error('安全检查失败:', error)
    process.exit(1)
  }
}

runSecurityCheck()
```

### 6.4 Subresource Integrity (SRI)

```html
<!-- 使用 SRI 验证 CDN 资源 -->
<script
  src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
  integrity="sha384-xxxx..."
  crossorigin="anonymous"
></script>

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  integrity="sha384-xxxx..."
  crossorigin="anonymous"
>
```

```typescript
// 生成 SRI 哈希
import crypto from 'crypto'
import fs from 'fs'

function generateSRI(filePath: string): string {
  const content = fs.readFileSync(filePath)
  const hash = crypto.createHash('sha384').update(content).digest('base64')
  return `sha384-${hash}`
}
```

## 7. 输入验证

### 7.1 表单验证

```typescript
import { z } from 'zod'

// 使用 Zod 定义验证模式
const UserSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  
  email: z
    .string()
    .email('邮箱格式不正确'),
  
  password: z
    .string()
    .min(8, '密码至少 8 个字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[0-9]/, '密码必须包含数字')
    .regex(/[^A-Za-z0-9]/, '密码必须包含特殊字符'),
  
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
    .optional(),
  
  age: z
    .number()
    .int('年龄必须是整数')
    .min(0, '年龄不能为负数')
    .max(150, '年龄不合理'),
  
  website: z
    .string()
    .url('网址格式不正确')
    .refine(
      url => url.startsWith('https://'),
      '网址必须使用 HTTPS'
    )
    .optional(),
})

type User = z.infer<typeof UserSchema>

// 验证函数
function validateUser(data: unknown): { success: boolean; data?: User; errors?: string[] } {
  const result = UserSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors = result.error.errors.map(e => e.message)
  return { success: false, errors }
}
```

### 7.2 文件上传验证

```typescript
interface FileValidationOptions {
  maxSize?: number           // 最大文件大小（字节）
  allowedTypes?: string[]    // 允许的 MIME 类型
  allowedExtensions?: string[] // 允许的扩展名
}

/**
 * 验证文件安全性
 */
function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 默认 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  } = options
  
  // 检查文件大小
  if (file.size > maxSize) {
    return { valid: false, error: `文件大小不能超过 ${maxSize / 1024 / 1024}MB` }
  }
  
  // 检查 MIME 类型
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型' }
  }
  
  // 检查扩展名
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: '不支持的文件扩展名' }
  }
  
  // 检查文件名（防止路径遍历）
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, error: '文件名包含非法字符' }
  }
  
  return { valid: true }
}

/**
 * 验证图片文件头（Magic Bytes）
 */
async function validateImageMagicBytes(file: File): Promise<boolean> {
  const magicBytes: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46, 0x38],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
  }
  
  const expectedBytes = magicBytes[file.type]
  if (!expectedBytes) return false
  
  const buffer = await file.slice(0, expectedBytes.length).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  
  return expectedBytes.every((byte, index) => bytes[index] === byte)
}
```

### 7.3 危险输入过滤

```typescript
/**
 * 过滤危险字符
 */
function sanitizeInput(input: string): string {
  return input
    // 移除 HTML 标签
    .replace(/<[^>]*>/g, '')
    // 移除 JavaScript 协议
    .replace(/javascript:/gi, '')
    // 移除事件处理器
    .replace(/on\w+\s*=/gi, '')
    // 移除 data URL
    .replace(/data:/gi, '')
    // 移除特殊字符
    .replace(/[<>'"&]/g, '')
    // 修剪空白
    .trim()
}

/**
 * 验证是否为安全的 URL
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    
    // 只允许 http 和 https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    
    // 检查是否包含危险字符
    const dangerousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /on\w+=/i,
    ]
    
    return !dangerousPatterns.some(pattern => pattern.test(url))
  } catch {
    return false
  }
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  // RFC 5322 简化版本
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(email)) {
    return false
  }
  
  // 检查长度
  if (email.length > 254) {
    return false
  }
  
  // 检查本地部分长度
  const [local] = email.split('@')
  if (local.length > 64) {
    return false
  }
  
  return true
}
```

## 8. 安全编码实践

### 8.1 ESLint 安全规则

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['security', 'xss'],
  extends: [
    'plugin:security/recommended',
  ],
  rules: {
    // 禁止使用 eval
    'no-eval': 'error',
    
    // 禁止使用 Function 构造器
    'no-new-func': 'error',
    
    // 禁止使用 innerHTML
    'no-unsanitized/property': 'error',
    
    // 禁止使用 document.write
    'no-unsanitized/method': 'error',
    
    // 检测硬编码密码
    'security/detect-hardcoded-credentials': 'error',
    
    // 检测不安全的正则表达式
    'security/detect-unsafe-regex': 'error',
    
    // 检测对象注入
    'security/detect-object-injection': 'warn',
    
    // 检测非字面量 require
    'security/detect-non-literal-require': 'warn',
    
    // 检测非字面量 fs 文件名
    'security/detect-non-literal-fs-filename': 'warn',
  },
}
```

### 8.2 安全代码模板

```typescript
/**
 * 安全的 API 请求封装
 */
class SecureApiClient {
  private baseUrl: string
  private timeout: number
  
  constructor(baseUrl: string, timeout = 30000) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }
  
  /**
   * 发送安全请求
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl)
    
    // 验证 URL
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('不安全的协议')
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      const response = await fetch(url.href, {
        ...options,
        signal: controller.signal,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...options.headers,
        },
      })
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // 验证 Content-Type
      const contentType = response.headers.get('Content-Type')
      if (!contentType?.includes('application/json')) {
        throw new Error('无效的响应类型')
      }
      
      return response.json()
    } finally {
      clearTimeout(timeoutId)
    }
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }
  
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}
```

### 8.3 React 安全组件

```tsx
import { memo, useCallback, useState } from 'react'
import DOMPurify from 'dompurify'

interface SecureInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  pattern?: RegExp
  sanitize?: boolean
}

/**
 * 安全输入组件
 */
export const SecureInput = memo(function SecureInput({
  value,
  onChange,
  maxLength = 1000,
  pattern,
  sanitize = true,
}: SecureInputProps) {
  const [error, setError] = useState<string>('')
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    // 长度限制
    if (newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength)
    }
    
    // 模式验证
    if (pattern && !pattern.test(newValue) && newValue !== '') {
      setError('输入格式不正确')
      return
    }
    
    // 净化输入
    if (sanitize) {
      newValue = DOMPurify.sanitize(newValue, { ALLOWED_TAGS: [] })
    }
    
    setError('')
    onChange(newValue)
  }, [maxLength, pattern, sanitize, onChange])
  
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
      />
      {error && <span className="error">{error}</span>}
    </div>
  )
})

interface SecureLinkProps {
  href: string
  children: React.ReactNode
}

/**
 * 安全链接组件
 */
export function SecureLink({ href, children }: SecureLinkProps) {
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }, [])
  
  if (!isValidUrl(href)) {
    console.warn('不安全的链接:', href)
    return <span>{children}</span>
  }
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}
```

## 9. 安全检查清单

### 9.1 代码审查清单

| 检查项 | 风险等级 | 说明 |
|--------|----------|------|
| 使用 innerHTML/outerHTML | 高 | 可能导致 XSS |
| 使用 eval/Function | 高 | 可能执行恶意代码 |
| 使用 dangerouslySetInnerHTML | 高 | React 中的 XSS 风险 |
| 使用 v-html | 高 | Vue 中的 XSS 风险 |
| 硬编码敏感信息 | 高 | 泄露密钥/密码 |
| 不安全的 URL 跳转 | 中 | 开放重定向漏洞 |
| 缺少 CSRF Token | 中 | CSRF 攻击风险 |
| 未验证文件上传 | 中 | 恶意文件上传 |
| 使用 localStorage 存储敏感数据 | 中 | XSS 后数据泄露 |
| 缺少输入验证 | 中 | 各类注入攻击 |
| 不安全的依赖版本 | 中 | 已知漏洞利用 |
| 控制台输出敏感信息 | 低 | 信息泄露 |

### 9.2 自动化安全检查

```json
// package.json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high",
    "security:lint": "eslint --config .eslintrc.security.js src/",
    "security:check": "npm run security:audit && npm run security:lint",
    "precommit": "npm run security:check"
  }
}
```

### 9.3 CI/CD 安全检查

```yaml
# .github/workflows/security.yml
name: Security Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run npm audit
        run: npm audit --audit-level=high
        
      - name: Run ESLint security rules
        run: npm run security:lint
        
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## 10. 安全工具推荐

### 10.1 静态分析工具

| 工具 | 用途 | 安装 |
|------|------|------|
| ESLint + eslint-plugin-security | 代码安全检查 | `npm i -D eslint-plugin-security` |
| SonarQube | 代码质量和安全 | 服务端部署 |
| Semgrep | 语义代码分析 | `pip install semgrep` |
| CodeQL | GitHub 代码扫描 | GitHub 集成 |

### 10.2 依赖安全工具

| 工具 | 用途 | 安装 |
|------|------|------|
| npm audit | npm 内置审计 | 内置 |
| Snyk | 依赖漏洞扫描 | `npm i -g snyk` |
| Dependabot | 自动依赖更新 | GitHub 集成 |
| Socket | 供应链安全 | GitHub 集成 |

### 10.3 运行时保护

| 工具 | 用途 |
|------|------|
| DOMPurify | HTML 净化 |
| js-xss | XSS 过滤 |
| validator.js | 输入验证 |
| zod | 类型安全验证 |

## 11. 安全事件响应

### 11.1 漏洞报告流程

```typescript
/**
 * 安全事件上报
 */
interface SecurityEvent {
  type: 'xss' | 'csrf' | 'injection' | 'unauthorized' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  url: string
  userAgent: string
  timestamp: number
}

function reportSecurityEvent(event: Omit<SecurityEvent, 'userAgent' | 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  }
  
  // 发送到安全监控服务
  navigator.sendBeacon('/api/security/report', JSON.stringify(fullEvent))
  
  // 控制台警告
  console.warn('安全事件:', fullEvent)
}

// CSP 违规报告处理
document.addEventListener('securitypolicyviolation', (e) => {
  reportSecurityEvent({
    type: 'other',
    severity: 'medium',
    description: `CSP 违规: ${e.violatedDirective}`,
    url: e.blockedURI,
  })
})
```

### 11.2 安全日志记录

```typescript
/**
 * 安全日志记录器
 */
class SecurityLogger {
  private static instance: SecurityLogger
  private logs: Array<{ level: string; message: string; data: unknown; timestamp: number }> = []
  
  static getInstance(): SecurityLogger {
    if (!this.instance) {
      this.instance = new SecurityLogger()
    }
    return this.instance
  }
  
  private log(level: string, message: string, data?: unknown): void {
    const entry = {
      level,
      message,
      data,
      timestamp: Date.now(),
    }
    
    this.logs.push(entry)
    
    // 开发环境打印
    if (import.meta.env.DEV) {
      console[level as 'log' | 'warn' | 'error'](`[Security] ${message}`, data)
    }
    
    // 高危事件立即上报
    if (level === 'error') {
      this.flush()
    }
  }
  
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }
  
  error(message: string, data?: unknown): void {
    this.log('error', message, data)
  }
  
  flush(): void {
    if (this.logs.length === 0) return
    
    navigator.sendBeacon('/api/security/logs', JSON.stringify(this.logs))
    this.logs = []
  }
}

export const securityLogger = SecurityLogger.getInstance()

// 页面卸载时发送日志
window.addEventListener('beforeunload', () => {
  securityLogger.flush()
})
```

## 12. 代码注释规范

```typescript
/**
 * 安全相关函数必须添加详细注释
 * @security 此函数涉及安全敏感操作
 * @param input - 用户输入，已进行 XSS 过滤
 * @returns 净化后的安全字符串
 * @throws {SecurityError} 当检测到恶意内容时抛出
 * @example
 * const safe = sanitize('<script>alert(1)</script>')
 * // 返回: ''
 */
function sanitize(input: string): string {
  // 安全实现
}

/**
 * @deprecated 此函数存在安全风险，请使用 safeAlternative() 代替
 * @security-risk XSS 漏洞风险
 */
function unsafeFunction(): void {
  // ...
}
```

