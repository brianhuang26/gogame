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
 * Optional JWT Authentication Middleware for Development
 * 可選的 JWT 認證中介軟體（開發用）
 * 
 * If no token is provided in development mode, creates a mock user
 */
export function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development, allow access without token with mock user
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          playerId: 'dev-player-1',
          username: 'DevPlayer'
        };
        logger.debug('Using mock user in development mode');
        next();
        return;
      }

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
    
    // In development, fall back to mock user
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        playerId: 'dev-player-1',
        username: 'DevPlayer'
      };
      logger.debug('JWT verification failed, using mock user in development mode');
      next();
      return;
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '無效的認證令牌'
      }
    });
  }
}
