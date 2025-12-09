import { BoardCell, Position, StoneColor, Group, BoardSize } from '../../../../shared/contracts/types';

/**
 * Board Analyzer for group detection and liberty calculation
 * 棋盤分析器 - 使用 BFS 偵測棋群與計算氣數
 */
export class BoardAnalyzer {
  private boardSize: number;

  constructor(boardSize: BoardSize) {
    this.boardSize = boardSize;
  }

  /**
   * 使用 BFS 找出連通的棋群
   */
  findGroup(board: BoardCell[][], start: Position): Group {
    const color = board[start.y][start.x];
    if (color === 0) {
      throw new Error('無法從空位開始搜尋棋群');
    }

    const visited = new Set<string>();
    const stones: Position[] = [];
    const liberties = new Set<string>();

    const queue: Position[] = [start];
    visited.add(this.positionKey(start));

    while (queue.length > 0) {
      const pos = queue.shift()!;
      stones.push(pos);

      const neighbors = this.getNeighbors(pos);
      for (const neighbor of neighbors) {
        const key = this.positionKey(neighbor);
        const cell = board[neighbor.y][neighbor.x];

        if (cell === 0) {
          liberties.add(key);
        } else if (cell === color && !visited.has(key)) {
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }

    return {
      stones,
      color: color === 1 ? 'black' : 'white',
      liberties: Array.from(liberties).map(key => this.keyToPosition(key)),
      libertyCount: liberties.size
    };
  }

  /**
   * 找出所有無氣的棋群（需要被提取）
   */
  findDeadGroups(board: BoardCell[][], color: StoneColor): Group[] {
    const cellValue = color === 'black' ? 1 : -1;
    const visited = new Set<string>();
    const deadGroups: Group[] = [];

    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        const key = this.positionKey({ x, y });
        if (board[y][x] === cellValue && !visited.has(key)) {
          const group = this.findGroup(board, { x, y });
          group.stones.forEach((stone: Position) => visited.add(this.positionKey(stone)));
          
          if (group.libertyCount === 0) {
            deadGroups.push(group);
          }
        }
      }
    }

    return deadGroups;
  }

  /**
   * 檢查落子後是否會導致己方無氣（自殺手）
   */
  isSuicide(board: BoardCell[][], position: Position, color: StoneColor): boolean {
    const tempBoard = this.copyBoard(board);
    const cellValue = color === 'black' ? 1 : -1;
    tempBoard[position.y][position.x] = cellValue;

    const group = this.findGroup(tempBoard, position);
    return group.libertyCount === 0;
  }

  /**
   * 取得相鄰四個位置
   */
  private getNeighbors(pos: Position): Position[] {
    const neighbors: Position[] = [];
    const deltas = [
      [-1, 0],  // 左
      [1, 0],   // 右
      [0, -1],  // 上
      [0, 1]    // 下
    ];

    for (const [dx, dy] of deltas) {
      const x = pos.x + dx;
      const y = pos.y + dy;
      if (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize) {
        neighbors.push({ x, y });
      }
    }

    return neighbors;
  }

  /**
   * 複製棋盤
   */
  private copyBoard(board: BoardCell[][]): BoardCell[][] {
    return board.map(row => [...row]);
  }

  /**
   * 位置轉換為字串 key
   */
  private positionKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }

  /**
   * 字串 key 轉換為位置
   */
  private keyToPosition(key: string): Position {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }
}
