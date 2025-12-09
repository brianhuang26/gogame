import { Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { dbConnection } from '../connection';
import { Game } from '../../models/Game';
import {
  BoardSize,
  BoardCell,
  GameState
} from '../../../../shared/contracts/types';
import { logger } from '../../utils/logger';

/**
 * Game Repository for MongoDB operations
 * 對局資料庫操作
 */
export class GameRepository {
  private collection: Collection<Game>;

  constructor() {
    this.collection = dbConnection.getDb().collection<Game>('games');
  }

  /**
   * 建立新對局
   */
  async create(params: {
    boardSize: BoardSize;
    blackPlayerId: string;
    blackPlayerName: string;
    blackPlayerRating: number;
    whitePlayerId: string;
    whitePlayerName: string;
    whitePlayerRating: number;
    komi?: number;
  }): Promise<Game> {
    const gameId = uuidv4();
    const now = new Date();
    const boardSize = params.boardSize;

    // 初始化空棋盤
    const emptyBoard: BoardCell[][] = Array(boardSize)
      .fill(0)
      .map(() => Array(boardSize).fill(0) as BoardCell[]);

    const initialState: GameState = {
      currentBoard: emptyBoard,
      currentTurn: 'black',
      moveNumber: 0,
      capturedStones: {
        black: 0,
        white: 0
      },
      boardHistory: [],
      currentHash: '0',
      koPoint: null,
      lastMove: null,
      consecutivePasses: 0,
      status: 'in_progress'
    };

    const game: Game = {
      gameId,
      boardSize,
      rules: 'chinese',
      komi: params.komi || 7.5,
      players: {
        black: {
          playerId: params.blackPlayerId,
          name: params.blackPlayerName,
          rating: params.blackPlayerRating,
          color: 'black'
        },
        white: {
          playerId: params.whitePlayerId,
          name: params.whitePlayerName,
          rating: params.whitePlayerRating,
          color: 'white'
        }
      },
      state: initialState,
      moves: [],
      status: 'in_progress',
      createdAt: now,
      updatedAt: now
    };

    await this.collection.insertOne(game as any);
    logger.info(`建立對局: ${gameId}`);

    return game;
  }

  /**
   * 根據 gameId 查詢對局
   */
  async findByGameId(gameId: string): Promise<Game | null> {
    return this.collection.findOne({ gameId });
  }

  /**
   * 更新對局狀態
   */
  async updateGameState(gameId: string, state: GameState): Promise<void> {
    await this.collection.updateOne(
      { gameId },
      {
        $set: {
          state,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * 新增著手記錄
   */
  async addMove(gameId: string, move: any): Promise<void> {
    await this.collection.updateOne(
      { gameId },
      {
        $push: { moves: move },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * 結束對局
   */
  async endGame(gameId: string, result: any): Promise<void> {
    await this.collection.updateOne(
      { gameId },
      {
        $set: {
          status: 'completed',
          result,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * 更新對局結果（別名 endGame，為了相容性）
   */
  async updateGameResult(gameId: string, result: any): Promise<void> {
    return this.endGame(gameId, result);
  }

  /**
   * 查詢玩家的對局歷史
   */
  async findPlayerGames(playerId: string, limit: number = 20): Promise<Game[]> {
    return this.collection
      .find({
        $or: [
          { 'players.black.playerId': playerId },
          { 'players.white.playerId': playerId }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * 查詢進行中的對局
   */
  async findActiveGames(limit: number = 50): Promise<Game[]> {
    return this.collection
      .find({ status: 'in_progress' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
}
