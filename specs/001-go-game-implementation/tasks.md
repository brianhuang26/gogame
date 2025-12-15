---
description: "Task list for Go Game implementation"
---

# Tasks: 圍棋線上對戰系統

<!--
  ⚠️ 重要:本文件必須使用正體中文(zh-TW)編寫
  IMPORTANT: This document MUST be written in Traditional Chinese (zh-TW)
  
  根據專案憲章第 V 條「語言與文件標準」,所有專案文件必須使用正體中文撰寫。
  Per Constitution Principle V "Language & Documentation Standards", all project 
  documentation MUST be written in Traditional Chinese.
-->

**Input**: Design documents from `/specs/001-go-game-implementation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

本專案採用 Web 應用架構:
- **後端**: `backend/src/`, `backend/tests/`
- **前端**: `frontend/src/`, `frontend/tests/`
- **共用**: `shared/contracts/`

---

## Phase 1: Setup (專案初始化)

**Purpose**: 建立專案結構與基礎設定

- [X] T001 Create project directory structure (backend/, frontend/, shared/)
- [X] T002 Initialize backend Node.js project with TypeScript 5.0+ and Express.js 4+ in backend/package.json
- [X] T003 Initialize frontend React 18+ project with Vite and TypeScript in frontend/package.json
- [X] T004 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.js
- [X] T005 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.js
- [X] T006 [P] Setup Jest 28+ testing framework for backend in backend/jest.config.js
- [X] T007 [P] Setup Jest testing framework for frontend in frontend/jest.config.js
- [X] T008 Setup MongoDB 6.0+ connection and database initialization in backend/src/db/connection.ts
- [X] T009 Create environment configuration templates in backend/.env.example and frontend/.env.example
- [X] T010 [P] Setup TypeScript configuration for backend in backend/tsconfig.json
- [X] T011 [P] Setup TypeScript configuration for frontend in frontend/tsconfig.json

---

## Phase 2: Foundational (核心基礎設施)

**Purpose**: 所有使用者故事依賴的核心基礎設施,必須先完成才能開始實作任何使用者故事

**⚠️ CRITICAL**: 此階段完成前無法開始任何使用者故事開發

- [X] T012 Create shared TypeScript interfaces for Position, StoneColor, BoardCell in shared/contracts/types.ts
- [X] T013 [P] Implement Zobrist hashing algorithm in backend/src/services/game/ZobristHash.ts
- [X] T014 [P] Implement SuperKo checker using Set-based history tracking in backend/src/services/game/SuperKoChecker.ts
- [X] T015 [P] Implement BoardAnalyzer for group detection using BFS in backend/src/services/game/BoardAnalyzer.ts
- [X] T016 Setup Express.js server with middleware structure in backend/src/app.ts
- [X] T017 Setup Socket.IO server integration with Express in backend/src/websocket/SocketManager.ts
- [X] T018 [P] Implement JWT authentication middleware in backend/src/api/middleware/auth.ts
- [X] T019 [P] Implement error handling middleware in backend/src/api/middleware/errorHandler.ts
- [X] T020 [P] Implement rate limiting middleware in backend/src/api/middleware/rateLimit.ts
- [X] T021 Create logger utility using Winston in backend/src/utils/logger.ts
- [X] T022 Create validation utility for game inputs in backend/src/utils/validation.ts
- [X] T023 Setup Socket.IO client configuration in frontend/src/services/socket.ts
- [X] T024 Create API client service using Axios in frontend/src/services/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 基本對局流程 (Priority: P1) 🎯 MVP

**Goal**: 兩位玩家可以建立並進行一場完整的圍棋對局,包含正確的落子、提子判定,並在對局結束後看到勝負結果

**Independent Test**: 可透過兩位測試者在同一棋盤上輪流落子、觀察提子效果、進行終局計點來完全測試

### Tests for User Story 1 (TDD approach - 依據憲章測試標準)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [P] [US1] Contract test for POST /api/v1/games (create game) in backend/tests/contract/gameAPI.test.ts
- [ ] T026 [P] [US1] Contract test for POST /api/v1/games/:id/moves (place stone) in backend/tests/contract/gameAPI.test.ts
- [ ] T027 [P] [US1] Unit test for stone placement validation in backend/tests/unit/services/GameEngine.test.ts
- [ ] T028 [P] [US1] Unit test for capture detection logic in backend/tests/unit/services/BoardAnalyzer.test.ts
- [ ] T029 [P] [US1] Unit test for forbidden point detection in backend/tests/unit/services/GameEngine.test.ts
- [ ] T030 [P] [US1] Integration test for complete game flow in backend/tests/integration/gameFlow.test.ts

### Implementation for User Story 1

- [X] T031 [P] [US1] Create Game model interface in backend/src/models/Game.ts
- [X] T032 [P] [US1] Create GameState model interface in backend/src/models/GameState.ts
- [X] T033 [P] [US1] Create Move model interface in backend/src/models/Move.ts
- [X] T034 [P] [US1] Create Player model interface in backend/src/models/Player.ts
- [X] T035 [US1] Implement GameRepository for MongoDB operations in backend/src/db/repositories/GameRepository.ts
- [X] T036 [US1] Implement GameEngine core logic (depends on T031-T034) in backend/src/services/game/GameEngine.ts
- [X] T037 [US1] Implement stone placement validation in backend/src/services/game/GameEngine.ts
- [X] T038 [US1] Implement capture detection using BoardAnalyzer in backend/src/services/game/GameEngine.ts
- [X] T039 [US1] Implement forbidden point (suicide) detection in backend/src/services/game/GameEngine.ts
- [X] T040 [US1] Implement territory counting using Chinese rules in backend/src/services/game/ScoringService.ts
- [X] T041 [US1] Create POST /api/v1/games endpoint in backend/src/api/routes/games.ts
- [X] T042 [US1] Create GET /api/v1/games/:id endpoint in backend/src/api/routes/games.ts
- [X] T043 [US1] Create POST /api/v1/games/:id/moves endpoint in backend/src/api/routes/games.ts
- [X] T044 [US1] Create POST /api/v1/games/:id/end endpoint for game termination in backend/src/api/routes/games.ts
- [X] T045 [P] [US1] Create Board component with Canvas rendering in frontend/src/components/Board/Board.tsx
- [X] T046 [P] [US1] Implement board rendering logic using Canvas API in frontend/src/utils/boardRenderer.ts
- [X] T047 [P] [US1] Create GameInfo component showing current state in frontend/src/components/GameInfo/GameInfo.tsx
- [X] T048 [P] [US1] Create CapturedStones display component in frontend/src/components/GameInfo/CapturedStones.tsx
- [X] T049 [US1] Create GamePage integrating all components in frontend/src/pages/GamePage.tsx
- [X] T050 [US1] Implement useGame custom hook for game state management in frontend/src/hooks/useGame.ts
- [X] T051 [US1] Add error message display with Traditional Chinese messages in frontend/src/components/common/ErrorDisplay.tsx
- [X] T052 [US1] Add validation for all user story 1 operations ensuring <100ms stone placement calculation

**Checkpoint**: At this point, User Story 1 should be fully functional - two players can play a complete game locally with correct capture and scoring

---

## Phase 4: User Story 2 - 打劫規則與狀態管理 (Priority: P1)

**Goal**: 系統能正確判定並處理超級打劫(superko)情況,防止任何重複棋局狀態的出現

**Independent Test**: 可透過建立打劫局面(A提B的一子,B立即提回),驗證系統是否正確禁止立即反提,並測試更複雜的循環局面

### Tests for User Story 2

- [ ] T053 [P] [US2] Unit test for simple ko detection in backend/tests/unit/services/SuperKoChecker.test.ts
- [ ] T054 [P] [US2] Unit test for superko (three-ko cycle) detection in backend/tests/unit/services/SuperKoChecker.test.ts
- [ ] T055 [P] [US2] Unit test for Zobrist hash collision handling in backend/tests/unit/services/ZobristHash.test.ts
- [ ] T056 [P] [US2] Integration test for ko rule enforcement in backend/tests/integration/koRule.test.ts
- [ ] T057 [P] [US2] Performance test ensuring superko check <1ms in backend/tests/unit/services/SuperKoChecker.test.ts

### Implementation for User Story 2

- [X] T058 [US2] Integrate SuperKoChecker into GameEngine stone placement flow in backend/src/services/game/GameEngine.ts
- [X] T059 [US2] Implement board hash calculation on every move in backend/src/services/game/GameEngine.ts
- [X] T060 [US2] Store board history in GameState with hash values in backend/src/models/GameState.ts
- [X] T061 [US2] Add superko validation before allowing stone placement in backend/src/services/game/GameEngine.ts
- [X] T062 [US2] Update GameRepository to store boardHistory array in backend/src/db/repositories/GameRepository.ts
- [X] T063 [US2] Add Traditional Chinese error messages for ko violations in backend/src/utils/validation.ts
- [ ] T064 [US2] Display ko violation messages in frontend UI in frontend/src/components/ErrorDisplay/ErrorDisplay.tsx
- [ ] T065 [US2] Add visual indicator for ko point on board in frontend/src/components/Board/Board.tsx

**Checkpoint**: Superko rule correctly prevents all repeated board positions including complex cycles

---

## Phase 5: User Story 3 - 即時同步與多人對戰 (Priority: P1)

**Goal**: 兩位玩家在不同裝置上能看到同步更新的棋盤狀態,所有落子、提子、計時都即時反映在雙方畫面

**Independent Test**: 可透過兩個不同瀏覽器視窗或裝置開啟同一對局,驗證一方的操作是否即時出現在另一方畫面

### Tests for User Story 3

- [ ] T066 [P] [US3] Integration test for WebSocket game join event in backend/tests/integration/websocket/gameHandlers.test.ts
- [ ] T067 [P] [US3] Integration test for WebSocket move synchronization in backend/tests/integration/websocket/gameHandlers.test.ts
- [ ] T068 [P] [US3] Integration test for reconnection and state recovery in backend/tests/integration/websocket/reconnection.test.ts
- [ ] T069 [P] [US3] Performance test ensuring move sync <1 second in backend/tests/integration/websocket/performance.test.ts

### Implementation for User Story 3

- [X] T070 [P] [US3] Define WebSocket event contracts in shared/contracts/types.ts
- [X] T071 [US3] Implement WebSocket 'game:join' handler in backend/src/websocket/handlers/gameHandlers.ts
- [X] T072 [US3] Implement WebSocket 'game:move' handler broadcasting to room in backend/src/websocket/handlers/gameHandlers.ts
- [X] T073 [US3] Implement WebSocket 'game:resign' handler in backend/src/websocket/handlers/gameHandlers.ts
- [X] T074 [US3] Implement socket authentication middleware in backend/src/websocket/middleware/socketAuth.ts
- [X] T075 [US3] Implement room management for games in backend/src/websocket/SocketManager.ts
- [ ] T076 [US3] Add session persistence for disconnected users (10 min retention) in backend/src/services/SessionService.ts
- [ ] T077 [US3] Implement reconnection logic with state recovery in backend/src/websocket/handlers/reconnectionHandlers.ts
- [X] T078 [US3] Setup Socket.IO client in frontend with auto-reconnect in frontend/src/services/socket.ts
- [X] T079 [US3] Implement useSocket custom hook in frontend/src/hooks/useSocket.ts
- [X] T080 [US3] Connect Board component to WebSocket events in frontend/src/components/Board/Board.tsx
- [X] T081 [US3] Add real-time move updates to GamePage in frontend/src/pages/GamePage.tsx
- [ ] T082 [US3] Implement optimistic UI updates with rollback on error in frontend/src/hooks/useGame.ts
- [ ] T083 [US3] Add network status indicator in frontend/src/components/NetworkStatus/NetworkStatus.tsx

**Checkpoint**: Real-time synchronization working - moves appear on both clients within 1 second, reconnection restores full state

---

## Phase 6: User Story 4 - 遊戲計時系統 (Priority: P2)

**Goal**: 對局支援多種計時模式(Fischer、Byo-yomi、Canadian),確保公平競賽並防止惡意拖延

**Independent Test**: 可透過建立使用計時器的對局,觀察時間倒數、讀秒警告、超時判負等功能是否正確運作

### Tests for User Story 4

- [ ] T084 [P] [US4] Unit test for Fischer timer logic in backend/tests/unit/services/TimerManager.test.ts
- [ ] T085 [P] [US4] Unit test for Byo-yomi timer logic in backend/tests/unit/services/TimerManager.test.ts
- [ ] T086 [P] [US4] Unit test for Canadian timer logic in backend/tests/unit/services/TimerManager.test.ts
- [ ] T087 [P] [US4] Integration test for timeout detection and game end in backend/tests/integration/timerTimeout.test.ts
- [ ] T088 [P] [US4] Performance test ensuring timer accuracy ±2 seconds in 10-minute game in backend/tests/integration/timerAccuracy.test.ts

### Implementation for User Story 4

- [ ] T089 [P] [US4] Create TimerConfig model interface in backend/src/models/Timer.ts
- [ ] T090 [P] [US4] Create TimerState model interface in backend/src/models/Timer.ts
- [ ] T091 [US4] Implement TimerManager service with server-side control in backend/src/services/timer/TimerManager.ts
- [ ] T092 [US4] Implement Fischer timer mode logic in backend/src/services/timer/TimerManager.ts
- [ ] T093 [US4] Implement Byo-yomi timer mode logic in backend/src/services/timer/TimerManager.ts
- [ ] T094 [US4] Implement Canadian timer mode logic in backend/src/services/timer/TimerManager.ts
- [ ] T095 [US4] Implement timeout detection and automatic game end in backend/src/services/timer/TimerManager.ts
- [ ] T096 [US4] Add timer initialization when creating game in backend/src/services/game/GameEngine.ts
- [ ] T097 [US4] Add timer pause/resume on move in backend/src/services/game/GameEngine.ts
- [ ] T098 [US4] Implement WebSocket 'timer:tick' event handler broadcasting every second in backend/src/websocket/handlers/timerHandlers.ts
- [ ] T099 [P] [US4] Create Timer display component in frontend/src/components/Timer/Timer.tsx
- [ ] T100 [US4] Implement useTimer custom hook syncing with server in frontend/src/hooks/useTimer.ts
- [ ] T101 [US4] Add timer selection UI to game creation in frontend/src/pages/GamePage.tsx
- [ ] T102 [US4] Add visual warnings for low time (byo-yomi countdown) in frontend/src/components/Timer/Timer.tsx

**Checkpoint**: All three timer modes working correctly, server-controlled, synced to clients, automatic timeout handling

---

## Phase 7: User Story 5 - 棋譜記錄與回顧 (Priority: P2)

**Goal**: 系統自動記錄每一手棋並支援標準SGF格式匯出,玩家可以前進/後退檢視棋局歷史

**Independent Test**: 可透過完成一局對局後,使用棋譜檢視功能前後瀏覽,並匯出SGF檔案在其他圍棋軟體中開啟驗證

### Tests for User Story 5

- [ ] T103 [P] [US5] Unit test for SGF export format validation in backend/tests/unit/utils/sgf.test.ts
- [ ] T104 [P] [US5] Unit test for board state reconstruction from move history in backend/tests/unit/services/GameEngine.test.ts
- [ ] T105 [P] [US5] Integration test for SGF import/export round-trip in backend/tests/integration/sgfRoundTrip.test.ts
- [ ] T106 [P] [US5] Snapshot test for SGF format compliance in backend/tests/unit/utils/sgf.test.ts

### Implementation for User Story 5

- [ ] T107 [US5] Implement SGF exporter following FF[4] standard in backend/src/utils/sgf.ts
- [ ] T108 [US5] Add SGF metadata generation (players, date, result) in backend/src/utils/sgf.ts
- [ ] T109 [US5] Add SGF move sequence generation in backend/src/utils/sgf.ts
- [ ] T110 [US5] Implement board state reconstruction from move history in backend/src/services/game/GameEngine.ts
- [ ] T111 [US5] Create GET /api/v1/games/:id/sgf endpoint in backend/src/api/routes/games.ts
- [ ] T112 [US5] Create GET /api/v1/players/:id/games endpoint for game history in backend/src/api/routes/players.ts
- [ ] T113 [P] [US5] Create MoveHistory component showing all moves in frontend/src/components/MoveHistory/MoveHistory.tsx
- [ ] T114 [US5] Implement move navigation (forward/backward) in frontend/src/components/MoveHistory/MoveHistory.tsx
- [ ] T115 [US5] Add SGF download button in frontend/src/pages/GamePage.tsx
- [ ] T116 [US5] Create HistoryPage for viewing past games in frontend/src/pages/HistoryPage.tsx
- [ ] T117 [US5] Implement board replay mode with step controls in frontend/src/components/Board/BoardReplay.tsx

**Checkpoint**: Complete game records stored, SGF export validates in standard Go software, replay navigation works smoothly

---

## Phase 8: User Story 6 - 防作弊機制 (Priority: P2)

**Goal**: 系統能偵測並防止常見作弊行為,包括AI輔助、多裝置操作、異常落子頻率等

**Independent Test**: 可透過模擬異常行為(快速連續落子、多裝置同時登入、疑似AI落子模式)來測試偵測與封鎖機制

### Tests for User Story 6

- [ ] T118 [P] [US6] Unit test for fast move detection in backend/tests/unit/services/antiCheat/MoveFrequencyDetector.test.ts
- [ ] T119 [P] [US6] Unit test for multi-device detection in backend/tests/unit/services/antiCheat/MultiDeviceDetector.test.ts
- [ ] T120 [P] [US6] Integration test for cheat flag creation and review workflow in backend/tests/integration/antiCheat.test.ts

### Implementation for User Story 6

- [ ] T121 [P] [US6] Create CheatFlag model interface in backend/src/models/CheatFlag.ts
- [ ] T122 [US6] Implement MoveFrequencyDetector (detect <0.5s moves) in backend/src/services/antiCheat/MoveFrequencyDetector.ts
- [ ] T123 [US6] Implement MultiDeviceDetector using session tracking in backend/src/services/antiCheat/MultiDeviceDetector.ts
- [ ] T124 [US6] Implement AIPatternDetector with similarity scoring in backend/src/services/antiCheat/AIPatternDetector.ts
- [ ] T125 [US6] Create AntiCheatService integrating all detectors in backend/src/services/antiCheat/AntiCheatService.ts
- [ ] T126 [US6] Add cheat detection hooks to move processing in backend/src/services/game/GameEngine.ts
- [ ] T127 [US6] Create CheatFlagRepository for MongoDB operations in backend/src/db/repositories/CheatFlagRepository.ts
- [ ] T128 [US6] Implement game flagging (status change to 'flagged') in backend/src/services/game/GameEngine.ts
- [ ] T129 [US6] Add server-side validation for all game logic (no client trust) in backend/src/api/middleware/validation.ts
- [ ] T130 [US6] Add session management limiting concurrent logins in backend/src/services/SessionService.ts

**Checkpoint**: Anti-cheat detection working - suspicious games flagged for review, multi-device prevented, all logic server-validated

---

## Phase 9: User Story 7 - 棋盤UI與互動體驗 (Priority: P2)

**Goal**: 玩家能在視覺清晰、操作流暢的介面上進行對局,包含懸停提示、響應式棋盤、悔棋確認等功能

**Independent Test**: 可透過不同螢幕尺寸、不同操作(滑鼠懸停、點擊、觸控)來測試介面反應與視覺回饋

### Tests for User Story 7

- [ ] T131 [P] [US7] Unit test for coordinate mapping logic in frontend/tests/unit/utils/coordinateMapper.test.ts
- [ ] T132 [P] [US7] E2E test for stone placement interaction in frontend/tests/e2e/stonePlacement.test.ts
- [ ] T133 [P] [US7] E2E test for responsive board sizing in frontend/tests/e2e/responsiveBoard.test.ts

### Implementation for User Story 7

- [ ] T134 [US7] Implement hover preview showing semi-transparent stone in frontend/src/components/Board/StonePreview.tsx
- [ ] T135 [US7] Implement responsive board sizing based on viewport in frontend/src/utils/boardRenderer.ts
- [ ] T136 [US7] Add touch event handlers for mobile devices in frontend/src/components/Board/Board.tsx
- [ ] T137 [US7] Implement undo request workflow (requires opponent consent) in backend/src/services/game/GameEngine.ts
- [ ] T138 [US7] Create WebSocket 'game:undo:request' and 'game:undo:response' handlers in backend/src/websocket/handlers/gameHandlers.ts
- [ ] T139 [US7] Implement dead stone marking interface in frontend/src/components/Board/DeadStoneMarker.tsx
- [ ] T140 [US7] Add territory counting visualization in frontend/src/components/Board/TerritoryDisplay.tsx
- [ ] T141 [US7] Implement liberty counting display (optional feature) in frontend/src/components/Board/LibertyDisplay.tsx
- [ ] T142 [US7] Add stone placement animation with <200ms local feedback in frontend/src/utils/boardRenderer.ts
- [ ] T143 [US7] Optimize Canvas rendering for partial updates in frontend/src/utils/boardRenderer.ts

**Checkpoint**: UI polished - hover preview, responsive design working, undo workflow functional, scoring UI clear

---

## Phase 10: User Story 8 - 玩家配對系統 (Priority: P3)

**Goal**: 系統能根據玩家棋力(Elo或GOR評級)自動配對勢均力敵的對手,避免實力懸殊的對局

**Independent Test**: 可透過建立不同評級的測試帳號,驗證系統是否配對相近評級的玩家,並測試配對超時、取消等邊界情況

### Tests for User Story 8

- [ ] T144 [P] [US8] Unit test for Elo rating calculation in backend/tests/unit/services/matching/RatingService.test.ts
- [ ] T145 [P] [US8] Unit test for matchmaking algorithm in backend/tests/unit/services/matching/MatchingService.test.ts
- [ ] T146 [P] [US8] Integration test for rating manipulation detection in backend/tests/integration/ratingManipulation.test.ts

### Implementation for User Story 8

- [ ] T147 [P] [US8] Create MatchRequest model interface in backend/src/models/MatchRequest.ts
- [ ] T148 [P] [US8] Create RatingChange model interface in backend/src/models/Player.ts
- [ ] T149 [US8] Implement Elo rating calculation service in backend/src/services/matching/RatingService.ts
- [ ] T150 [US8] Implement MatchingService with rating-based pairing in backend/src/services/matching/MatchingService.ts
- [ ] T151 [US8] Add matchmaking queue with rating range expansion over time in backend/src/services/matching/MatchingService.ts
- [ ] T152 [US8] Implement same-IP detection for rating manipulation prevention in backend/src/services/matching/MatchingService.ts
- [ ] T153 [US8] Create MatchRequestRepository with TTL index in backend/src/db/repositories/MatchRequestRepository.ts
- [ ] T154 [US8] Create POST /api/v1/matching/queue endpoint in backend/src/api/routes/matching.ts
- [ ] T155 [US8] Create DELETE /api/v1/matching/queue endpoint for cancellation in backend/src/api/routes/matching.ts
- [ ] T156 [US8] Implement WebSocket 'match:found' event notification in backend/src/websocket/handlers/matchHandlers.ts
- [ ] T157 [US8] Update player rating after game completion in backend/src/services/game/GameEngine.ts
- [ ] T158 [P] [US8] Create MatchingPage with queue status in frontend/src/pages/MatchingPage.tsx
- [ ] T159 [US8] Add matchmaking status display and cancel button in frontend/src/components/Matching/MatchingStatus.tsx
- [ ] T160 [US8] Implement automatic navigation to game on match found in frontend/src/pages/MatchingPage.tsx

**Checkpoint**: Matchmaking working - players paired by rating within 30s, rating updated after games, manipulation detected

---

## Phase 11: User Story 9 - 後台管理系統 (Priority: P2)

**Goal**: 管理員能夠查看對局記錄、封禁違規玩家、監控異常行為、查看錯誤日誌,並管理排行榜

**Independent Test**: 可透過管理員帳號登入後台,執行封禁、查看日誌、重播棋譜等操作來驗證各項管理功能

### Tests for User Story 9

- [ ] T161 [P] [US9] Integration test for admin player ban workflow in backend/tests/integration/admin/playerBan.test.ts
- [ ] T162 [P] [US9] Integration test for admin game replay in backend/tests/integration/admin/gameReplay.test.ts

### Implementation for User Story 9

- [ ] T163 [P] [US9] Create AdminLog model interface in backend/src/models/AdminLog.ts
- [ ] T164 [US9] Implement AdminService for player management in backend/src/services/admin/AdminService.ts
- [ ] T165 [US9] Implement player ban/unban functionality with connection termination in backend/src/services/admin/AdminService.ts
- [ ] T166 [US9] Implement cheat flag review workflow in backend/src/services/admin/AdminService.ts
- [ ] T167 [US9] Implement leaderboard calculation service in backend/src/services/admin/LeaderboardService.ts
- [ ] T168 [US9] Create AdminLogRepository for system event logging in backend/src/db/repositories/AdminLogRepository.ts
- [ ] T169 [US9] Create GET /api/v1/admin/players/:id endpoint with query history in backend/src/api/routes/admin.ts
- [ ] T170 [US9] Create POST /api/v1/admin/players/:id/ban endpoint in backend/src/api/routes/admin.ts
- [ ] T171 [US9] Create GET /api/v1/admin/games endpoint with filtering in backend/src/api/routes/admin.ts
- [ ] T172 [US9] Create GET /api/v1/admin/cheat-flags endpoint for review queue in backend/src/api/routes/admin.ts
- [ ] T173 [US9] Create GET /api/v1/admin/logs endpoint with filtering in backend/src/api/routes/admin.ts
- [ ] T174 [US9] Create GET /api/v1/admin/leaderboard endpoint in backend/src/api/routes/admin.ts
- [ ] T175 [US9] Create GET /api/v1/admin/matching/queue endpoint for queue monitoring in backend/src/api/routes/admin.ts
- [ ] T176 [P] [US9] Create AdminPage with navigation tabs in frontend/src/pages/AdminPage.tsx
- [ ] T177 [P] [US9] Create PlayerManager component for ban/search in frontend/src/components/Admin/PlayerManager.tsx
- [ ] T178 [P] [US9] Create GameList component with replay functionality in frontend/src/components/Admin/GameList.tsx
- [ ] T179 [P] [US9] Create CheatFlagReview component in frontend/src/components/Admin/CheatFlagReview.tsx
- [ ] T180 [P] [US9] Create LogViewer component with filtering in frontend/src/components/Admin/LogViewer.tsx
- [ ] T181 [P] [US9] Create Leaderboard display component in frontend/src/components/Admin/Leaderboard.tsx

**Checkpoint**: Admin panel functional - ban enforcement immediate, logs searchable, cheat flags reviewable, leaderboard accurate

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: 完善與優化影響多個使用者故事的改進項目

- [ ] T182 [P] Add Traditional Chinese error messages to all validation points across backend
- [ ] T183 [P] Add Traditional Chinese UI text to all frontend components
- [ ] T184 [P] Add Traditional Chinese code comments to all public APIs in backend
- [ ] T185 Setup MongoDB indexes per data-model.md specification in backend/src/db/connection.ts
- [ ] T186 [P] Optimize Zobrist hash performance to ensure <100ms move calculation in backend/src/services/game/ZobristHash.ts
- [ ] T187 [P] Implement Redis caching for active game states in backend/src/services/CacheService.ts
- [ ] T188 Add performance monitoring for critical operations (<100ms move, <1s sync) in backend/src/utils/metrics.ts
- [ ] T189 [P] Add comprehensive API documentation using OpenAPI in backend/docs/api-spec.yaml
- [ ] T190 [P] Create deployment documentation in docs/deployment.md
- [ ] T191 [P] Create user guide in Traditional Chinese in docs/user-guide.md
- [ ] T192 Run full test suite ensuring ≥80% coverage across backend and frontend
- [ ] T193 Security audit for JWT implementation, WebSocket auth, input validation
- [ ] T194 Load testing ensuring 500 concurrent players and 1000 parallel games support
- [ ] T195 Verify quickstart.md instructions work end-to-end
- [ ] T196 Final constitution compliance check against all six principles

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - User Story 1 (基本對局流程) - Can start after Foundational - MVP core
  - User Story 2 (打劫規則) - Can start after Foundational - Extends US1
  - User Story 3 (即時同步) - Can start after Foundational - Extends US1
  - User Story 4 (計時系統) - Can start after US3 (needs WebSocket) - Independent feature
  - User Story 5 (棋譜記錄) - Can start after US1 (needs game data) - Independent feature
  - User Story 6 (防作弊) - Can start after US3 (monitors real-time play) - Independent feature
  - User Story 7 (UI體驗) - Can start after US1 (enhances basic UI) - Independent feature
  - User Story 8 (配對系統) - Can start after US1 (creates games) - Independent feature
  - User Story 9 (後台管理) - Can start after US6 (reviews flags) - Independent feature
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - Core MVP ⭐
- **User Story 2 (P1)**: Foundation only - Critical game rule ⭐
- **User Story 3 (P1)**: Foundation only - Essential for online play ⭐
- **User Story 4 (P2)**: US3 (WebSocket infrastructure)
- **User Story 5 (P2)**: US1 (game data structure)
- **User Story 6 (P2)**: US3 (monitors online play)
- **User Story 7 (P2)**: US1 (basic board UI)
- **User Story 8 (P3)**: US1 (game creation)
- **User Story 9 (P2)**: US6 (cheat flags to review)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Models before services
- Services before endpoints/UI
- Core implementation before integration
- Story complete and tested before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: T004-T005, T006-T007, T010-T011 can run in parallel

**Phase 2 (Foundational)**: T013-T015, T018-T020 can run in parallel

**Phase 3 (US1 Tests)**: T025-T030 can all run in parallel (write together)

**Phase 3 (US1 Models)**: T031-T034 can run in parallel

**Phase 3 (US1 Frontend)**: T045-T048 can run in parallel

**Phase 4-11**: Different user stories can be developed by different team members in parallel once Foundational is complete

**Phase 12 (Polish)**: T182-T184, T189-T191 can run in parallel

---

## Parallel Example: User Story 1 MVP Sprint

```bash
# Day 1: Write all tests together (TDD)
Parallel Launch:
- T025: Contract test for POST /api/v1/games
- T026: Contract test for POST /api/v1/games/:id/moves
- T027: Unit test for stone placement
- T028: Unit test for capture detection
- T029: Unit test for forbidden points
- T030: Integration test for game flow

