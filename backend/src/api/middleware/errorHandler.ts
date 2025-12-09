import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { ValidationError, GameLogicError } from '../../utils/validation';

/**
 * Error Handling Middleware
 * 錯誤處理中介軟體
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('請求錯誤', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // 驗證錯誤
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
    return;
  }

  // 遊戲邏輯錯誤
  if (error instanceof GameLogicError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'GAME_LOGIC_ERROR',
        message: error.message
      }
    });
    return;
  }

  // 預設錯誤
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? '伺服器內部錯誤'
        : error.message
    }
  });
}
