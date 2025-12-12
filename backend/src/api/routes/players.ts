import { Router } from 'express';
import { PlayerRepository } from '../../db/repositories/PlayerRepository';
import { ValidationError } from '../../utils/validation';

const router = Router();
const playerRepository = new PlayerRepository();

/**
 * @route GET /api/v1/players/:id
 * @desc 取得玩家公開資料
 * @access Public
 */
router.get('/:id', async (req, res, next) => {
    try {
        const playerId = req.params.id;
        const player = await playerRepository.findById(playerId);

        if (!player) {
            throw new ValidationError('找不到該玩家');
        }

        // 過濾敏感資訊
        const { passwordHash, ...publicProfile } = player;

        res.json({
            success: true,
            data: publicProfile
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/v1/players/:id/stats
 * @desc 取得玩家戰績
 * @access Public
 */
router.get('/:id/stats', async (req, res, next) => {
    try {
        const playerId = req.params.id;
        const player = await playerRepository.findById(playerId);

        if (!player) {
            throw new ValidationError('找不到該玩家');
        }

        res.json({
            success: true,
            data: player.stats
        });
    } catch (error) {
        next(error);
    }
});

export default router;
