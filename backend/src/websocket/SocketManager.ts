import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { GameEngine } from '../services/game/GameEngine';
import { GameRepository } from '../db/repositories/GameRepository';
import { Position, StoneColor } from '../../../shared/contracts/types';
import { QueueService } from '../services/matchmaking/QueueService';

/**
 * Socket.IO Manager
 * WebSocket 連線管理
 */
export class SocketManager {
  private io: SocketIOServer;
  private gameRepository: GameRepository;
  private queueService: QueueService;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.gameRepository = new GameRepository();
    this.queueService = new QueueService();
    this.initialize();
  }

  private initialize(): void {
    // Socket authentication middleware (optional in development)
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          // In development, allow connection with mock user
          if (process.env.NODE_ENV === 'development') {
            const randomId = Math.floor(Math.random() * 10000).toString();
            socket.data.user = {
              playerId: `dev-player-${randomId}`,
              username: `DevPlayer${randomId}`
            };
            logger.debug(`Socket connected with mock user in development mode: ${socket.data.user.username}`);
            return next();
          }
          return next(new Error('未提供認證令牌'));
        }

        const secret = process.env.JWT_SECRET || 'default-secret';
        const decoded = jwt.verify(token, secret) as {
          playerId: string;
          username: string;
        };

        socket.data.user = decoded;
        next();
      } catch (error) {
        // In development, fall back to mock user
        if (process.env.NODE_ENV === 'development') {
          const randomId = Math.floor(Math.random() * 10000).toString();
          socket.data.user = {
            playerId: `dev-player-${randomId}`,
            username: `DevPlayer${randomId}`
          };
          logger.debug(`Socket JWT verification failed, using mock user in development mode: ${socket.data.user.username}`);
          return next();
        }
        next(new Error('無效的認證令牌'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket 連線: ${socket.id}, 使用者: ${socket.data.user?.username}`);

      this.setupGameHandlers(socket);

      socket.on('disconnect', () => {
        this.queueService.removeFromQueue(socket.id);
        logger.info(`Socket 斷線: ${socket.id}`);
      });
    });
  }

  private setupGameHandlers(socket: Socket): void {
    /**
     * 加入對局房間
     */
    socket.on('game:join', async (data: { gameId: string }) => {
      try {
        const { gameId } = data;
        const game = await this.gameRepository.findByGameId(gameId);

        if (!game) {
          socket.emit('game:error', {
            code: 'GAME_NOT_FOUND',
            message: '找不到對局'
          });
          return;
        }

        // 加入房間
        await socket.join(`game:${gameId}`);

        // 發送當前對局狀態
        socket.emit('game:joined', {
          gameState: game.state,
          moves: game.moves,
          players: game.players,
          status: game.status
        });

        // 通知房間內其他人
        socket.to(`game:${gameId}`).emit('player:joined', {
          playerId: socket.data.user.playerId,
          username: socket.data.user.username
        });

        logger.info(`玩家加入對局: ${socket.data.user.username} -> ${gameId}`);
      } catch (error) {
        logger.error('加入對局失敗', error);
        socket.emit('game:error', {
          code: 'JOIN_ERROR',
          message: '加入對局失敗'
        });
      }
    });

    /**
     * 落子
     */
    socket.on('game:move', async (data: {
      gameId: string;
      position: Position;
      color: StoneColor
    }) => {
      try {
        const { gameId, position, color } = data;
        const game = await this.gameRepository.findByGameId(gameId);

        if (!game) {
          socket.emit('game:error', {
            code: 'GAME_NOT_FOUND',
            message: '找不到對局'
          });
          return;
        }

        const gameEngine = new GameEngine(game.boardSize);
        await gameEngine.initializeFromGame(gameId);

        const result = await gameEngine.placeStone(gameId, position, color);

        // 廣播給房間內所有人
        this.io.to(`game:${gameId}`).emit('game:move', {
          move: result.move,
          gameState: result.gameState,
          captured: result.captured
        });

        logger.info(`落子: ${gameId}, (${position.x}, ${position.y}), ${color}`);
      } catch (error) {
        logger.error('落子失敗', error);
        socket.emit('game:move:error', {
          code: 'MOVE_ERROR',
          message: error instanceof Error ? error.message : '落子失敗'
        });
      }
    });

    /**
     * 虛手 (Pass)
     */
    socket.on('game:pass', async (data: {
      gameId: string;
      color: StoneColor
    }) => {
      try {
        const { gameId, color } = data;
        const game = await this.gameRepository.findByGameId(gameId);

        if (!game) {
          socket.emit('game:error', {
            code: 'GAME_NOT_FOUND',
            message: '找不到對局'
          });
          return;
        }

        const gameEngine = new GameEngine(game.boardSize);
        await gameEngine.initializeFromGame(gameId);

        const result = await gameEngine.pass(gameId, color);

        // 廣播給房間內所有人
        this.io.to(`game:${gameId}`).emit('game:move', {
          move: result.move,
          gameState: result.gameState,
          captured: []
        });

        // 如果對局結束，發送 game:ended
        if (result.gameState.status === 'completed' && result.gameState.score) {
          const score = result.gameState.score;
          const winner = score.black > score.white ? 'black' : (score.white > score.black ? 'white' : 'draw');

          this.io.to(`game:${gameId}`).emit('game:ended', {
            result: {
              winner,
              method: 'score',
              score,
              timestamp: new Date()
            }
          });
        }

        logger.info(`虛手: ${gameId}, ${color}`);
      } catch (error) {
        logger.error('虛手失敗', error);
        socket.emit('game:move:error', {
          code: 'PASS_ERROR',
          message: error instanceof Error ? error.message : '虛手失敗'
        });
      }
    });

    /**
     * 投降
     */
    socket.on('game:resign', async (data: { gameId: string }) => {
      try {
        const { gameId } = data;
        const game = await this.gameRepository.findByGameId(gameId);

        if (!game) {
          socket.emit('game:error', {
            code: 'GAME_NOT_FOUND',
            message: '找不到對局'
          });
          return;
        }

        const playerId = socket.data.user.playerId;
        const playerColor = game.players.black.playerId === playerId ? 'black' : 'white';
        const winner = playerColor === 'black' ? 'white' : 'black';

        const result = {
          winner,
          method: 'resignation' as const,
          timestamp: new Date()
        };

        await this.gameRepository.endGame(gameId, result);

        // 廣播對局結束
        this.io.to(`game:${gameId}`).emit('game:ended', {
          result
        });

        logger.info(`投降: ${gameId}, 玩家: ${socket.data.user.username}`);
      } catch (error) {
        logger.error('投降失敗', error);
        socket.emit('game:error', {
          code: 'RESIGN_ERROR',
          message: '投降失敗'
        });
      }
    });

    /**
     * 配對相關事件
     */
    socket.on('matchmaking:join', async () => {
      try {
        const user = socket.data.user;
        this.queueService.addToQueue({
          socketId: socket.id,
          playerId: user.playerId,
          username: user.username
        });

        // 嘗試配對
        const match = this.queueService.findMatch();
        if (match) {
          // 建立對局 (預設 19路)
          const game = await this.gameRepository.create({
            boardSize: 19,
            blackPlayerId: match.black.playerId,
            blackPlayerName: match.black.username,
            blackPlayerRating: 1200, // 暫時預設
            whitePlayerId: match.white.playerId,
            whitePlayerName: match.white.username,
            whitePlayerRating: 1200
          });

          // 通知雙方
          [match.black.socketId, match.white.socketId].forEach(socketId => {
            this.io.to(socketId).emit('matchmaking:found', {
              gameId: game.gameId
            });
          });

          logger.info(`配對成功: ${game.gameId} (${match.black.username} vs ${match.white.username})`);
        }
      } catch (error) {
        logger.error('配對請求失敗', error);
        socket.emit('matchmaking:error', { message: '配對請求失敗，請稍後再試' });
      }
    });

    socket.on('matchmaking:cancel', () => {
      this.queueService.removeFromQueue(socket.id);
      logger.info(`取消配對: ${socket.data.user?.username}`);
    });
  }
}
