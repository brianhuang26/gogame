# Data Model: 圍棋線上對戰系統

**Date**: 2025-12-09  
**Phase**: Phase 1 - Design & Contracts

## 核心實體設計

### 1. Game（對局）

代表一場完整的圍棋對局，包含所有遊戲狀態與配置。

```typescript
interface Game {
  // 識別資訊
  _id: ObjectId;
  gameId: string;                    // UUID v4
  
  // 對局配置
  boardSize: 9 | 13 | 19;
  rules: 'chinese';                  // 僅支援中國規則
  komi: number;                      // 貼目（預設 7.5）
  
  // 玩家資訊
  players: {
    black: PlayerInGame;
    white: PlayerInGame;
  };
  
  // 對局狀態
  state: GameState;
  
  // 著手記錄
  moves: Move[];
  
  // 計時器
  timer?: TimerConfig;
  
  // 對局結果
  status: GameStatus;
  result?: GameResult;
  
  // 防作弊
  flags: CheatFlag[];
  
  // 時間戳記
  createdAt: Date;
  updatedAt: Date;
}

interface PlayerInGame {
  playerId: string;
  name: string;
  rating: number;
  color: 'black' | 'white';
}

type GameStatus = 
  | 'waiting'       // 等待玩家加入
  | 'in_progress'   // 進行中
  | 'completed'     // 已結束
  | 'flagged'       // 待審查（疑似作弊）
  | 'abandoned';    // 已放棄

interface GameResult {
  winner: 'black' | 'white' | 'draw';
  method: 'score' | 'resignation' | 'timeout' | 'admin';
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
```

**MongoDB 索引策略**：
```javascript
// 快速查詢對局
db.games.createIndex({ gameId: 1 }, { unique: true });

// 玩家對局歷史
db.games.createIndex({ 'players.black.playerId': 1, createdAt: -1 });
db.games.createIndex({ 'players.white.playerId': 1, createdAt: -1 });

// 進行中對局列表
db.games.createIndex({ status: 1, createdAt: -1 });

// 待審查對局
db.games.createIndex({ flags: 1 }, { sparse: true });
```

### 2. GameState（棋盤狀態）

代表某一時刻的完整棋盤狀態。

```typescript
interface GameState {
  // 當前棋盤配置
  currentBoard: BoardCell[][];      // 二維陣列 [y][x]
  
  // 當前回合
  currentTurn: StoneColor;
  moveNumber: number;
  
  // 提子統計
  capturedStones: {
    black: number;  // 黑棋提取的白子數
    white: number;  // 白棋提取的黑子數
  };
  
  // 超級打劫歷史
  boardHistory: string[];           // Zobrist hash 值陣列
  currentHash: string;              // 當前棋盤雜湊值
  
  // 禁入點（打劫位置）
  koPoint?: Position | null;
  
  // 最後落子
  lastMove?: Position | null;
}

type BoardCell = 0 | 1 | -1;        // 0: 空, 1: 黑, -1: 白
type StoneColor = 'black' | 'white';

interface Position {
  x: number;  // 0-based index
  y: number;  // 0-based index
}
```

**驗證規則**：
- `currentBoard` 維度必須為 `[boardSize][boardSize]`
- `boardHistory` 長度不應超過 `moveNumber + 1`（初始盤面 + 每手）
- `currentHash` 必須對應當前棋盤配置
- `koPoint` 僅在上一手發生提子時可能存在

### 3. Move（著手記錄）

代表單一落子動作及其影響。

```typescript
interface Move {
  // 著手資訊
  moveNumber: number;               // 從 1 開始
  color: StoneColor;
  position: Position;
  
  // 時間資訊
  timestamp: Date;
  thinkTime: number;                // 思考時間（秒）
  
  // 提子資訊
  captured: Position[];             // 被提取的棋子位置
  capturedCount: number;
  
  // 盤面狀態
  boardHashAfter: string;           // 落子後的棋盤雜湊
  
  // 特殊標記
  isPass?: boolean;                 // 虛手
  comment?: string;                 // 註解（供 SGF 匯出）
}
```