# Day 2: Create all models together
Parallel Launch:
- T031: Game model
- T032: GameState model
- T033: Move model
- T034: Player model

# Day 3-4: Sequential backend logic (dependencies exist)
- T035: GameRepository (needs models)
- T036: GameEngine (needs repository)
- T037-T040: Game logic features
- T041-T044: API endpoints

# Day 5: Create all frontend components together
Parallel Launch:
- T045: Board component
- T046: Board renderer
- T047: GameInfo component
- T048: CapturedStones component

# Day 6: Integration
- T049-T052: Wire everything together
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only) - Recommended Start

1. Complete Phase 1: Setup (T001-T011)
2. Complete Phase 2: Foundational (T012-T024) ⚠️ CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 基本對局流程 (T025-T052)
4. Complete Phase 4: User Story 2 打劫規則 (T053-T065)
5. Complete Phase 5: User Story 3 即時同步 (T066-T083)
6. **STOP and VALIDATE**: You now have a working online Go game with correct rules!
7. Deploy/demo MVP

### Full Feature Delivery (All 9 User Stories)

After MVP (US1-3), add in priority order:

8. Phase 6: User Story 4 計時系統 (P2)
9. Phase 7: User Story 5 棋譜記錄 (P2)
10. Phase 8: User Story 6 防作弊 (P2)
11. Phase 9: User Story 7 UI體驗 (P2)
12. Phase 11: User Story 9 後台管理 (P2)
13. Phase 10: User Story 8 配對系統 (P3) - Last due to lower priority
14. Phase 12: Polish & optimization

