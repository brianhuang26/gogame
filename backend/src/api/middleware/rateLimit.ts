import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * 速率限制中介軟體
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 分鐘
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 限制 100 次請求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '請求過於頻繁，請稍後再試'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});
