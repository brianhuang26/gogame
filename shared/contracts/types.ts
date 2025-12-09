/**
 * Shared TypeScript Interfaces for Go Game Implementation
 * 圍棋線上對戰系統 - 共用型別定義
 */

// ========== 基本型別 ==========

/**
 * 棋盤位置座標
 */
export interface Position {
  x: number; // 0-based index
  y: number; // 0-based index
}

/**
 * 棋子顏色
 */
export type StoneColor = 'black' | 'white';

/**
 * 棋盤格子狀態
 * 0: 空位
 * 1: 黑子
 * -1: 白子
 */
export type BoardCell = 0 | 1 | -1;

/**
 * 棋盤尺寸
 */
export type BoardSize = 9 | 13 | 19;

/**
 * 對局規則
 */
export type GameRules = 'chinese';

/**
 * 對局狀態
 */
export type GameStatus =
  | 'waiting'       // 等待玩家加入
  | 'in_progress'   // 進行中
  | 'completed'     // 已結束
  | 'flagged'       // 待審查（疑似作弊）
  | 'abandoned';    // 已放棄

/**
 * 勝負結果
 */
export type GameWinner = 'black' | 'white' | 'draw';

/**
 * 結束方式
 */
export type GameEndMethod = 'score' | 'resignation' | 'timeout' | 'admin';

// ========== 遊戲狀態 ==========

/**
 * 棋盤狀態
 */
export interface GameState {
  currentBoard: BoardCell[][];
  currentTurn: StoneColor;
  moveNumber: number;
  capturedStones: {
    black: number;  // 黑棋提取的白子數
    white: number;  // 白棋提取的黑子數
  };
  boardHistory: string[];  // Zobrist hash 值陣列
  currentHash: string;
  koPoint: Position | null;  // 禁入點（打劫位置）
  lastMove: Position | null;
  consecutivePasses: number; // 連續 Pass 次數
  status: GameStatus; // 對局狀態
  score?: {
    black: number;
    white: number;
    blackTerritory: number;
    whiteTerritory: number;
    blackCaptured: number;
    whiteCaptured: number;
  };
}

/**
 * 著手記錄
 */
export interface Move {
  moveNumber: number;
  color: StoneColor;
  position: Position;
  timestamp: Date;
  thinkTime: number;  // 思考時間（秒）
  captured: Position[];
  capturedCount: number;
  boardHashAfter: string;
  isPass?: boolean;
  comment?: string;
}

/**
 * 對局中玩家資訊
 */
export interface PlayerInGame {
  playerId: string;
  name: string;
  rating: number;
  color: StoneColor;
}

/**
 * 對局結果
 */
export interface GameResult {
  winner: GameWinner;
  method: GameEndMethod;
  score?: {
    black: number;
    white: number;
    blackTerritory: number;
    whiteTerritory: number;
    blackCaptured: number;
    whiteCaptured: number;
  };
  timestamp: Date;
}

/**
 * 完整對局資料
 */
export interface Game {
  _id?: string;
  gameId: string;
  boardSize: BoardSize;
  rules: GameRules;
  komi: number;
  players: {
    black: PlayerInGame;
    white: PlayerInGame;
  };
  state: GameState;
  moves: Move[];
  timer?: TimerConfig;
  status: GameStatus;
  result?: GameResult;
  flags?: CheatFlag[];
  createdAt: Date;
  updatedAt: Date;
}

// ========== 計時器 ==========

export type TimerMode = 'fischer' | 'byo-yomi' | 'canadian';

export interface TimerState {
  mainTime: number;  // 主時間（秒）
  byoYomiTime?: number;
  byoYomiPeriods?: number;
  periodTime?: number;
  periodMoves?: number;
  increment?: number;
  isActive: boolean;
  lastUpdated: Date;
}

export interface TimerConfig {
  mode: TimerMode;
  black: TimerState;
  white: TimerState;
  config: FischerConfig | ByoYomiConfig | CanadianConfig;
}

export interface FischerConfig {
  initialTime: number;
  increment: number;
}

export interface ByoYomiConfig {
  mainTime: number;
  byoYomiTime: number;
  byoYomiPeriods: number;
}

export interface CanadianConfig {
  mainTime: number;
  periodTime: number;
  periodMoves: number;
}

// ========== 防作弊 ==========

export type CheatFlagType =
  | 'FAST_MOVES'
  | 'AI_PATTERN'
  | 'MULTI_DEVICE'
  | 'RATING_MANIPULATION'
  | 'OTHER';

export interface CheatFlag {
  flagId: string;
  gameId: string;
  playerId: string;
  type: CheatFlagType;
  details: Record<string, any>;
  reviewStatus: 'pending' | 'confirmed' | 'dismissed';
  reviewedBy?: string;
  reviewNotes?: string;
  flaggedAt: Date;
  reviewedAt?: Date;
}

// ========== 棋群分析 ==========

export interface Group {
  stones: Position[];
  color: StoneColor;
  liberties: Position[];
  libertyCount: number;
}

// ========== API 回應 ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface MoveResult {
  move: Move;
  gameState: GameState;
  captured: Position[];
}