**關係**：
- `Move.moveNumber` 對應 `GameState.moveNumber`
- `Move.boardHashAfter` 對應落子後的 `GameState.currentHash`
- `Move.captured` 影響 `GameState.capturedStones`

### 4. Player（玩家）

代表遊戲使用者的完整資訊。

```typescript
interface Player {
  // 識別資訊
  _id: ObjectId;
  playerId: string;                 // UUID v4
  username: string;                 // 唯一使用者名稱
  email: string;
  
  // 密碼（雜湊）
  passwordHash: string;
  
  // 評級系統
  rating: number;                   // Elo rating (初始 1500)
  ratingHistory: RatingChange[];
  
  // 對局統計
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;                // 計算值
  };
  
  // 帳號狀態
  status: PlayerStatus;
  
  // 違規記錄
  violations: Violation[];
  
  // 時間戳記
  createdAt: Date;
  lastLoginAt: Date;
}

type PlayerStatus = 
  | 'active'
  | 'banned'
  | 'suspended';

interface RatingChange {
  gameId: string;
  ratingBefore: number;
  ratingAfter: number;
  opponentRating: number;
  result: 'win' | 'loss' | 'draw';
  timestamp: Date;
}

interface Violation {
  violationType: 'fast_moves' | 'ai_pattern' | 'multi_device' | 'other';
  gameId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  reviewStatus: 'pending' | 'confirmed' | 'dismissed';
  timestamp: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}
```

**MongoDB 索引策略**：
```javascript
db.players.createIndex({ playerId: 1 }, { unique: true });
db.players.createIndex({ username: 1 }, { unique: true });
db.players.createIndex({ email: 1 }, { unique: true });
db.players.createIndex({ rating: -1 }); // 排行榜
db.players.createIndex({ status: 1 });
```

### 5. TimerConfig（計時器配置）

支援三種計時模式：Fischer、Byo-yomi、Canadian。

```typescript
interface TimerConfig {
  mode: TimerMode;
  
  black: TimerState;
  white: TimerState;
  
  // 模式特定配置
  config: FischerConfig | ByoYomiConfig | CanadianConfig;
}

type TimerMode = 'fischer' | 'byo-yomi' | 'canadian';

interface TimerState {
  mainTime: number;                 // 主時間（秒）
  
  // Byo-yomi 專用
  byoYomiTime?: number;             // 讀秒時間（秒）
  byoYomiPeriods?: number;          // 剩餘讀秒次數
  
  // Canadian 專用
  periodTime?: number;              // 週期時間（秒）
  periodMoves?: number;             // 週期內剩餘手數
  
  // Fischer 專用
  increment?: number;               // 每手增加時間（秒）
  
  // 狀態
  isActive: boolean;
  lastUpdated: Date;
}

interface FischerConfig {
  initialTime: number;              // 初始時間（秒）
  increment: number;                // 每手增加時間（秒）
}

interface ByoYomiConfig {
  mainTime: number;                 // 主時間（秒）
  byoYomiTime: number;              // 讀秒時間（秒）
  byoYomiPeriods: number;           // 讀秒次數
}

interface CanadianConfig {
  mainTime: number;                 // 主時間（秒）
  periodTime: number;               // 週期時間（秒）
  periodMoves: number;              // 每週期手數
}
```

**範例**：
```typescript
// Byo-yomi: 10 分鐘主時間 + 5 次 30 秒讀秒
const byoYomiTimer: TimerConfig = {
  mode: 'byo-yomi',
  black: {
    mainTime: 600,
    byoYomiTime: 30,
    byoYomiPeriods: 5,
    isActive: false,
    lastUpdated: new Date()
  },
  white: { /* 同上 */ },
  config: {
    mainTime: 600,
    byoYomiTime: 30,
    byoYomiPeriods: 5
  }
};
```

### 6. Group（棋群）

