# REST API 契約

**Version**: 1.0.0  
**Base URL**: `/api/v1`  
**Format**: OpenAPI 3.0

## 通用規範

### 認證
所有 API 端點（除了 `/auth/*`）均需使用 JWT Bearer Token 認證：

```
Authorization: Bearer <token>
```

### 錯誤回應格式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤訊息（正體中文）",
    "details": {}
  }
}
```

### 常見錯誤碼

| HTTP Status | Error Code | Description |
|------------|-----------|-------------|
| 400 | INVALID_REQUEST | 請求參數錯誤 |
| 401 | UNAUTHORIZED | 未認證 |
| 403 | FORBIDDEN | 無權限 |
| 404 | NOT_FOUND | 資源不存在 |
| 409 | CONFLICT | 資源衝突 |
| 429 | RATE_LIMIT_EXCEEDED | 請求頻率超限 |
| 500 | INTERNAL_ERROR | 伺服器錯誤 |

---

## 認證端點

### POST /auth/register
註冊新玩家帳號

**Request Body**:
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "playerId": "uuid-v4",
  "username": "player123",
  "token": "jwt-token",
  "rating": 1500
}
```

**Errors**:
- `409 CONFLICT` - 使用者名稱或 email 已存在

---

### POST /auth/login
玩家登入

**Request Body**:
```json
{
  "username": "player123",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "playerId": "uuid-v4",
  "username": "player123",
  "token": "jwt-token",
  "rating": 1650
}
```

**Errors**:
- `401 UNAUTHORIZED` - 帳號或密碼錯誤
- `403 FORBIDDEN` - 帳號已被封禁

---

## 對局端點

### POST /games
建立新對局

**Request Body**:
```json
{
  "boardSize": 19,
  "opponentId": "uuid-v4",
  "timerConfig": {
    "mode": "byo-yomi",
    "mainTime": 600,
    "byoYomiTime": 30,
    "byoYomiPeriods": 5
  },
  "komi": 7.5
}
```

**Response** (201 Created):
```json
{
  "gameId": "uuid-v4",
  "boardSize": 19,
  "players": {
    "black": {
      "playerId": "uuid-v4",
      "name": "player123",
      "rating": 1650
    },
    "white": {
      "playerId": "uuid-v4",
      "name": "player456",
      "rating": 1620
    }
  },
  "state": {
    "currentBoard": [[0, 0, ...], ...],
    "currentTurn": "black",
    "moveNumber": 0,
    "capturedStones": { "black": 0, "white": 0 }
  },
  "status": "in_progress",
  "createdAt": "2025-12-09T12:00:00Z"
}
```

**Errors**:
- `400 INVALID_REQUEST` - 參數錯誤（如不支援的棋盤大小）
- `404 NOT_FOUND` - 對手不存在

---

### GET /games/:gameId
取得對局詳細資訊

**Path Parameters**:
- `gameId` (string, required) - 對局 ID

**Response** (200 OK):
```json
{
  "gameId": "uuid-v4",
  "boardSize": 19,
  "players": { /* ... */ },
  "state": {
    "currentBoard": [[0, 1, -1, ...], ...],
    "currentTurn": "white",
    "moveNumber": 25,
    "capturedStones": { "black": 2, "white": 1 },
    "lastMove": { "x": 3, "y": 3 }
  },
  "moves": [
    {
      "moveNumber": 1,
      "color": "black",
      "position": { "x": 15, "y": 15 },
      "timestamp": "2025-12-09T12:05:00Z",
      "captured": [],
      "thinkTime": 5.2
    },
    // ...
  ],
  "timer": {
    "mode": "byo-yomi",
    "black": {
      "mainTime": 450,
      "byoYomiTime": 30,
      "byoYomiPeriods": 5
    },
    "white": {
      "mainTime": 520,
      "byoYomiTime": 30,
      "byoYomiPeriods": 5
    }
  },
  "status": "in_progress",
  "createdAt": "2025-12-09T12:00:00Z"
}
```

**Errors**:
- `404 NOT_FOUND` - 對局不存在

---

### POST /games/:gameId/moves
落子（備用端點，主要使用 WebSocket）

**Path Parameters**:
- `gameId` (string, required) - 對局 ID

**Request Body**:
```json
{
  "position": { "x": 3, "y": 3 },
  "color": "black"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "move": {
    "moveNumber": 26,
    "color": "black",
    "position": { "x": 3, "y": 3 },
    "timestamp": "2025-12-09T12:30:00Z",
    "captured": [
      { "x": 3, "y": 4 }
    ],
    "capturedCount": 1,
    "boardHashAfter": "zobrist-hash-value"
  },
  "gameState": {
    "currentBoard": [[0, 1, -1, ...], ...],
    "currentTurn": "white",
    "moveNumber": 26,
    "capturedStones": { "black": 3, "white": 1 }
  }
}
```

**Errors**:
- `400 INVALID_REQUEST` - 非法落子
  - `INVALID_POSITION` - 座標超出範圍
  - `POSITION_OCCUPIED` - 位置已有棋子
  - `SUICIDE_MOVE` - 禁入點（無氣且無法提子）
  - `SUPERKO_VIOLATION` - 違反超級打劫規則
- `403 FORBIDDEN` - 不是當前玩家回合
- `404 NOT_FOUND` - 對局不存在
- `409 CONFLICT` - 對局已結束

---

### POST /games/:gameId/pass
虛手（Pass）

**Path Parameters**:
- `gameId` (string, required) - 對局 ID

