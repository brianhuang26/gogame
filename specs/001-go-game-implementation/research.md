# Research: 圍棋線上對戰系統技術選型

**Date**: 2025-12-09  
**Phase**: Phase 0 - Outline & Research

## 研究目標

解決 Technical Context 中所有 NEEDS CLARIFICATION 項目，確定具體技術選型與實作策略。

## 1. WebSocket 函式庫選擇

### Decision
**Socket.IO** (後端) + **Socket.IO Client** (前端)

### Rationale
- **自動重連機制**：內建斷線重連，符合 FR-011、FR-012 要求（斷線後保留狀態並恢復）
- **房間管理**：原生支援房間概念，適合圍棋對局場景（每場對局一個房間）
- **事件驅動**：簡化 WebSocket 事件處理，符合 JavaScript ES6+ async/await 模式
- **跨瀏覽器相容性**：自動降級至 long-polling，確保廣泛支援
- **廣泛採用**：成熟生態系統，豐富的文件與社群支援

### Alternatives Considered
- **ws**：較輕量但需手動實作重連、房間管理，增加開發複雜度
- **WebSocket API (原生)**：需大量手動處理，不符合快速開發需求
- **SockJS**：較舊技術，社群活躍度不如 Socket.IO

### Implementation Notes
```javascript
// 後端：Socket.IO 伺服器設定
const io = require('socket.io')(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000
});

// 前端：Socket.IO 客戶端連線
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

## 2. 文件型資料庫選擇

### Decision
**MongoDB** 6.0+

### Rationale
- **靈活 Schema**：棋局狀態（棋盤配置、歷史盤面、計時器）可隨需求演進，無需預先定義嚴格 schema
- **原子性操作**：支援 ACID transactions，確保對局狀態更新的一致性（FR-023）
- **高效查詢**：索引支援快速查詢玩家對局歷史、評級記錄（SC-030：5 秒內查詢）
- **成熟生態**：Node.js 官方驅動程式（mongodb）穩定且效能優異
- **JSON 相容**：直接儲存 JavaScript 物件，無需 ORM 轉換

### Alternatives Considered
- **PostgreSQL + JSONB**：雖支援 JSON 儲存但仍為關係型資料庫，schema 變更較不靈活
- **CouchDB**：文件型但生態系統較小，Node.js 驅動較不成熟
- **Firebase Firestore**：雲端服務有供應商鎖定風險，不符合自主部署需求

### Data Model Strategy
```javascript
// Game Document 範例
{
  _id: ObjectId("..."),
  gameId: "uuid",
  boardSize: 19,
  players: {
    black: { playerId: "uuid", rating: 1800 },
    white: { playerId: "uuid", rating: 1750 }
  },
  state: {
    currentBoard: [[0,1,-1,...], ...], // 0:空, 1:黑, -1:白
    currentTurn: "black",
    capturedStones: { black: 5, white: 3 },
    boardHistory: ["hash1", "hash2", ...] // 超級打劫雜湊
  },
  moves: [
    { moveNumber: 1, color: "black", x: 3, y: 3, timestamp: "...", captured: [] },
    ...
  ],
  timer: {
    mode: "byo-yomi",
    black: { mainTime: 600, byoYomiTime: 30, byoYomiPeriods: 5 },
    white: { mainTime: 600, byoYomiTime: 30, byoYomiPeriods: 5 }
  },
  status: "in_progress", // in_progress, completed, flagged
  result: null,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Performance Considerations
- **索引策略**：
  - `{ gameId: 1 }` - 快速查詢對局
  - `{ "players.black.playerId": 1, "players.white.playerId": 1 }` - 玩家對局歷史
  - `{ status: 1, createdAt: -1 }` - 進行中對局列表
  - `{ "state.boardHistory": 1 }` - 超級打劫盤面查詢（使用雜湊）

## 3. JavaScript 測試框架選擇

### Decision
**Jest** 28+

### Rationale
- **零設定**：內建斷言、模擬、覆蓋率報告，符合快速啟動需求
- **快照測試**：適合測試 SGF 匯出、API 回應格式
- **並行測試**：加速測試執行，符合 TDD 快速回饋需求
- **ES6+ 支援**：原生支援 async/await、ES modules（需設定）
- **廣泛採用**：React、Node.js 專案標準測試框架

### Alternatives Considered
- **Mocha + Chai**：需額外設定，較為繁瑣
- **Vitest**：較新但生態系統不如 Jest 成熟
- **AVA**：並行執行優異但學習曲線較陡

### Test Structure
```javascript
// 範例：超級打劫規則測試
describe('超級打劫規則', () => {
  test('應禁止立即反提', async () => {
    const game = await createGame({ boardSize: 9 });
    await game.placeStone({ color: 'black', x: 3, y: 3 });
    await game.placeStone({ color: 'white', x: 3, y: 4 });
    // ... 設定打劫局面
    const captureMove = await game.placeStone({ color: 'black', x: 3, y: 4 });
    expect(captureMove.captured).toHaveLength(1);
    
    // 白棋立即反提應被拒絕
    await expect(
      game.placeStone({ color: 'white', x: 3, y: 3 })
    ).rejects.toThrow('禁止重複盤面');
  });
});
```

## 4. 超級打劫實作策略

### Decision
**Zobrist Hashing** + **Set-based History Tracking**

### Rationale
- **O(1) 盤面比對**：使用雜湊值而非完整盤面比對，符合 SC-006（<100ms 運算時間）
- **增量更新**：每次落子只需更新變動位置的雜湊，無需重新計算整個棋盤
- **記憶體效率**：僅儲存 64-bit 雜湊值而非完整棋盤狀態（19x19 棋盤節省 ~1.4KB/盤面）
- **碰撞機率極低**：64-bit Zobrist hash 碰撞機率 < 1/2^64，實務上可忽略

### Algorithm
```javascript
// Zobrist Hashing 實作
class ZobristHash {
  constructor(boardSize) {
    // 預先產生隨機數表：每個位置、每種顏色各一組隨機數
    this.table = this.generateRandomTable(boardSize);
    this.currentHash = 0n; // 使用 BigInt 確保 64-bit 精度
  }
  
  generateRandomTable(size) {
    const table = {};
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        table[`${x},${y},black`] = this.random64();
        table[`${x},${y},white`] = this.random64();
      }
    }
    return table;
  }
  
  random64() {
    // 產生 64-bit 隨機數
    return BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  }
  
  updateHash(x, y, color, isRemove = false) {
    const key = `${x},${y},${color}`;
    if (isRemove) {
      this.currentHash ^= this.table[key]; // XOR 移除
    } else {
      this.currentHash ^= this.table[key]; // XOR 新增
    }
  }
  
  getHash() {
    return this.currentHash.toString();
  }
}

// 超級打劫檢查
class SuperKoChecker {
  constructor() {
    this.boardHistory = new Set(); // 使用 Set 實現 O(1) 查詢
  }
  
  addPosition(hash) {
    this.boardHistory.add(hash);
  }
  
  isRepeated(hash) {
    return this.boardHistory.has(hash);
  }
}
```

### Performance Analysis
- **時間複雜度**：O(1) 盤面比對，O(k) 落子更新（k 為提取棋子數，通常 <10）
- **空間複雜度**：O(n) 儲存歷史雜湊（n 為手數，300 手僅需 ~2.4KB）
- **預期效能**：單次超級打劫檢查 <1ms，遠低於 100ms 限制

## 5. TypeScript 採用決策

### Decision
**採用 TypeScript 5.0+**

### Rationale
- **型別安全**：防止常見錯誤（如座標越界、顏色值錯誤），符合憲章品質標準
- **開發體驗**：IDE 自動補全、重構支援，提升開發效率
- **文件即程式碼**：介面定義即為 API 文件，減少維護負擔
- **漸進式採用**：可從關鍵模組（遊戲邏輯）開始，逐步擴展
- **生態系統**：Socket.IO、MongoDB driver 均有官方型別定義

### Migration Strategy
```typescript
// 範例：型別定義
interface Position {
  x: number;
  y: number;
}

type StoneColor = 'black' | 'white';
type BoardCell = 0 | 1 | -1; // 0: 空, 1: 黑, -1: 白

interface Move {
  moveNumber: number;
  color: StoneColor;
  position: Position;
  timestamp: Date;
  captured: Position[];
}

interface GameState {
  currentBoard: BoardCell[][];
  currentTurn: StoneColor;
  capturedStones: Record<StoneColor, number>;
  boardHistory: string[];
}
```

### Alternatives Considered
- **純 JavaScript + JSDoc**：型別檢查較弱，大型專案維護困難
- **Flow**：Meta 已減少投資，社群支援不如 TypeScript

## 6. 前端框架選擇

### Decision
**React 18+** + **Canvas API** (棋盤渲染)

### Rationale
- **元件化**：棋盤、棋子、計時器、對局資訊均可獨立元件，符合憲章單一職責原則
- **效能**：Virtual DOM 最佳化 UI 更新，符合 SC-012（<200ms 本地回饋）
- **Canvas 渲染**：棋盤使用 Canvas 繪製，支援高效重繪（19x19 = 361 交叉點）
- **生態系統**：豐富的 UI 函式庫（React Router、狀態管理）
- **TypeScript 支援**：官方型別定義完善

### UI Architecture
```typescript
// 元件結構
<GamePage>
  <Board onStonePlace={handleMove}>
    <Canvas ref={canvasRef} />
  </Board>
  <GameInfo game={gameState}>
    <Timer timer={blackTimer} />
    <Timer timer={whiteTimer} />
    <CapturedStones count={capturedStones} />
  </GameInfo>
  <MoveHistory moves={moves} />
</GamePage>
```

### Alternatives Considered
- **Vue.js**：優秀框架但團隊熟悉度不如 React
- **Svelte**：編譯時最佳化但生態系統較小
- **Vanilla JS + Canvas**：開發效率低，不符合快速迭代需求

## 7. 後端框架選擇

### Decision
**Express.js 4+** + **Socket.IO**

### Rationale
- **輕量靈活**：最小化框架，便於整合 Socket.IO 和 MongoDB
- **中介軟體生態**：豐富的驗證、日誌、錯誤處理中介軟體
- **RESTful API**：標準路由設計，符合前後端分離架構
- **成熟穩定**：Node.js 社群標準，文件齊全

### API Structure
```typescript
// REST API 端點設計
GET    /api/games/:gameId          // 取得對局資訊
POST   /api/games                  // 建立新對局
POST   /api/games/:gameId/moves    // 落子（備用，主要用 WebSocket）
GET    /api/games/:gameId/sgf      // 匯出 SGF
GET    /api/players/:playerId      // 取得玩家資訊
POST   /api/matching/queue         // 加入配對隊列
GET    /api/admin/games            // 管理員：對局列表
POST   /api/admin/players/:id/ban  // 管理員：封禁玩家

// WebSocket 事件設計
client → server: 'game:join', 'game:move', 'game:resign'
server → client: 'game:updated', 'game:move', 'game:ended', 'timer:tick'
```

### Alternatives Considered
- **Fastify**：效能優但生態系統不如 Express
- **NestJS**：企業級框架但對小型專案過於複雜
- **Koa**：現代化但社群規模較小

## 8. 計時系統實作策略

### Decision
**伺服器端計時** + **客戶端同步顯示**

### Rationale
- **防作弊**：所有計時邏輯由伺服器控制，客戶端無法竄改（FR-016）
- **一致性**：確保雙方玩家看到相同的時間（SC-019：<1 秒差異）
- **精確性**：使用 `process.hrtime.bigint()` 高精度計時

### Implementation
```typescript
class GameTimer {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
  startTimer(gameId: string, color: StoneColor) {
    const interval = setInterval(async () => {
      const game = await this.gameService.getGame(gameId);
      const timer = game.timer[color];
      
      if (timer.mainTime > 0) {
        timer.mainTime -= 1;
      } else if (timer.byoYomiPeriods > 0) {
        timer.byoYomiTime -= 1;
        if (timer.byoYomiTime <= 0) {
          timer.byoYomiPeriods -= 1;
          timer.byoYomiTime = 30; // 重置讀秒
        }
      } else {
        // 超時判負
        await this.gameService.endGame(gameId, 'timeout', color);
        this.stopTimer(gameId);
        return;
      }
      
      // 同步到客戶端
      this.io.to(gameId).emit('timer:tick', {
        color,
        mainTime: timer.mainTime,
        byoYomiTime: timer.byoYomiTime,
        byoYomiPeriods: timer.byoYomiPeriods
      });
      
      await this.gameService.updateTimer(gameId, color, timer);
    }, 1000);
    
    this.intervals.set(`${gameId}-${color}`, interval);
  }
  
  stopTimer(gameId: string) {
    ['black', 'white'].forEach(color => {
      const interval = this.intervals.get(`${gameId}-${color}`);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(`${gameId}-${color}`);
      }
    });
  }
}
```

## 9. 防作弊偵測策略

### Decision
**多層次偵測** + **人工審查機制**

### Rationale
- **避免誤判**：AI 輔助偵測僅標記，不自動封禁（FR-022）
- **分層防護**：結合多種指標（落子頻率、模式相似度、多裝置登入）
- **可追溯**：完整記錄供管理員審查

### Detection Layers
```typescript
// 1. 異常落子頻率偵測
class MoveFrequencyDetector {
  detectFastMoves(moves: Move[]): boolean {
    const recentMoves = moves.slice(-5);
    const avgInterval = this.calculateAvgInterval(recentMoves);
    return avgInterval < 500; // 低於 0.5 秒視為異常
  }
}

// 2. 多裝置登入偵測
class MultiDeviceDetector {
  async detectMultipleDevices(playerId: string): Promise<boolean> {
    const sessions = await this.sessionService.getActiveSessions(playerId);
    return sessions.length > 1;
  }
}

// 3. AI 模式比對（簡化版，實際需整合 KataGo 等）
class AIPatternDetector {
  async analyzeGame(gameId: string): Promise<number> {
    // 計算玩家落子與 AI 建議的相似度
    const game = await this.gameService.getGame(gameId);
    // 此處需整合圍棋 AI 引擎（如 KataGo）進行分析
    // 回傳相似度分數 (0-1)
    return 0.95; // 範例：95% 相似度
  }
}

// 整合偵測
class AntiCheatService {
  async checkGame(gameId: string): Promise<void> {
    const flags = [];
    
    if (await this.moveFrequencyDetector.detectFastMoves(game.moves)) {
      flags.push('FAST_MOVES');
    }
    
    if (await this.multiDeviceDetector.detectMultipleDevices(player.id)) {
      flags.push('MULTI_DEVICE');
    }
    
    const aiSimilarity = await this.aiPatternDetector.analyzeGame(gameId);
    if (aiSimilarity > 0.9) {
      flags.push('AI_PATTERN');
    }
    
    if (flags.length > 0) {
      await this.gameService.flagGame(gameId, flags);
      await this.adminService.createReviewTask(gameId, flags);
    }
  }
}
```

## 10. SGF 匯出實作策略

### Decision
**自建 SGF 生成器** + **標準驗證**

### Rationale
- **完整控制**：確保符合 SGF FF[4] 標準
- **輕量**：無需引入大型函式庫
- **可測試**：使用快照測試驗證 SGF 格式

### Implementation
```typescript
class SGFExporter {
  export(game: Game): string {
    const header = this.buildHeader(game);
    const moves = this.buildMoves(game.moves);
    return `(;${header}${moves})`;
  }
  
  private buildHeader(game: Game): string {
    return [
      'FF[4]',
      'GM[1]', // 1 = Go
      `SZ[${game.boardSize}]`,
      'CA[UTF-8]',
      `PB[${game.players.black.name}]`,
      `PW[${game.players.white.name}]`,
      `BR[${game.players.black.rating}]`,
      `WR[${game.players.white.rating}]`,
      `DT[${this.formatDate(game.createdAt)}]`,
      `RE[${game.result}]`,
      'RU[Chinese]',
      `KM[7.5]` // 貼目
    ].join('');
  }
  
  private buildMoves(moves: Move[]): string {
    return moves.map(move => {
      const color = move.color === 'black' ? 'B' : 'W';
      const coord = this.toSGFCoord(move.position);
      return `;${color}[${coord}]`;
    }).join('');
  }
  
  private toSGFCoord(pos: Position): string {
    // SGF 使用 a-s 表示座標 (0-18)
    const x = String.fromCharCode(97 + pos.x);
    const y = String.fromCharCode(97 + pos.y);
    return `${x}${y}`;
  }
}
```

## 技術堆疊總結

| 類別 | 技術選擇 | 版本 |
|------|---------|------|
| 語言 | TypeScript | 5.0+ |
| 執行環境 | Node.js | 18+ |
| 後端框架 | Express.js | 4+ |
| 即時通訊 | Socket.IO | 4+ |
| 資料庫 | MongoDB | 6.0+ |
| 前端框架 | React | 18+ |
| 測試框架 | Jest | 28+ |
| 程式碼檢查 | ESLint + Prettier | Latest |
| 型別檢查 | TypeScript Compiler | 5.0+ |

## 下一步：Phase 1 設計

所有 NEEDS CLARIFICATION 項目已解決，可進入 Phase 1 進行：
1. 資料模型設計（data-model.md）
2. API 契約定義（contracts/）
3. 快速入門文件（quickstart.md）