代表棋盤上連通的同色棋子集合，用於計算氣數與提子判定。

```typescript
interface Group {
  stones: Position[];               // 棋群中的所有棋子
  color: StoneColor;
  liberties: Position[];            // 氣的位置
  libertyCount: number;             // 氣數（計算值）
}
```

**計算邏輯**：
```typescript
class GroupAnalyzer {
  // 使用 BFS 找出連通的棋群
  findGroup(board: BoardCell[][], start: Position): Group {
    const color = board[start.y][start.x];
    const visited = new Set<string>();
    const stones: Position[] = [];
    const liberties = new Set<string>();
    
    const queue: Position[] = [start];
    visited.add(`${start.x},${start.y}`);
    
    while (queue.length > 0) {
      const pos = queue.shift()!;
      stones.push(pos);
      
      // 檢查四個相鄰位置
      const neighbors = this.getNeighbors(pos, board.length);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        const cell = board[neighbor.y][neighbor.x];
        
        if (cell === 0) {
          // 空點是氣
          liberties.add(key);
        } else if (cell === color && !visited.has(key)) {
          // 同色棋子，加入棋群
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }
    
    return {
      stones,
      color: color === 1 ? 'black' : 'white',
      liberties: Array.from(liberties).map(key => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      }),
      libertyCount: liberties.size
    };
  }
  
  getNeighbors(pos: Position, boardSize: number): Position[] {
    const neighbors: Position[] = [];
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dx, dy] of deltas) {
      const x = pos.x + dx;
      const y = pos.y + dy;
      if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
        neighbors.push({ x, y });
      }
    }
    
    return neighbors;
  }
}
```

### 7. MatchRequest（配對請求）

代表玩家的配對需求。

```typescript
interface MatchRequest {
  _id: ObjectId;
  requestId: string;                // UUID v4
  
  // 玩家資訊
  playerId: string;
  playerRating: number;
  
  // 配對條件
  preferences: {
    boardSize: 9 | 13 | 19;
    ratingRange: {
      min: number;
      max: number;
    };
    timerMode?: TimerMode;
  };
  
  // 請求狀態
  status: 'waiting' | 'matched' | 'cancelled' | 'timeout';
  matchedWith?: string;             // 配對到的玩家 ID
  gameId?: string;                  // 配對成功後的對局 ID
  
  // 時間戳記
  createdAt: Date;
  expiredAt: Date;                  // 請求過期時間
}
```

**MongoDB 索引策略**：
```javascript
db.matchRequests.createIndex({ status: 1, createdAt: 1 });
db.matchRequests.createIndex({ playerId: 1 });
db.matchRequests.createIndex({ expiredAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

### 8. CheatFlag（作弊標記）

記錄可疑行為供管理員審查。

```typescript
interface CheatFlag {
  flagId: string;                   // UUID v4
  gameId: string;
  playerId: string;
  
  // 標記類型
  type: CheatFlagType;
  
  // 詳細資訊
  details: {
    [key: string]: any;
  };
  
  // 審查狀態
  reviewStatus: 'pending' | 'confirmed' | 'dismissed';
  reviewedBy?: string;
  reviewNotes?: string;
  
  // 時間戳記
  flaggedAt: Date;
  reviewedAt?: Date;
}

type CheatFlagType = 
  | 'FAST_MOVES'                    // 異常快速落子
  | 'AI_PATTERN'                    // 疑似 AI 輔助
  | 'MULTI_DEVICE'                  // 多裝置登入
  | 'RATING_MANIPULATION'           // 評級操縱
  | 'OTHER';                        // 其他異常

interface CheatFlagDetails {
  // FAST_MOVES
  averageMoveTime?: number;
  suspiciousMoves?: number[];
  
  // AI_PATTERN
  aiSimilarity?: number;            // 0-1
  aiEngine?: string;                // 如 'KataGo'
  
  // MULTI_DEVICE
  deviceCount?: number;
  ipAddresses?: string[];
  
