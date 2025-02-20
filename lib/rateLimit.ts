import { Redis } from 'ioredis';
import { AppError,ERROR_MESSAGES } from '@/components/errorUtils';

if (!process.env.REDIS_URL) {
  throw new AppError(ERROR_MESSAGES.REDIS_CONFIG_ERROR, 500);
}
const redis = new Redis(process.env.REDIS_URL);

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}
export const rateLimiter = async (
  identifier: string,
  config: RateLimitConfig = { windowMs: 300000, maxAttempts: 3 },
  recordFailure: boolean = false,
  reset: boolean = false
) => {
  if (!identifier) {
    return {
      success: false,
      message: "Identifier is required for rate limiting."
    };
  }
  const key = `ratelimit:${identifier}`;

  try {
    if (reset) {
      await redis.del(key);
      return {
        success: true,
        attemptsRemaining: config.maxAttempts
      };
    }

    const currentCount = await redis.get(key);
    const attempts = currentCount ? parseInt(currentCount) : 0;

    if (attempts >= config.maxAttempts) {
      const ttl = await redis.pttl(key);
      if (ttl > 0) {
        return {
          success: false,
          message: `Too many failed attempts. Please try again in ${Math.ceil(ttl / 1000)} seconds`,
          remainingTime: ttl
        };
      }
    }

    if (recordFailure) {
      await redis.multi()
        .incr(key)
        .pexpire(key, config.windowMs)
        .exec();
    }

    return {
      success: true,
      attemptsRemaining: config.maxAttempts - (recordFailure ? attempts + 1 : attempts)
    };
  }catch (error) {
    console.error('Rate limiter error:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ERROR_MESSAGES.REDIS_CONFIG_ERROR, 500);
  }
};
