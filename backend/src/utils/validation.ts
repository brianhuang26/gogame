import { Position, BoardSize, StoneColor } from '../../../shared/contracts/types';

/**
 * Validation utility for game inputs
 * 遊戲輸入驗證工具
 */

/**
 * 驗證棋盤位置是否合法
 */
export function validatePosition(position: Position, boardSize: BoardSize): void {
  if (!Number.isInteger(position.x) || !Number.isInteger(position.y)) {
    throw new ValidationError('座標必須為整數');
  }

  if (position.x < 0 || position.x >= boardSize) {
    throw new ValidationError(`X 座標超出範圍 (0-${boardSize - 1})`);
  }

  if (position.y < 0 || position.y >= boardSize) {
    throw new ValidationError(`Y 座標超出範圍 (0-${boardSize - 1})`);
  }
}

/**
 * 驗證棋子顏色
 */
export function validateStoneColor(color: StoneColor): void {
  if (color !== 'black' && color !== 'white') {
    throw new ValidationError('顏色必須為 black 或 white');
  }
}

/**
 * 驗證棋盤尺寸
 */
export function validateBoardSize(size: BoardSize): void {
  if (size !== 9 && size !== 13 && size !== 19) {
    throw new ValidationError('棋盤尺寸必須為 9、13 或 19');
  }
}

/**
 * 驗證貼目
 */
export function validateKomi(komi: number): void {
  if (typeof komi !== 'number' || isNaN(komi)) {
    throw new ValidationError('貼目必須為數字');
  }

  if (komi < 0 || komi > 20) {
    throw new ValidationError('貼目必須在 0-20 之間');
  }
}

/**
 * 驗證錯誤類別
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 遊戲邏輯錯誤
 */
export class GameLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameLogicError';
  }
}

/**
 * 錯誤訊息（正體中文）
 */
export const ErrorMessages = {
  POSITION_OCCUPIED: '此位置已有棋子',
  INVALID_POSITION: '無效的座標',
  INVALID_TURN: '不是您的回合',
  KO_VIOLATION: '禁止重複盤面（打劫規則）',
  SUICIDE_MOVE: '禁止落子：會導致己方棋子無氣',
  GAME_ENDED: '對局已結束',
  GAME_NOT_FOUND: '找不到對局',
  PLAYER_NOT_IN_GAME: '您不在此對局中',
  UNAUTHORIZED: '未授權操作',
  TIMEOUT: '超時',
  INVALID_GAME_STATE: '無效的對局狀態'
};
