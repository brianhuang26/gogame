# WebSocket 事件契約

**Protocol**: Socket.IO 4.x  
**Namespace**: `/game`

## 連線流程

### 1. 客戶端連線
```javascript
const socket = io('http://localhost:3000/game', {
  auth: {
    token: 'jwt-token'
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

### 2. 伺服器驗證
伺服器驗證 JWT token，成功後觸發 `connect` 事件。

---

## 通用事件

### connect
客戶端成功連線

**Server → Client**:
```javascript
socket.on('connect', () => {
  console.log('已連線，Socket ID:', socket.id);
});
```

---

### disconnect
客戶端斷線

**Server → Client**:
```javascript
socket.on('disconnect', (reason) => {
  console.log('斷線原因:', reason);
  // reason: 'transport close', 'client namespace disconnect', etc.
});
```

---

### error
錯誤事件

**Server → Client**:
```javascript
socket.on('error', (error) => {
  console.error('錯誤:', error);
  // error: { code: 'ERROR_CODE', message: '錯誤訊息' }
});
```

---

## 對局房間事件

### game:join
加入對局房間

**Client → Server**:
```javascript
socket.emit('game:join', {
  gameId: 'uuid-v4'
});
```

**Server → Client** (成功):
```javascript
socket.on('game:joined', (data) => {
  console.log('已加入對局:', data);
  /*
  {
    gameId: 'uuid-v4',
    playerColor: 'black',
    gameState: {
      currentBoard: [[0, 1, -1, ...], ...],
      currentTurn: 'white',
      moveNumber: 15,
      capturedStones: { black: 1, white: 2 },
      lastMove: { x: 3, y: 3 }
    },
    timer: { ... },
    moves: [ ... ]
  }
  */
});
```

**Server → Client** (錯誤):
```javascript
socket.on('error', (error) => {
  // { code: 'GAME_NOT_FOUND', message: '對局不存在' }
  // { code: 'GAME_FULL', message: '對局已滿' }
  // { code: 'UNAUTHORIZED', message: '無權加入此對局' }
});
```

---

### game:leave
離開對局房間

**Client → Server**:
```javascript
socket.emit('game:leave', {
  gameId: 'uuid-v4'
});
```

**Server → Client**:
```javascript
socket.on('game:left', (data) => {
  console.log('已離開對局:', data.gameId);
});
```

---

## 對局操作事件

### game:move
落子

**Client → Server**:
```javascript
socket.emit('game:move', {
  gameId: 'uuid-v4',
  position: { x: 3, y: 3 },
  color: 'black'
});
```

**Server → All Clients in Room** (成功):
```javascript
socket.on('game:move', (data) => {
  console.log('對手落子:', data);
  /*
  {
    gameId: 'uuid-v4',
    move: {
      moveNumber: 16,
      color: 'black',
      position: { x: 3, y: 3 },
      timestamp: '2025-12-09T12:30:00Z',
      captured: [{ x: 3, y: 4 }],
      capturedCount: 1,
      thinkTime: 5.2
    },
    gameState: {
      currentBoard: [[0, 1, -1, ...], ...],
      currentTurn: 'white',
      moveNumber: 16,
      capturedStones: { black: 2, white: 2 },
      lastMove: { x: 3, y: 3 }
    }
  }
  */
});
```

**Server → Client** (錯誤):
```javascript
socket.on('game:move:error', (error) => {
  /*
  {
    code: 'INVALID_POSITION',
    message: '座標超出範圍',
    position: { x: 20, y: 3 }
  }
  {
    code: 'POSITION_OCCUPIED',
    message: '此位置已有棋子',
    position: { x: 3, y: 3 }
  }
  {
    code: 'SUICIDE_MOVE',
    message: '禁止落子：會導致己方棋子無氣',
    position: { x: 3, y: 3 }
  }
  {
    code: 'SUPERKO_VIOLATION',
    message: '禁止重複盤面',
    position: { x: 3, y: 3 },
    details: { boardHash: 'hash-value' }
  }
  {
    code: 'NOT_YOUR_TURN',
    message: '尚未輪到你的回合',
    currentTurn: 'white'
  }
  */
});
```

---

### game:pass
虛手

**Client → Server**:
```javascript
socket.emit('game:pass', {
  gameId: 'uuid-v4',
  color: 'white'
});
```

**Server → All Clients in Room**:
```javascript
socket.on('game:pass', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    move: {
      moveNumber: 17,
      color: 'white',
      isPass: true,
      timestamp: '2025-12-09T12:31:00Z'
    },
    consecutivePasses: 1
  }
  */
});
```

**Note**: 連續兩次虛手將觸發 `game:scoring` 事件

---

### game:resign
認輸

**Client → Server**:
```javascript
socket.emit('game:resign', {
  gameId: 'uuid-v4',
  color: 'white'
});
```

**Server → All Clients in Room**:
```javascript
socket.on('game:ended', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    result: {
      winner: 'black',
      method: 'resignation',
      timestamp: '2025-12-09T12:32:00Z'
    },
    finalState: { ... }
  }
  */
});
```

---

## 終局與計分事件

### game:scoring
進入終局計分階段

**Server → All Clients in Room**:
```javascript
socket.on('game:scoring', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    message: '雙方 Pass，進入終局計分',
    currentBoard: [[0, 1, -1, ...], ...],
    deadStones: {
      black: [],  // 待標記的死子
      white: []
    }
  }
  */
});
```

---

### game:mark-dead
標記死子

**Client → Server**:
```javascript
socket.emit('game:mark-dead', {
  gameId: 'uuid-v4',
  positions: [
    { x: 3, y: 3 },
    { x: 3, y: 4 }
  ],
  color: 'black'  // 標記者的顏色
});
```

**Server → All Clients in Room**:
```javascript
socket.on('game:dead-stones-updated', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    deadStones: {
      black: [{ x: 3, y: 3 }, { x: 3, y: 4 }],
      white: []
    },
    markedBy: 'black',
    needsConfirmation: true  // 需要對方確認
  }
  */
});
```

---

### game:confirm-scoring
確認計分結果

**Client → Server**:
```javascript
socket.emit('game:confirm-scoring', {
  gameId: 'uuid-v4',
  color: 'white',
  accept: true  // true: 接受, false: 拒絕
});
```

**Server → All Clients in Room** (雙方同意):
```javascript
socket.on('game:ended', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    result: {
      winner: 'black',
      method: 'score',
      score: {
        black: 185.5,
        white: 178.0,
        blackTerritory: 95,
        whiteTerritory: 88,
        blackCaptured: 5,
        whiteCaptured: 3
      },
      timestamp: '2025-12-09T12:35:00Z'
    },
    finalState: { ... }
  }
  */
});
```

**Server → All Clients in Room** (對方拒絕):
```javascript
socket.on('game:scoring-disputed', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    message: '對方不同意計分結果，繼續對局',
    disputedBy: 'white'
  }
  */
});
```

---

## 計時器事件

### timer:tick
計時器更新（每秒）

**Server → All Clients in Room**:
```javascript
socket.on('timer:tick', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    color: 'black',  // 當前計時的顏色
    timer: {
      mainTime: 450,
      byoYomiTime: 30,
      byoYomiPeriods: 5
    }
  }
  */
});
```

---

### timer:warning
讀秒警告

**Server → All Clients in Room**:
```javascript
socket.on('timer:warning', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    color: 'black',
    message: '讀秒！剩餘 30 秒',
    byoYomiPeriods: 5
  }
  */
});
```

---

### timer:timeout
超時判負

**Server → All Clients in Room**:
```javascript
socket.on('game:ended', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    result: {
      winner: 'white',
      method: 'timeout',
      timestamp: '2025-12-09T12:40:00Z'
    },
    timeoutColor: 'black'
  }
  */
});
```

---

## 配對事件

### match:found
配對成功

**Server → Client**:
```javascript
socket.on('match:found', (data) => {
  /*
  {
    requestId: 'uuid-v4',
    gameId: 'uuid-v4',
    opponent: {
      playerId: 'uuid-v4',
      username: 'player456',
      rating: 1620
    },
    myColor: 'black',
    boardSize: 19,
    timer: { ... }
  }
  */
});
```

**Note**: 收到此事件後應自動 `game:join`

---

## 悔棋事件

### game:request-undo
請求悔棋

**Client → Server**:
```javascript
socket.emit('game:request-undo', {
  gameId: 'uuid-v4',
  color: 'black'
});
```

**Server → Opponent**:
```javascript
socket.on('game:undo-requested', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    requestedBy: 'black',
    message: 'player123 請求悔棋'
  }
  */
});
```

---

### game:respond-undo
回應悔棋請求

**Client → Server**:
```javascript
socket.emit('game:respond-undo', {
  gameId: 'uuid-v4',
  color: 'white',
  accept: true
});
```

**Server → All Clients in Room** (同意):
```javascript
socket.on('game:undo-accepted', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    gameState: {
      currentBoard: [[0, 1, -1, ...], ...],
      currentTurn: 'black',
      moveNumber: 14,  // 回退一手
      capturedStones: { black: 1, white: 1 }
    },
    undoneMove: {
      moveNumber: 15,
      color: 'black',
      position: { x: 3, y: 3 }
    }
  }
  */
});
```

**Server → All Clients in Room** (拒絕):
```javascript
socket.on('game:undo-rejected', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    message: 'player456 拒絕悔棋'
  }
  */
});
```

---

## 斷線重連處理

### reconnect
重新連線成功

**Server → Client**:
```javascript
socket.on('reconnect', (attemptNumber) => {
  console.log('重新連線成功，嘗試次數:', attemptNumber);
  
  // 自動重新加入對局房間
  socket.emit('game:rejoin', {
    gameId: 'uuid-v4'
  });
});
```

---

### game:rejoin
重新加入對局

**Client → Server**:
```javascript
socket.emit('game:rejoin', {
  gameId: 'uuid-v4'
});
```

**Server → Client**:
```javascript
socket.on('game:rejoined', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    playerColor: 'black',
    gameState: { ... },  // 完整的當前狀態
    timer: { ... },
    moves: [ ... ],
    missedEvents: [
      // 斷線期間發生的事件
      { type: 'game:move', data: { ... }, timestamp: '...' }
    ]
  }
  */
});
```

---

## 防作弊事件

### cheat:detected
偵測到作弊行為（僅發送給管理員）

**Server → Admin Client**:
```javascript
socket.on('cheat:detected', (data) => {
  /*
  {
    gameId: 'uuid-v4',
    playerId: 'uuid-v4',
    type: 'FAST_MOVES',
    details: {
      averageMoveTime: 0.3,
      suspiciousMoves: [15, 16, 17, 18]
    },
    flaggedAt: '2025-12-09T12:00:00Z'
  }
  */
});
```

---

## 錯誤碼總覽

| Error Code | Description | HTTP 等價 |
|-----------|-------------|----------|
| GAME_NOT_FOUND | 對局不存在 | 404 |
| GAME_FULL | 對局已滿 | 409 |
| UNAUTHORIZED | 未認證 | 401 |
| FORBIDDEN | 無權限 | 403 |
| INVALID_POSITION | 座標錯誤 | 400 |
| POSITION_OCCUPIED | 位置已佔用 | 400 |
| SUICIDE_MOVE | 禁入點 | 400 |
| SUPERKO_VIOLATION | 超級打劫違規 | 400 |
| NOT_YOUR_TURN | 不是你的回合 | 400 |
| GAME_ENDED | 對局已結束 | 409 |

---

## 事件流程範例

### 完整對局流程

```javascript
// 1. 連線
const socket = io('http://localhost:3000/game', { auth: { token: 'jwt' } });