**Response** (200 OK):
```json
{
  "success": true,
  "move": {
    "moveNumber": 27,
    "color": "white",
    "isPass": true,
    "timestamp": "2025-12-09T12:31:00Z"
  },
  "consecutivePasses": 1
}
```

**Note**: 連續兩次虛手將進入終局階段

---

### POST /games/:gameId/resign
認輸

**Path Parameters**:
- `gameId` (string, required) - 對局 ID

**Response** (200 OK):
```json
{
  "success": true,
  "result": {
    "winner": "black",
    "method": "resignation",
    "timestamp": "2025-12-09T12:32:00Z"
  }
}
```

---

### GET /games/:gameId/sgf
匯出 SGF 棋譜

**Path Parameters**:
- `gameId` (string, required) - 對局 ID

**Response** (200 OK):
```
Content-Type: application/x-go-sgf
Content-Disposition: attachment; filename="game-{gameId}.sgf"

(;FF[4]GM[1]SZ[19]CA[UTF-8]
PB[player123]PW[player456]BR[1650]WR[1620]
DT[2025-12-09]RE[B+R]RU[Chinese]KM[7.5]
;B[pd];W[dp];B[pp];W[dd]...)
```

**Errors**:
- `404 NOT_FOUND` - 對局不存在

---

## 玩家端點

### GET /players/:playerId
取得玩家資訊

**Path Parameters**:
- `playerId` (string, required) - 玩家 ID

**Response** (200 OK):
```json
{
  "playerId": "uuid-v4",
  "username": "player123",
  "rating": 1650,
  "stats": {
    "totalGames": 120,
    "wins": 65,
    "losses": 52,
    "draws": 3,
    "winRate": 0.542
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "lastLoginAt": "2025-12-09T10:00:00Z"
}
```

**Errors**:
- `404 NOT_FOUND` - 玩家不存在

---

### GET /players/:playerId/games
取得玩家對局歷史

**Path Parameters**:
- `playerId` (string, required) - 玩家 ID

**Query Parameters**:
- `page` (integer, optional, default: 1) - 頁碼
- `limit` (integer, optional, default: 20) - 每頁數量
- `status` (string, optional) - 篩選狀態（`in_progress`, `completed`）

**Response** (200 OK):
```json
{
  "games": [
    {
      "gameId": "uuid-v4",
      "boardSize": 19,
      "opponent": {
        "playerId": "uuid-v4",
        "username": "player456",
        "rating": 1620
      },
      "myColor": "black",
      "status": "completed",
      "result": {
        "winner": "black",
        "method": "score",
        "score": { "black": 185.5, "white": 178.0 }
      },
      "createdAt": "2025-12-08T15:00:00Z"
    },
    // ...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

---

## 配對端點

### POST /matching/queue
加入配對隊列

**Request Body**:
```json
{
  "boardSize": 19,
  "ratingRange": {
    "min": 1400,
    "max": 1800
  },
  "timerMode": "byo-yomi"
}
```

**Response** (201 Created):
```json
{
  "requestId": "uuid-v4",
  "status": "waiting",
  "estimatedWaitTime": 30,
  "createdAt": "2025-12-09T12:00:00Z",
  "expiredAt": "2025-12-09T12:05:00Z"
}
```

**Note**: 配對成功後將透過 WebSocket 推送 `match:found` 事件

---

### DELETE /matching/queue/:requestId
取消配對

**Path Parameters**:
- `requestId` (string, required) - 配對請求 ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "配對已取消"
}
```

---

## 管理員端點

### GET /admin/games
取得對局列表（管理員）

**Query Parameters**:
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 50)
- `status` (string, optional) - 篩選狀態
- `flagged` (boolean, optional) - 僅顯示待審查對局

**Response** (200 OK):
```json
{
  "games": [
    {
      "gameId": "uuid-v4",
      "players": { /* ... */ },
      "status": "flagged",
      "flags": [
        {
          "type": "AI_PATTERN",
          "details": { "aiSimilarity": 0.95 },
          "flaggedAt": "2025-12-09T12:00:00Z"
        }
      ],
      "createdAt": "2025-12-09T11:00:00Z"
    },
    // ...
  ],
  "pagination": { /* ... */ }
}
```

---

### POST /admin/players/:playerId/ban
封禁玩家

**Path Parameters**:
- `playerId` (string, required) - 玩家 ID

**Request Body**:
```json
{
  "reason": "確認使用 AI 輔助",
  "duration": 2592000
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "playerId": "uuid-v4",
  "status": "banned",
  "bannedUntil": "2026-01-08T12:00:00Z"
}
```

---

### GET /admin/logs
取得系統日誌

**Query Parameters**:
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 100)
- `severity` (string, optional) - 篩選嚴重程度
- `type` (string, optional) - 篩選類型

**Response** (200 OK):
```json
{
  "logs": [
    {
      "logId": "uuid-v4",
      "type": "CHEAT_DETECTED",
      "severity": "warning",
      "message": "偵測到疑似 AI 輔助行為",
      "relatedEntities": {
        "gameId": "uuid-v4",
        "playerId": "uuid-v4"
      },
      "timestamp": "2025-12-09T12:00:00Z"
    },
    // ...
  ],
  "pagination": { /* ... */ }
}
```

---

## Rate Limiting

所有端點均有速率限制：

| 端點類別 | 限制 |
|---------|------|
| 認證端點 | 10 req/min |
| 對局操作 | 60 req/min |
| 查詢端點 | 100 req/min |
| 管理員端點 | 200 req/min |

超過限制將返回 `429 RATE_LIMIT_EXCEEDED`。
