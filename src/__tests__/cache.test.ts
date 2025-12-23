import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Cache } from '../utils/cache.js'

describe('Cache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should set and get values', () => {
    const cache = new Cache<string>()

    cache.set('key1', 'value1')

    expect(cache.get('key1')).toBe('value1')
  })

  it('should return undefined for non-existent keys', () => {
    const cache = new Cache<string>()

    expect(cache.get('non-existent')).toBeUndefined()
  })

  it('should expire entries after TTL', () => {
    const cache = new Cache<string>(1000) // 1 秒 TTL

    cache.set('key1', 'value1')

    expect(cache.get('key1')).toBe('value1')

    // 前进 1.1 秒
    vi.advanceTimersByTime(1100)

    expect(cache.get('key1')).toBeUndefined()
  })

  it('should support custom TTL per entry', () => {
    const cache = new Cache<string>(10000) // 默认 10 秒

    cache.set('key1', 'value1', 500) // 自定义 0.5 秒

    expect(cache.get('key1')).toBe('value1')

    vi.advanceTimersByTime(600)

    expect(cache.get('key1')).toBeUndefined()
  })

  it('should check if key exists', () => {
    const cache = new Cache<string>()

    cache.set('key1', 'value1')

    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(false)
  })

  it('should delete entries', () => {
    const cache = new Cache<string>()

    cache.set('key1', 'value1')
    expect(cache.delete('key1')).toBe(true)
    expect(cache.get('key1')).toBeUndefined()
    expect(cache.delete('non-existent')).toBe(false)
  })

  it('should clear all entries', () => {
    const cache = new Cache<string>()

    cache.set('key1', 'value1')
    cache.set('key2', 'value2')

    cache.clear()

    expect(cache.size()).toBe(0)
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should cleanup expired entries', () => {
    const cache = new Cache<string>(1000)

    cache.set('key1', 'value1')
    cache.set('key2', 'value2', 2000) // 更长的 TTL

    vi.advanceTimersByTime(1100)

    cache.cleanup()

    expect(cache.size()).toBe(1)
    expect(cache.get('key2')).toBe('value2')
  })

  it('should report correct size', () => {
    const cache = new Cache<string>()

    expect(cache.size()).toBe(0)

    cache.set('key1', 'value1')
    expect(cache.size()).toBe(1)

    cache.set('key2', 'value2')
    expect(cache.size()).toBe(2)

    cache.delete('key1')
    expect(cache.size()).toBe(1)
  })
})