  // RATING_MANIPULATION
  pattern?: string;
  relatedGames?: string[];
}
```

### 9. AdminLog（管理日誌）

記錄系統事件與管理員操作。

```typescript
interface AdminLog {
  _id: ObjectId;
  logId: string;                    // UUID v4
  
  // 事件類型
  type: AdminLogType;
  
  // 嚴重程度
  severity: 'info' | 'warning' | 'error';
  
  // 事件描述
  message: string;
  
  // 相關實體
  relatedEntities: {
    gameId?: string;
    playerId?: string;
    adminId?: string;
  };
  
  // 詳細資訊
  details: {
    [key: string]: any;
  };
  
  // 時間戳記
  timestamp: Date;
}

type AdminLogType = 
  | 'GAME_ERROR'                    // 遊戲邏輯錯誤
  | 'TIMER_ERROR'                   // 計時錯誤
  | 'NETWORK_ERROR'                 // 網路異常
  | 'PLAYER_BANNED'                 // 玩家封禁
  | 'PLAYER_UNBANNED'               // 解除封禁
  | 'CHEAT_DETECTED'                // 作弊偵測
  | 'CHEAT_REVIEWED'                // 作弊審查
  | 'SYSTEM_START'                  // 系統啟動
  | 'SYSTEM_SHUTDOWN';              // 系統關閉
```

## 狀態轉換圖

### Game Status 狀態轉換

```text
waiting → in_progress → completed
   ↓           ↓            ↑
   ↓      → flagged → (審查後)
   ↓           ↓
   → abandoned ←
```

### MatchRequest Status 狀態轉換

```text
waiting → matched (建立 Game)
   ↓
   → cancelled (玩家取消)
   ↓
   → timeout (超時)
```

## 資料一致性規則

### 1. Game 與 Move 的一致性
- `Game.moves.length` 應等於 `Game.state.moveNumber`
- `Game.moves[i].boardHashAfter` 應等於執行該手後的棋盤雜湊值
- `Game.state.boardHistory` 應包含所有歷史雜湊值

### 2. GameState 的完整性
- `currentBoard` 配置必須能透過重播 `moves` 重建
- `capturedStones` 計數必須等於所有 `Move.captured` 的總和
- `currentHash` 必須對應當前 `currentBoard` 的 Zobrist hash

### 3. Player 統計的一致性
- `stats.totalGames = wins + losses + draws`
- `stats.winRate = wins / totalGames`
- `ratingHistory` 最後一筆的 `ratingAfter` 應等於 `rating`

### 4. Timer 的同步性
- 伺服器端 `TimerState.lastUpdated` 與客戶端顯示時間差 <1 秒
- 超時判定由伺服器端觸發，客戶端僅顯示

## MongoDB Collection 設計總結

| Collection | 主鍵 | 用途 | 預估規模 |
|-----------|------|------|---------|
| games | gameId | 儲存對局 | 100K/月 |
| players | playerId | 儲存玩家 | 10K 玩家 |
| matchRequests | requestId | 配對隊列 | 瞬時 1K |
| cheatFlags | flagId | 作弊記錄 | 1K/月 |
| adminLogs | logId | 系統日誌 | 10K/日 |

## 效能最佳化策略

### 1. 快取策略
- **進行中對局**：使用 Redis 快取 `GameState`，減少 MongoDB 查詢
- **玩家評級**：快取玩家基本資訊與評級，TTL 5 分鐘
- **排行榜**：每小時重新計算並快取

### 2. 索引策略
- 所有查詢頻繁的欄位建立索引
- 使用複合索引優化多條件查詢
- TTL 索引自動清理過期配對請求

### 3. 資料分片（未來）
- 當對局數超過 1M 時，依 `createdAt` 分片
- 玩家資料依 `playerId` hash 分片

## 下一步

資料模型設計完成，接下來建立：
1. API 契約定義（OpenAPI spec）
2. WebSocket 事件契約
3. 快速入門文件