### Parallel Team Strategy

With 3+ developers after Foundational phase complete:

- **Developer A**: User Story 1 (基本對局) - Core game
- **Developer B**: User Story 2 (打劫規則) - Rule engine
- **Developer C**: User Story 3 (即時同步) - WebSocket layer

Then rotate for remaining stories based on expertise.

---

## Success Metrics Tracking

Track these metrics from spec.md Success Criteria:

### Game Correctness
- **SC-001**: Capture detection 100% accuracy (1000 test games)
- **SC-002**: Superko detection 100% accuracy (1000 test games)
- **SC-006**: Move calculation <100ms (19x19, 300 moves)

### Performance
- **SC-005**: 1000 concurrent games, move latency <1s
- **SC-007**: 500 concurrent online players support
- **SC-013**: Board sync latency <1s between clients
- **SC-017**: Timer accuracy ±2s in 10-min game

### User Experience
- **SC-009**: 90% of players complete game without tutorial
- **SC-012**: Stone placement UI response <200ms

### Anti-Cheat
- **SC-020**: 95% detection rate for fast moves (<0.5s)
- **SC-021**: 100% multi-device detection
- **SC-023**: <10% false positive rate for AI detection

---

## Notes

- **[P] tasks** = Different files, no dependencies, can run in parallel
- **[Story] label** = Maps task to specific user story (US1-US9) for traceability
- **TDD Required**: Per Constitution Principle II, write tests FIRST for all core game logic
- **Traditional Chinese**: All errors, UI text, comments must use zh-TW per Constitution V
- **Each user story** should be independently completable and testable
- **Verify tests fail** before implementing (red-green-refactor)
- **Commit frequently** after each task or logical group
- **Stop at checkpoints** to validate story works independently
- **Performance gates**: Ensure <100ms move calc, <1s sync latency throughout

---

## Estimated Timeline

- **Phase 1-2 (Setup + Foundation)**: 1-2 weeks
- **Phase 3-5 (MVP: US1-3)**: 3-4 weeks ⭐ First deployable version
- **Phase 6-9 (Enhanced features: US4-7)**: 4-5 weeks
- **Phase 10-11 (Advanced: US8-9)**: 2-3 weeks
- **Phase 12 (Polish)**: 1-2 weeks

**Total**: 11-16 weeks for full implementation

**MVP Delivery**: 4-6 weeks (US1-3 only)
