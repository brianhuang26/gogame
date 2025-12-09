import { BoardSize, BoardCell, Position, StoneColor } from '../../../../shared/contracts/types';

/**
 * Zobrist Hashing for efficient board state comparison
 * 使用 Zobrist 雜湊實現高效棋盤狀態比對
 * 
 * Time Complexity: O(1) for hash lookup, O(k) for hash update (k = number of stones changed)
 * Space Complexity: O(n²) for hash table (n = board size)
 */
export class ZobristHash {
  private table: Map<string, bigint>;
  private currentHash: bigint;
  private boardSize: number;

  constructor(boardSize: BoardSize) {
    this.boardSize = boardSize;
    this.table = new Map();
    this.currentHash = 0n;
    this.initializeTable();
  }

  /**
   * 初始化 Zobrist 雜湊表
   */
  private initializeTable(): void {
    for (let x = 0; x < this.boardSize; x++) {
      for (let y = 0; y < this.boardSize; y++) {
        this.table.set(`${x},${y},black`, this.randomBigInt());
        this.table.set(`${x},${y},white`, this.randomBigInt());
      }
    }
  }

  /**
   * 產生 64-bit 隨機數
   */
  private randomBigInt(): bigint {
    const high = BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
    const low = BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
    return (high << 32n) | low;
  }

  /**
   * 更新雜湊值（新增或移除棋子）
   */
  updateHash(position: Position, color: StoneColor): void {
    const key = `${position.x},${position.y},${color}`;
    const hashValue = this.table.get(key);
    if (hashValue !== undefined) {
      this.currentHash ^= hashValue;
    }
  }

  /**
   * 計算完整棋盤的雜湊值
   */
  calculateBoardHash(board: BoardCell[][]): string {
    let hash = 0n;
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        const cell = board[y][x];
        if (cell !== 0) {
          const color: StoneColor = cell === 1 ? 'black' : 'white';
          const key = `${x},${y},${color}`;
          const hashValue = this.table.get(key);
          if (hashValue !== undefined) {
            hash ^= hashValue;
          }
        }
      }
    }
    return hash.toString();
  }

  /**
   * 取得當前雜湊值
   */
  getHash(): string {
    return this.currentHash.toString();
  }

  /**
   * 重設雜湊值
   */
  reset(): void {
    this.currentHash = 0n;
  }

  /**
   * 設定雜湊值（用於棋盤狀態恢復）
   */
  setHash(hash: string): void {
    this.currentHash = BigInt(hash);
  }
}
