import {
  BoardCell,
  Position,
  StoneColor,
  MoveResult,
  Move,
  BoardSize,
  GameState
} from '../../../../shared/contracts/types';
import { ZobristHash } from './ZobristHash';
import { SuperKoChecker } from './SuperKoChecker';
import { BoardAnalyzer } from './BoardAnalyzer';
import { ScoringService } from './ScoringService';
import { GameRepository } from '../../db/repositories/GameRepository';
import {
  validatePosition,
  validateStoneColor,
  GameLogicError,
  ErrorMessages
} from '../../utils/validation';
import { logger } from '../../utils/logger';

/**
 * Game Engine - Core game logic
 * 遊戲規則引擎 - 核心邏輯
 */
export class GameEngine {
  private zobristHash: ZobristHash;
  private superKoChecker: SuperKoChecker;
  private boardAnalyzer: BoardAnalyzer;
  private gameRepository: GameRepository;

  constructor(boardSize: BoardSize) {
    this.zobristHash = new ZobristHash(boardSize);
    this.superKoChecker = new SuperKoChecker();
    this.boardAnalyzer = new BoardAnalyzer(boardSize);
    this.gameRepository = new GameRepository();
  }

  /**
   * 落子主邏輯
   */
  async placeStone(
    gameId: string,
    position: Position,
    color: StoneColor
  ): Promise<MoveResult> {
    const game = await this.gameRepository.findByGameId(gameId);
    if (!game) {
      throw new GameLogicError(ErrorMessages.GAME_NOT_FOUND);
    }

    if (game.status !== 'in_progress') {
      throw new GameLogicError(ErrorMessages.GAME_ENDED);
    }

    // 驗證基本合法性
    validatePosition(position, game.boardSize);
    validateStoneColor(color);

    // 檢查是否為正確的回合
    if (game.state.currentTurn !== color) {
      throw new GameLogicError(ErrorMessages.INVALID_TURN);
    }

    const board = game.state.currentBoard;

    // 檢查位置是否已有棋子
    if (board[position.y][position.x] !== 0) {
      throw new GameLogicError(ErrorMessages.POSITION_OCCUPIED);
    }

    // 模擬落子
    const newBoard = this.copyBoard(board);
    const cellValue = color === 'black' ? 1 : -1;
    newBoard[position.y][position.x] = cellValue;

    // 提子判定
    const opponentColor: StoneColor = color === 'black' ? 'white' : 'black';
    const captured = this.captureStones(newBoard, opponentColor);

    // 禁入點檢查（自殺手）- 只有在沒有提子的情況下才檢查
    if (captured.length === 0 && this.boardAnalyzer.isSuicide(board, position, color)) {
      throw new GameLogicError(ErrorMessages.SUICIDE_MOVE);
    }

    // 超級打劫檢查
    const newHash = this.zobristHash.calculateBoardHash(newBoard);
    if (this.superKoChecker.isRepeated(newHash)) {
      throw new GameLogicError(ErrorMessages.KO_VIOLATION);
    }

    // 更新棋盤狀態
    const moveNumber = game.state.moveNumber + 1;
    const now = new Date();
    const thinkTime = game.state.lastMove
      ? (now.getTime() - new Date(game.moves[game.moves.length - 1]?.timestamp || now).getTime()) / 1000
      : 0;

    const move: Move = {
      moveNumber,
      color,
      position,
      timestamp: now,
      thinkTime,
      captured,
      capturedCount: captured.length,
      boardHashAfter: newHash,
      isPass: false
    };

    // 更新提子統計
    const newCapturedStones = { ...game.state.capturedStones };
    if (color === 'black') {
      newCapturedStones.black += captured.length;
    } else {
      newCapturedStones.white += captured.length;
    }

    // 更新狀態
    const newState: GameState = {
      currentBoard: newBoard,
      currentTurn: opponentColor,
      moveNumber,
      capturedStones: newCapturedStones,
      boardHistory: [...game.state.boardHistory, newHash],
      currentHash: newHash,
      koPoint: captured.length === 1 ? captured[0] : null,
      lastMove: position,
      consecutivePasses: 0,
      status: 'in_progress'
    };

    // 儲存到資料庫
    await this.gameRepository.updateGameState(gameId, newState);
    await this.gameRepository.addMove(gameId, move);

    // 更新 SuperKo 檢查器
    this.superKoChecker.addPosition(newHash);

    logger.info(`落子成功: ${gameId}, 手數: ${moveNumber}, 位置: (${position.x}, ${position.y}), 提子: ${captured.length}`);

    return {
      move,
      gameState: newState,
      captured
    };
  }

