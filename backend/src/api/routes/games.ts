import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { GameRepository } from '../../db/repositories/GameRepository';
import { GameEngine } from '../../services/game/GameEngine';
import { validatePosition, validateBoardSize, validateKomi } from '../../utils/validation';
import { BoardSize, Position, StoneColor } from '../../../../shared/contracts/types';

const router = Router();
const gameRepository = new GameRepository();

/**
 * POST /api/v1/games - 建立新對局
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { boardSize, opponentId, komi } = req.body;

    validateBoardSize(boardSize);
    if (komi !== undefined) {
      validateKomi(komi);
    }

    // TODO: 從資料庫取得玩家資訊
    const game = await gameRepository.create({
      boardSize: boardSize as BoardSize,
      blackPlayerId: req.user!.playerId,
      blackPlayerName: req.user!.username,
      blackPlayerRating: 1500,
      whitePlayerId: opponentId,
      whitePlayerName: 'Opponent', // TODO: 從資料庫查詢
      whitePlayerRating: 1500,
      komi
    });

    res.status(201).json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'CREATE_GAME_ERROR',
        message: error instanceof Error ? error.message : '建立對局失敗'
      }
    });
  }
});

/**
 * GET /api/v1/games/:id - 取得對局資訊
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const game = await gameRepository.findByGameId(id);

    if (!game) {
      res.status(404).json({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: '找不到對局'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_GAME_ERROR',
        message: '取得對局失敗'
      }
    });
  }
});

/**
 * POST /api/v1/games/:id/moves - 落子
 */
router.post('/:id/moves', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { position, color } = req.body as { position: Position; color: StoneColor };

    const game = await gameRepository.findByGameId(id);
    if (!game) {
      res.status(404).json({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: '找不到對局'
        }
      });
      return;
    }

    const gameEngine = new GameEngine(game.boardSize);
    await gameEngine.initializeFromGame(id);

    const result = await gameEngine.placeStone(id, position, color);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MOVE_ERROR',
        message: error instanceof Error ? error.message : '落子失敗'
      }
    });
  }
});

/**
 * POST /api/v1/games/:id/end - 結束對局
 */
router.post('/:id/end', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { method, winner } = req.body;

    const result = {
      winner,
      method,
      timestamp: new Date()
    };

    await gameRepository.endGame(id, result);

    res.json({
      success: true,
      data: { result }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'END_GAME_ERROR',
        message: '結束對局失敗'
      }
    });
  }
});

export default router;
