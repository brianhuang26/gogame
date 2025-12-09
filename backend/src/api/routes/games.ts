import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';
import { GameRepository } from '../../db/repositories/GameRepository';
import { GameEngine } from '../../services/game/GameEngine';
import { validateBoardSize, validateKomi } from '../../utils/validation';
import { BoardSize, Position, StoneColor } from '../../../../shared/contracts/types';

const router = Router();

/**
 * POST /api/v1/games - 建立新對局
 */
router.post('/', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const gameRepository = new GameRepository();
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
router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const gameRepository = new GameRepository();
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
router.post('/:id/moves', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const gameRepository = new GameRepository();
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
 * POST /api/v1/games/:id/pass - 虛手
 */
router.post('/:id/pass', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const gameRepository = new GameRepository();
    const { id } = req.params;
    const { color } = req.body as { color: StoneColor };

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

    const result = await gameEngine.pass(id, color);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'PASS_ERROR',
        message: error instanceof Error ? error.message : '虛手失敗'
      }
    });
  }
});

/**
 * POST /api/v1/games/:id/end - 結束對局
 */
router.post('/:id/end', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const gameRepository = new GameRepository();
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