  /**
   * 虛手（Pass）
   */
  async pass(gameId: string, color: StoneColor): Promise<MoveResult> {
    const game = await this.gameRepository.findByGameId(gameId);
    if (!game) {
      throw new GameLogicError(ErrorMessages.GAME_NOT_FOUND);
    }

    if (game.status !== 'in_progress') {
      throw new GameLogicError(ErrorMessages.GAME_ENDED);
    }

    if (game.state.currentTurn !== color) {
      throw new GameLogicError(ErrorMessages.INVALID_TURN);
    }

    const moveNumber = game.state.moveNumber + 1;
    const now = new Date();
    const thinkTime = game.state.lastMove
      ? (now.getTime() - new Date(game.moves[game.moves.length - 1]?.timestamp || now).getTime()) / 1000
      : 0;

    const move: Move = {
      moveNumber,
      color,
      position: { x: -1, y: -1 }, // Pass position
      timestamp: now,
      thinkTime,
      captured: [],
      capturedCount: 0,
      boardHashAfter: game.state.currentHash,
      isPass: true
    };

    const consecutivePasses = (game.state.consecutivePasses || 0) + 1;
    let status = game.state.status;
    let score;

    logger.info(`Pass called. Previous consecutivePasses: ${game.state.consecutivePasses}, New: ${consecutivePasses}`);

    // Check for game end (2 consecutive passes)
    if (consecutivePasses >= 2) {
      status = 'completed';
      score = ScoringService.calculateScore(
        game.state.currentBoard,
        game.state.capturedStones,
        game.komi
      );

      // Update result
      const winner = score.black > score.white ? 'black' : (score.white > score.black ? 'white' : 'draw');
      await this.gameRepository.updateGameResult(gameId, {
        winner,
        method: 'score',
        score,
        timestamp: now
      });
    }

    const newState: GameState = {
      ...game.state,
      currentTurn: color === 'black' ? 'white' : 'black',
      moveNumber,
      consecutivePasses,
      status,
      score
    };

    await this.gameRepository.updateGameState(gameId, newState);
    await this.gameRepository.addMove(gameId, move);

    logger.info(`虛手成功: ${gameId}, 手數: ${moveNumber}, 連續 Pass: ${consecutivePasses}`);

    return {
      move,
      gameState: newState,
      captured: []
    };
  }

  /**
   * 提子邏輯 - 移除所有無氣的對手棋群
   */
  private captureStones(board: BoardCell[][], color: StoneColor): Position[] {
    const deadGroups = this.boardAnalyzer.findDeadGroups(board, color);
    const capturedPositions: Position[] = [];

    for (const group of deadGroups) {
      for (const stone of group.stones) {
        board[stone.y][stone.x] = 0;
        capturedPositions.push(stone);
      }
    }

    return capturedPositions;
  }

  /**
   * 複製棋盤
   */
  private copyBoard(board: BoardCell[][]): BoardCell[][] {
    return board.map(row => [...row]);
  }

  /**
   * 初始化引擎（從已有對局恢復狀態）
   */
  async initializeFromGame(gameId: string): Promise<void> {
    const game = await this.gameRepository.findByGameId(gameId);
    if (!game) {
      throw new GameLogicError(ErrorMessages.GAME_NOT_FOUND);
    }

    // 恢復 Zobrist hash
    this.zobristHash.setHash(game.state.currentHash);

    // 恢復 SuperKo 歷史
    this.superKoChecker.initializeFromHistory(game.state.boardHistory);

    logger.info(`引擎初始化完成: ${gameId}, 手數: ${game.state.moveNumber}`);
  }
}
