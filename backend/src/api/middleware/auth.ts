import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    playerId: string;
    username: string;
  };
}

/**
 * JWT Authentication Middleware
 * JWT 認證中介軟體
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供認證令牌'
        }
      });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'default-secret';

    const decoded = jwt.verify(token, secret) as {
      playerId: string;
      username: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT 驗證失敗', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '無效的認證令牌'
      }
    });
  }
}
