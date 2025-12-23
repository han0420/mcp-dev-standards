import type { CacheEntry } from '../types/index.js'

/**
 * 简单的内存缓存实现
 * 支持 TTL（生存时间）
 */
export class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map()
  private defaultTTL: number

  /**
   * @param defaultTTL 默认缓存时间（毫秒）
   */
  constructor(defaultTTL: number = 3600000) {
    this.defaultTTL = defaultTTL
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 可选的自定义 TTL（毫秒）
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl ?? this.defaultTTL)

    this.store.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据，如果过期或不存在则返回 undefined
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key)

    if (!entry) {
      return undefined
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.data
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 删除指定缓存
   */
  delete(key: string): boolean {
    return this.store.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.store.size
  }
}

