import { describe, it, expect } from 'vitest'
import { parseMarkdown, isValidMarkdown } from '../utils/parser.js'

describe('parseMarkdown', () => {
  it('should parse markdown with frontmatter', () => {
    const content = `---
title: 测试文档
description: 这是一个测试文档
category: frontend
tags:
  - vue
  - test
---

# 测试内容

这是正文内容。
`

    const result = parseMarkdown(content, 'frontend/vue/test.md', 'local')

    expect(result.title).toBe('测试文档')
    expect(result.description).toBe('这是一个测试文档')
    expect(result.category).toBe('frontend')
    expect(result.tags).toEqual(['vue', 'test'])
    expect(result.source).toBe('local')
    expect(result.content).toContain('# 测试内容')
  })

  it('should extract title from markdown if not in frontmatter', () => {
    const content = `# 从内容提取的标题

这是正文。
`

    const result = parseMarkdown(content, 'frontend/vue/test.md', 'local')

    expect(result.title).toBe('从内容提取的标题')
  })

  it('should generate id from file path', () => {
    const content = `---
title: 测试
---

内容
`

    const result = parseMarkdown(content, 'frontend/vue/components.md', 'local')

    expect(result.id).toBe('frontend-vue-components')
  })

  it('should use custom id from frontmatter', () => {
    const content = `---
title: 测试
id: custom-id
---

内容
`

    const result = parseMarkdown(content, 'frontend/vue/test.md', 'local')

    expect(result.id).toBe('custom-id')
  })

  it('should extract category from path', () => {
    const content = `# 测试

内容
`

    const result = parseMarkdown(content, 'backend/api/restful.md', 'local')

    expect(result.category).toBe('backend')
    expect(result.subcategory).toBe('api')
  })

  it('should normalize tags from string', () => {
    const content = `---
title: 测试
tags: vue, react, typescript
---

内容
`

    const result = parseMarkdown(content, 'test.md', 'local')

    expect(result.tags).toEqual(['vue', 'react', 'typescript'])
  })
})

describe('isValidMarkdown', () => {
  it('should return true for valid markdown', () => {
    expect(isValidMarkdown('# Title\n\nContent')).toBe(true)
    expect(isValidMarkdown('Some text')).toBe(true)
  })

  it('should return false for invalid input', () => {
    expect(isValidMarkdown('')).toBe(false)
    expect(isValidMarkdown('   ')).toBe(false)
    expect(isValidMarkdown(null as unknown as string)).toBe(false)
    expect(isValidMarkdown(undefined as unknown as string)).toBe(false)
  })
})

