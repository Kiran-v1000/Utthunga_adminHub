import { createClient } from 'redis';

export const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

redis.on('error', (err) => {
  // Non-fatal in dev — Redis used for caching only; tokens fall back to DB
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Redis] Not connected (non-fatal in dev):', err.message);
  }
});

export async function connectRedis() {
  try {
    if (!redis.isOpen) await redis.connect();
  } catch (err) {
    console.warn('[Redis] Skipping connection:', (err as Error).message);
  }
}

connectRedis();
