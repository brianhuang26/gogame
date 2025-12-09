# Implementation Plan: 圍棋線上對戰系統

<!--
  ⚠️ 重要：本文件必須使用正體中文（zh-TW）編寫
  IMPORTANT: This document MUST be written in Traditional Chinese (zh-TW)
  
  根據專案憲章第 V 條「語言與文件標準」，所有專案文件必須使用正體中文撰寫。
  Per Constitution Principle V "Language & Documentation Standards", all project 
  documentation MUST be written in Traditional Chinese.
-->

**Branch**: `001-go-game-implementation` | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-go-game-implementation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

實作完整的線上圍棋對戰系統，支援標準圍棋規則（含超級打劫）、即時多人對戰、多種計時模式、防作弊機制、棋譜記錄與管理、玩家配對系統、以及後台管理功能。系統採用 WebSocket 實現即時同步，使用文件型資料庫儲存對局狀態，並強制採用中國規則以確保一致性。

## Technical Context

**Language/Version**: TypeScript 5.0+ (Node.js 18+ for backend, modern browsers for frontend)  
**Primary Dependencies**: 
  - Backend: Express.js 4+, Socket.IO 4+, MongoDB driver 6+
  - Frontend: React 18+, Socket.IO Client 4+, Canvas API
  
**Storage**: MongoDB 6.0+ (文件型資料庫)  
**Testing**: Jest 28+ (單元測試、整合測試、契約測試)  
**Target Platform**: Web application (Linux/Windows server backend, modern web browsers frontend)
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
  - 支援 1000 場並行對局
  - 落子延遲 <1 秒
  - 落子運算時間 <100ms
  - WebSocket 同步延遲 <1 秒
  - 單伺服器支援 500 位同時在線玩家
  
**Constraints**: 
  - 單手落子運算（含超級打劫檢查）<100ms
  - 棋盤狀態重建 <2 秒
  - 文件型資料庫查詢延遲 <500ms
  - 本地 UI 回饋延遲 <200ms
  - 計時誤差 <±2 秒（10 分鐘對局）
  
**Scale/Scope**: 
  - 支援 19x19 棋盤與 300+ 手對局
  - 儲存完整歷史盤面狀態（超級打劫）
  - 500+ 位同時在線玩家
  - 1000+ 場並行對局

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 初始檢查（Phase 0 前）

✅ **通過** - 所有憲章原則均符合要求

### ✅ I. 程式碼品質標準
- 所有程式碼將使用英文命名（變數、函數、類別）
- 所有註解將使用正體中文撰寫
- 函數將保持單一職責（如：棋群氣數計算、提子判定、超級打劫檢查各自獨立）
- 公開 API 將包含正體中文文件註解
- 將使用 ESLint 強制執行程式碼品質標準

### ✅ II. 測試標準
- 將採用 TDD 開發所有核心遊戲邏輯（落子、提子、超級打劫）
- 每個使用者故事（spec.md 中的 9 個）都將有對應的驗收測試
- 核心 API（落子驗證、棋群判定、超級打劫檢查）將有契約測試
- 關鍵路徑（WebSocket 同步、計時系統、防作弊）將有整合測試
- 目標單元測試覆蓋率 ≥80%

### ✅ III. 使用者體驗一致性
- 所有錯誤訊息將使用正體中文，具備可操作性（如：「此位置禁止落子：會導致己方棋子無氣」）
- 所有使用者介面文字將使用正體中文
- WebSocket API 將維持一致的訊息格式
- 棋盤 UI 將在不同裝置上保持一致的互動模式

### ✅ IV. 效能要求
- 已在 spec.md 定義明確的效能目標（SC-005 至 SC-019）
- 超級打劫盤面比對將使用雜湊演算法（O(1) 查詢）而非完整盤面比對（O(n²)）
- 棋群氣數計算將使用 BFS/DFS（O(n) 時間複雜度，n 為棋群大小）
- 將建立效能基準測試以監控關鍵操作（落子、提子、超級打劫檢查）

