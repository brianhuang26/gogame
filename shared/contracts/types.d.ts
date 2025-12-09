/**
 * Shared TypeScript Interfaces for Go Game Implementation
 * 圍棋線上對戰系統 - 共用型別定義
 */
/**
 * 棋盤位置座標
 */
export interface Position {
    x: number;
    y: number;
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
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'flagged' | 'abandoned';
/**
 * 勝負結果
 */
export type GameWinner = 'black' | 'white' | 'draw';
/**
 * 結束方式
 */
export type GameEndMethod = 'score' | 'resignation' | 'timeout' | 'admin';
/**
 * 棋盤狀態
 */
export interface GameState {
    currentBoard: BoardCell[][];
    currentTurn: StoneColor;
    moveNumber: number;
    capturedStones: {
        black: number;
        white: number;
    };
    boardHistory: string[];
    currentHash: string;
    koPoint: Position | null;
    lastMove: Position | null;
}
/**
 * 著手記錄
 */
export interface Move {
    moveNumber: number;
    color: StoneColor;
    position: Position;
    timestamp: Date;
    thinkTime: number;
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
export type TimerMode = 'fischer' | 'byo-yomi' | 'canadian';
export interface TimerState {
    mainTime: number;
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
export type CheatFlagType = 'FAST_MOVES' | 'AI_PATTERN' | 'MULTI_DEVICE' | 'RATING_MANIPULATION' | 'OTHER';
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
export interface Group {
    stones: Position[];
    color: StoneColor;
    liberties: Position[];
    libertyCount: number;
}
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
//# sourceMappingURL=types.d.ts.map