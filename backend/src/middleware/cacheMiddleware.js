// src/middleware/cache.js
import redis from "../config/redis.js";

/**
 * Cache middleware
 * @param {number} ttlSeconds - Time to live
 * @param {object} options
 * @param {boolean} options.userSpecific - Scope cache key to logged-in user (required for protected routes)
 */
export const cache = (ttlSeconds = 300, options = {}) =>
  async (req, res, next) => {
    const scope = options.userSpecific && req.user?._id
      ? `user:${req.user._id}`
      : "global";

    const key = `cache:${scope}:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`[Cache HIT] ${key}`);
        return res.json(JSON.parse(cached));
      }

      // Intercept res.json to store response in cache
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await redis.setex(key, ttlSeconds, JSON.stringify(data));
        }
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error("[Cache] Middleware error:", err.message);
      next(); // Fail silently — never block a request
    }
  };

/**
 * Delete cache keys matching a pattern
 * Use after mutations to invalidate stale data
 * @param {string[]} patterns - e.g. ["cache:global:/api/products*", "cache:user:abc123:*"]
 */
export const invalidateCache = async (...patterns) => {
  try {
    for (const pattern of patterns) {
      // SCAN is non-blocking unlike KEYS — safe for production
      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log(`[Cache] Invalidated ${keys.length} key(s) for pattern: ${pattern}`);
        }
      } while (cursor !== "0");
    }
  } catch (err) {
    console.error("[Cache] Invalidation error:", err.message);
  }
};