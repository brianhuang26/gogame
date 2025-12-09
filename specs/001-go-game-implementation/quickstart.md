# 快速入門：圍棋線上對戰系統

**版本**: 1.0.0  
**更新日期**: 2025-12-09

## 目標讀者

本文件適用於：
- 後端開發者（實作遊戲邏輯與 API）
- 前端開發者（實作棋盤 UI 與 WebSocket 客戶端）
- 測試工程師（撰寫測試腳本）
- 專案新成員（快速了解系統架構）

## 系統架構概覽

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Board Canvas │  │ Timer        │  │ Move History │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│          │                  │                  │         │
│          └──────────────────┴──────────────────┘         │
│                            │                             │
│                   ┌────────▼────────┐                    │
│                   │ Socket.IO Client│                    │
│                   └────────┬────────┘                    │
└────────────────────────────┼─────────────────────────────┘
                             │ WebSocket
                             │
┌────────────────────────────▼─────────────────────────────┐
│                  Backend (Node.js + Express)              │
│  ┌────────────────┐              ┌────────────────┐      │
│  │ REST API       │              │ Socket.IO      │      │
│  │ /api/v1/*      │              │ Server         │      │
│  └───────┬────────┘              └───────┬────────┘      │
│          │                               │               │
│          └───────────┬───────────────────┘               │
│                      │                                   │
│         ┌────────────▼────────────┐                      │
│         │   Game Services         │                      │
│         │ • 遊戲規則引擎          │                      │
│         │ • 超級打劫檢查          │                      │
│         │ • 計時器管理            │                      │
│         │ • 防作弊偵測            │                      │
│         └────────────┬────────────┘                      │
│                      │                                   │
│         ┌────────────▼────────────┐                      │
│         │   MongoDB Driver        │                      │
│         └────────────┬────────────┘                      │
└──────────────────────┼───────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │     MongoDB 6.0+        │
          │  • games collection     │
          │  • players collection   │
          │  • matchRequests        │
          │  • cheatFlags           │
          └─────────────────────────┘
```

## 前置準備

### 必要軟體

| 軟體 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 執行環境 |
| npm/yarn | Latest | 套件管理 |
| MongoDB | 6.0+ | 資料庫 |
| Git | Latest | 版本控制 |

### 推薦工具

- **IDE**: VS Code（推薦安裝 ESLint、Prettier 擴充功能）
- **API 測試**: Postman 或 Insomnia
- **MongoDB GUI**: MongoDB Compass
- **WebSocket 測試**: Socket.IO Client Tool

## 快速啟動（5 分鐘）

### 1. Clone 專案

```bash
git clone <repository-url>
cd gogame
git checkout 001-go-game-implementation
```

### 2. 安裝依賴

```bash
# 後端依賴
cd backend
npm install

# 前端依賴
cd ../frontend
npm install
```

### 3. 環境配置

建立 `backend/.env` 檔案：

```env
# 伺服器配置
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gogame

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Socket.IO
SOCKET_PATH=/socket.io
```

建立 `frontend/.env` 檔案：

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

### 4. 啟動 MongoDB

```bash
# 使用 Docker（推薦）
docker run -d -p 27017:27017 --name gogame-mongo mongo:6.0

# 或使用本地 MongoDB
mongod --dbpath /path/to/data
```

### 5. 啟動開發伺服器

```bash
# 終端機 1：後端
cd backend
npm run dev

# 終端機 2：前端
cd frontend
npm run dev
```

### 6. 驗證安裝

開啟瀏覽器訪問 `http://localhost:5173`，應看到圍棋對局介面。

## 專案結構詳解

### 後端目錄結構

```
backend/
├── src/
│   ├── models/              # 資料模型
│   │   ├── Game.ts
│   │   ├── Player.ts
│   │   ├── Move.ts
│   │   └── MatchRequest.ts
│   ├── services/            # 業務邏輯
│   │   ├── game/
│   │   │   ├── GameEngine.ts        # 遊戲規則引擎
│   │   │   ├── BoardAnalyzer.ts     # 棋盤分析（棋群、氣數）
│   │   │   ├── SuperKoChecker.ts    # 超級打劫檢查
│   │   │   └── ZobristHash.ts       # Zobrist 雜湊
│   │   ├── timer/
│   │   │   └── TimerManager.ts      # 計時器管理
│   │   ├── matching/
│   │   │   └── MatchingService.ts   # 配對系統
│   │   ├── antiCheat/
│   │   │   ├── MoveFrequencyDetector.ts
│   │   │   ├── AIPatternDetector.ts
│   │   │   └── MultiDeviceDetector.ts
│   │   └── admin/
│   │       └── AdminService.ts      # 後台管理
│   ├── api/                 # REST API 路由
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── games.ts
│   │   │   ├── players.ts
│   │   │   ├── matching.ts
│   │   │   └── admin.ts
│   │   └── middleware/
│   │       ├── auth.ts              # JWT 驗證
│   │       ├── rateLimit.ts         # 速率限制
│   │       └── errorHandler.ts      # 錯誤處理
│   ├── websocket/           # WebSocket 處理器
│   │   ├── SocketManager.ts
│   │   ├── handlers/
│   │   │   ├── gameHandlers.ts
│   │   │   ├── timerHandlers.ts
│   │   │   └── matchHandlers.ts
│   │   └── middleware/
│   │       └── socketAuth.ts
│   ├── db/                  # 資料庫
│   │   ├── connection.ts
│   │   └── repositories/
│   │       ├── GameRepository.ts
│   │       ├── PlayerRepository.ts
│   │       └── MatchRepository.ts
│   ├── utils/               # 工具函數
│   │   ├── sgf.ts           # SGF 匯出
│   │   ├── validation.ts    # 資料驗證
│   │   └── logger.ts        # 日誌
│   └── app.ts               # 應用程式入口
├── tests/
│   ├── unit/                # 單元測試
│   │   ├── services/
│   │   │   ├── GameEngine.test.ts
│   │   │   ├── SuperKoChecker.test.ts
│   │   │   └── BoardAnalyzer.test.ts
│   │   └── utils/
│   ├── integration/         # 整合測試
│   │   ├── api/
│   │   └── websocket/
│   └── contract/            # 契約測試
│       └── gameAPI.test.ts
├── package.json
├── tsconfig.json
└── .env.example
```

### 前端目錄結構

```
frontend/
├── src/
│   ├── components/          # React 元件
│   │   ├── Board/
│   │   │   ├── Board.tsx            # 棋盤主元件
│   │   │   ├── Canvas.tsx           # Canvas 渲染
│   │   │   └── StonePreview.tsx     # 落子預覽
│   │   ├── Timer/
│   │   │   └── Timer.tsx
│   │   ├── GameInfo/
│   │   │   ├── GameInfo.tsx
│   │   │   └── CapturedStones.tsx
│   │   ├── MoveHistory/
│   │   │   └── MoveHistory.tsx
│   │   └── Admin/
│   │       ├── GameList.tsx
│   │       └── PlayerManager.tsx
│   ├── pages/               # 頁面
│   │   ├── GamePage.tsx
│   │   ├── MatchingPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── AdminPage.tsx
│   ├── services/            # 前端服務
│   │   ├── api.ts           # REST API 客戶端
│   │   ├── socket.ts        # Socket.IO 客戶端
│   │   └── auth.ts          # 認證服務
│   ├── hooks/               # React Hooks
│   │   ├── useGame.ts
│   │   ├── useSocket.ts
│   │   └── useTimer.ts
│   ├── utils/
│   │   ├── boardRenderer.ts # Canvas 繪製邏輯
│   │   └── coordinateMapper.ts
│   ├── types/               # TypeScript 型別定義
│   │   └── game.types.ts
│   └── App.tsx
├── tests/
│   ├── unit/
│   └── e2e/                 # Playwright E2E 測試
├── package.json
└── vite.config.ts
```

## 核心概念

### 1. 遊戲規則引擎

**位置**: `backend/src/services/game/GameEngine.ts`

**職責**：
- 驗證落子合法性
- 執行提子邏輯
- 檢查超級打劫
- 判定禁入點

**範例**：
```typescript
class GameEngine {
  async placeStone(gameId: string, position: Position, color: StoneColor): Promise<MoveResult> {
    // 1. 驗證基本合法性
    this.validatePosition(position);
    this.validateEmptyPosition(board, position);
    
    // 2. 模擬落子
    const newBoard = this.simulatePlacement(board, position, color);
    
    // 3. 提子判定
    const captured = this.captureStones(newBoard, position, color);
    
    // 4. 禁入點檢查
    if (captured.length === 0 && this.isSuicide(newBoard, position, color)) {
      throw new Error('禁止落子：會導致己方棋子無氣');
    }
    
    // 5. 超級打劫檢查
    const newHash = this.zobristHash.calculate(newBoard);
    if (this.superKoChecker.isRepeated(newHash)) {
      throw new Error('禁止重複盤面');
    }
    
    // 6. 更新遊戲狀態
    return this.updateGameState(gameId, newBoard, position, captured, newHash);
  }
}
```

### 2. 超級打劫檢查

**位置**: `backend/src/services/game/SuperKoChecker.ts`

**演算法**: Zobrist Hashing

**時間複雜度**: O(1) 查詢，O(k) 更新（k 為提子數）

**範例**：
```typescript
class SuperKoChecker {
  private boardHistory: Set<string> = new Set();
  
  addPosition(hash: string): void {
    this.boardHistory.add(hash);
  }
  
  isRepeated(hash: string): boolean {
    return this.boardHistory.has(hash);
  }
}
```

### 3. WebSocket 即時同步

**位置**: `backend/src/websocket/SocketManager.ts`

**流程**：
1. 客戶端連線並加入對局房間
2. 玩家落子 → 伺服器驗證 → 廣播給房間內所有人
3. 計時器每秒推送更新
4. 斷線重連自動恢復狀態

**範例**：
```typescript
// 伺服器端
io.on('connection', (socket) => {
  socket.on('game:join', async ({ gameId }) => {
    await socket.join(`game:${gameId}`);
    const gameState = await gameService.getState(gameId);
    socket.emit('game:joined', gameState);
  });
  
  socket.on('game:move', async ({ gameId, position, color }) => {
    try {
      const result = await gameEngine.placeStone(gameId, position, color);
      io.to(`game:${gameId}`).emit('game:move', result);
    } catch (error) {
      socket.emit('game:move:error', { code: error.code, message: error.message });
    }
  });
});

// 客戶端
socket.on('game:move', (data) => {
  updateBoardUI(data.gameState.currentBoard);
  updateMoveHistory(data.move);
});
```

## 開發工作流程

### 1. 功能開發（TDD）

```bash
# 1. 建立功能分支
git checkout -b feature/superko-rule

# 2. 撰寫測試（先寫測試）
cd backend/tests/unit/services
# 編輯 SuperKoChecker.test.ts

# 3. 執行測試（確認失敗）
npm test SuperKoChecker.test.ts

# 4. 實作功能
cd ../../../src/services/game
# 編輯 SuperKoChecker.ts

# 5. 再次執行測試（確認通過）
npm test SuperKoChecker.test.ts

# 6. 重構（保持測試綠燈）
# 優化程式碼...

# 7. 提交
git add .
git commit -m "feat: 實作超級打劫規則檢查"
```

### 2. API 測試

使用 Postman 或 curl：

```bash
# 註冊玩家
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","email":"p1@example.com","password":"pass123"}'

# 建立對局
curl -X POST http://localhost:3000/api/v1/games \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"boardSize":19,"opponentId":"<opponent-id>"}'

# 落子
curl -X POST http://localhost:3000/api/v1/games/<game-id>/moves \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"position":{"x":3,"y":3},"color":"black"}'
```

### 3. WebSocket 測試

使用 Socket.IO Client Tool 或編寫測試腳本：

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000/game', {
  auth: { token: '<jwt-token>' }
});

socket.on('connect', () => {
  console.log('已連線');
  
  // 加入對局
  socket.emit('game:join', { gameId: '<game-id>' });
});

socket.on('game:joined', (data) => {
  console.log('對局狀態:', data.gameState);
  
  // 落子
  socket.emit('game:move', {
    gameId: '<game-id>',
    position: { x: 3, y: 3 },
    color: 'black'
  });
});

socket.on('game:move', (data) => {
  console.log('落子成功:', data.move);
});
```

## 常見任務

### 執行測試

```bash
# 所有測試
npm test

# 單元測試
npm run test:unit

# 整合測試
npm run test:integration

# 測試覆蓋率
npm run test:coverage
```

### 程式碼檢查

```bash
# ESLint
npm run lint

# 自動修復
npm run lint:fix

# TypeScript 型別檢查
npm run type-check
```

### 建置與部署

```bash
# 開發環境
npm run dev

# 建置正式版本
npm run build

# 啟動正式版本
npm start
```

## 除錯技巧

### 1. 後端除錯

```typescript
// 使用內建 logger
import { logger } from '@/utils/logger';

logger.info('對局狀態', { gameId, moveNumber });
logger.error('落子錯誤', { error, position });
```

### 2. 前端除錯

```typescript
// React DevTools
// Redux DevTools（如使用 Redux）

// Socket.IO 除錯
socket.on('*', (event, data) => {
  console.log('[Socket Event]', event, data);
});
```

### 3. MongoDB 查詢

```bash
# 連線到 MongoDB
mongosh

# 切換資料庫
use gogame

# 查詢對局
db.games.find({ gameId: '<game-id>' }).pretty()

# 查詢進行中對局
db.games.find({ status: 'in_progress' }).count()
```

## 效能最佳化

### 1. 後端最佳化
- 使用 Redis 快取進行中對局狀態
- MongoDB 索引優化（見 data-model.md）
- WebSocket 房間管理（避免全域廣播）

### 2. 前端最佳化
- Canvas 局部重繪（僅重繪變動區域）
- React.memo 減少不必要的重新渲染
- WebSocket 事件節流（避免過度更新 UI）

## 疑難排解

### 問題：WebSocket 無法連線

**解決方案**：
1. 檢查 CORS 設定
2. 確認 JWT token 有效
3. 檢查防火牆規則

### 問題：超級打劫誤判

**解決方案**：
1. 驗證 Zobrist hash 實作
2. 檢查盤面雜湊是否正確更新
3. 查看 boardHistory 是否包含所有歷史盤面

### 問題：計時器不同步

**解決方案**：
1. 確認伺服器端控制計時
2. 檢查 timer:tick 事件是否正常推送
3. 驗證客戶端時間顯示邏輯

## 下一步

1. 閱讀 [data-model.md](./data-model.md) 了解資料結構
2. 閱讀 [contracts/rest-api.md](./contracts/rest-api.md) 了解 API 規範
3. 閱讀 [contracts/websocket-events.md](./contracts/websocket-events.md) 了解 WebSocket 事件
4. 開始實作第一個功能（建議從遊戲規則引擎開始）

## 資源連結

- [圍棋規則參考](https://www.britgo.org/intro/intro2.html)
- [SGF 格式規範](https://www.red-bean.com/sgf/)
- [Socket.IO 文件](https://socket.io/docs/v4/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Jest 測試框架](https://jestjs.io/)
- [React 官方文件](https://react.dev/)
