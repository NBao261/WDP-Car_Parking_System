import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

// ─── Redis Client Singleton ──────────────────────────────
let redis: Redis | null = null;
let isConnected = false;

export function getRedis(): Redis | null {
  if (redis) return redis;

  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          logger.warn('[Redis] Max retries reached, giving up reconnection');
          return null; // stop retrying
        }
        return Math.min(times * 500, 3000);
      },
      lazyConnect: false,
    });

    redis.on('connect', () => {
      isConnected = true;
      logger.info('[Redis] Connected successfully');
    });

    redis.on('error', (err) => {
      isConnected = false;
      logger.error('[Redis] Connection error', { error: err.message });
    });

    redis.on('close', () => {
      isConnected = false;
      logger.warn('[Redis] Connection closed');
    });

    return redis;
  } catch (err: any) {
    logger.error('[Redis] Failed to create client', { error: err.message });
    return null;
  }
}

export function isRedisConnected(): boolean {
  return isConnected && redis !== null;
}

// ─── Cache Helpers (graceful fallback khi Redis down) ────

/**
 * Đọc cache. Trả về null nếu miss hoặc Redis down.
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client || !isConnected) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Ghi cache với TTL (giây).
 */
export async function setCache(key: string, data: any, ttlSeconds: number): Promise<void> {
  try {
    const client = getRedis();
    if (!client || !isConnected) return;
    await client.setex(key, ttlSeconds, JSON.stringify(data));
  } catch {
    // silent fail — app vẫn hoạt động
  }
}

/**
 * Xoá 1 key.
 */
export async function delCache(key: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client || !isConnected) return;
    await client.del(key);
  } catch {
    // silent fail
  }
}

/**
 * Xoá theo pattern (dùng SCAN, không dùng KEYS để tránh block).
 * VD: delPattern('permissions:user:*')
 */
export async function delPattern(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client || !isConnected) return;

    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== '0');
  } catch {
    // silent fail
  }
}

/**
 * Kiểm tra membership trong SET — O(1).
 */
export async function sIsMember(key: string, member: string): Promise<boolean> {
  try {
    const client = getRedis();
    if (!client || !isConnected) return false;
    const result = await client.sismember(key, member);
    return result === 1;
  } catch {
    return false;
  }
}

export async function sAdd(key: string, member: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client || !isConnected) return;
    await client.sadd(key, member);
  } catch {
    // silent fail
  }
}

export async function sRem(key: string, member: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client || !isConnected) return;
    await client.srem(key, member);
  } catch {
    // silent fail
  }
}