// 2. 加入對局
socket.emit('game:join', { gameId: 'game-123' });

socket.on('game:joined', (data) => {
  console.log('對局狀態:', data.gameState);
});

// 3. 落子
socket.on('game:move', (data) => {
  console.log('對手落子:', data.move);
  // 更新 UI
});

// 4. 自己落子
socket.emit('game:move', {
  gameId: 'game-123',
  position: { x: 3, y: 3 },
  color: 'black'
});

// 5. 計時器
socket.on('timer:tick', (data) => {
  console.log('剩餘時間:', data.timer.mainTime);
  // 更新計時器 UI
});

// 6. 虛手
socket.emit('game:pass', { gameId: 'game-123', color: 'black' });

// 7. 終局計分
socket.on('game:scoring', (data) => {
  console.log('進入終局計分');
  // 顯示計分 UI
});

// 8. 標記死子
socket.emit('game:mark-dead', {
  gameId: 'game-123',
  positions: [{ x: 3, y: 3 }],
  color: 'black'
});

// 9. 確認計分
socket.emit('game:confirm-scoring', {
  gameId: 'game-123',
  color: 'black',
  accept: true
});

// 10. 對局結束
socket.on('game:ended', (data) => {
  console.log('對局結果:', data.result);
  // 顯示結果 UI
});
```

---

## 效能考量

### 事件頻率限制

| 事件 | 限制 |
|------|------|
| game:move | 10/秒 |
| game:pass | 1/秒 |
| game:request-undo | 3/分鐘 |
| timer:tick | 1/秒（伺服器推送） |

### 房間管理

- 每個對局一個房間（`room:${gameId}`）
- 僅對局雙方可加入房間
- 管理員可加入所有房間（觀察模式）

### 斷線處理

- 斷線保留對局狀態 10 分鐘
- 重連自動恢復房間訂閱
- 推送斷線期間的事件（最多 100 個）