### ✅ V. 語言與文件標準
- spec.md 和 requirements.md 已使用正體中文（zh-TW）編寫
- 所有專案文件將使用正體中文
- 程式碼命名將使用英文（camelCase/PascalCase）
- 程式碼註解將使用正體中文
- 錯誤訊息和 UI 文字將使用正體中文

### ✅ VI. JavaScript ES6+ 技術標準
- 將使用 ES6+ 語法（const/let、箭頭函數、解構、模板字串）
- 非同步操作將使用 async/await（WebSocket 事件處理、資料庫操作）
- 將使用 ES6 modules（import/export）組織程式碼
- 陣列操作將使用 map、filter、reduce（如：棋群篩選、座標轉換）
- 將使用 ESLint 強制執行程式碼風格
- **已採用 TypeScript 5.0+** 以增強型別安全（Phase 0 研究決定）

### 品質門檻確認
- 所有自動化檢查將在 CI 中執行（測試、linting、覆蓋率）
- 程式碼審查將驗證憲章合規性
- 破壞性變更將記錄在變更日誌（正體中文）
- 公開 API 變更將更新文件（正體中文）

---

### Phase 1 後重新檢查

✅ **通過** - Phase 1 設計符合所有憲章原則

**技術決策確認**：
- ✅ 已選定 TypeScript 5.0+（符合憲章 VI，提供型別安全）
- ✅ 已選定 MongoDB 6.0+（文件型資料庫，符合需求 FR-023）
- ✅ 已選定 Socket.IO 4+（WebSocket 函式庫，符合需求 FR-008）
- ✅ 已選定 Express.js 4+（後端框架，輕量靈活）
- ✅ 已選定 React 18+（前端框架，元件化設計）
- ✅ 已選定 Jest 28+（測試框架，符合憲章 II）

**資料模型確認**：
- ✅ 所有實體（Game, Player, Move, Timer 等）均有明確定義
- ✅ 使用 TypeScript 介面定義型別，符合憲章品質標準
- ✅ MongoDB 索引策略已規劃，符合效能要求

**API 契約確認**：
- ✅ REST API 端點已定義，使用標準 HTTP 方法
- ✅ WebSocket 事件已定義，使用一致的訊息格式
- ✅ 所有錯誤訊息使用正體中文，具備可操作性

**無憲章違規**：所有技術選擇與設計決策均符合專案憲章原則。

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/              # 資料模型（Game, Board, Player, Move, Timer）
│   ├── services/            # 業務邏輯（遊戲規則、超級打劫、計時、防作弊）
│   │   ├── game/           # 遊戲核心邏輯
│   │   ├── matching/       # 配對系統
│   │   ├── admin/          # 後台管理
│   │   └── antiCheat/      # 防作弊偵測
│   ├── api/                # REST API 端點
│   ├── websocket/          # WebSocket 處理器
│   └── db/                 # 資料庫連線與操作
└── tests/
    ├── contract/           # API 契約測試
    ├── integration/        # 整合測試（WebSocket、資料庫）
    └── unit/              # 單元測試（遊戲邏輯、超級打劫）

frontend/
├── src/
│   ├── components/         # UI 元件（Board, Stone, Timer, GameInfo）
│   ├── pages/             # 頁面（對局頁、棋譜頁、管理頁）
│   ├── services/          # 前端服務（WebSocket 客戶端、API 客戶端）
│   ├── utils/             # 工具函數（座標轉換、SGF 解析）
│   └── styles/            # 樣式檔案
└── tests/
    ├── e2e/               # 端對端測試（完整對局流程）
    └── unit/              # 元件單元測試

shared/
└── contracts/             # 共用契約定義（API schema、WebSocket 訊息格式）
```

**Structure Decision**: 選擇 Web 應用架構（Option 2），因為需求明確包含前端棋盤 UI 和後端遊戲邏輯伺服器。將共用的契約定義（API schema、WebSocket 訊息格式）抽取至 shared/ 目錄，確保前後端使用相同的介面定義。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

本專案無憲章違規需要說明。所有技術選擇符合專案憲章原則。
