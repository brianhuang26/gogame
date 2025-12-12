import { Router } from 'express';
import { AuthService } from '../../services/auth/AuthService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const authService = new AuthService();

/**
 * @route POST /api/v1/auth/register
 * @desc 註冊新使用者
 * @access Public
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const result = await authService.register(username, email, password);
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /api/v1/auth/login
 * @desc 使用者登入
 * @access Public
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/v1/auth/me
 * @desc 取得當前使用者資料
 * @access Private
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
        const player = await authService.getMe(req.user!.playerId);
        res.json({
            success: true,
            data: player
        });
    } catch (error) {
        next(error);
    }
});

export default router;
