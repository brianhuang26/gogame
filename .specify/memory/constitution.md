<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.1.0 → 1.2.0
Date: 2025-12-09

MINOR version bump rationale: Enhanced Language & Documentation Standards
(Principle V) to explicitly mandate Traditional Chinese (zh-TW) for
requirements.md and spec.md files. Added explicit file-level requirements to
eliminate ambiguity in documentation language standards.

Modified Principles:
  5. Language & Documentation Standards → Enhanced with explicit requirements.md
     and spec.md language mandate (Traditional Chinese zh-TW only)

Added Sections:
  - Explicit file-level language requirements for requirements.md and spec.md
  - Clarification that these core specification files MUST use Traditional Chinese
  - Added requirement that all files under `.specify/specs/` must use Traditional Chinese

Templates Status:
  ✅ plan-template.md - Added language requirement notice at top
  ✅ spec-template.md - Added language requirement notice at top
  ✅ tasks-template.md - Added language requirement notice at top
  ✅ checklist-template.md - Added language requirement notice at top
  ✅ agent-file-template.md - Added language requirement notice at top

Follow-up Actions:
  - None required; all templates updated with language requirement notices
  - All templates now prominently display Traditional Chinese requirement
================================================================================
-->

# GoGame 專案憲章

## 核心原則

### I. 程式碼品質標準

**所有程式碼必須符合以下不可妥協的品質要求：**

- 程式碼必須具備自我說明性，使用清晰的命名（變數、函數、型別使用英文）
- 公開 API 必須包含文件註解，說明目的、參數和返回值（註解使用正體中文）
- 函數必須專注於單一職責；複雜函數必須分解
- 超過 3 行的重複程式碼必須提取為可重用函數
- 死代碼和註解掉的程式碼必須在提交前移除
- Linting 違規必須解決；警告不得無理由忽略
- 變數和函數命名必須使用英文，遵循駝峰式命名（camelCase）或帕斯卡命名（PascalCase）
- 所有註解必須使用正體中文撰寫，清楚說明程式邏輯和意圖

**理由**：高品質程式碼減少 bug、加快團隊成員上手速度、並支援自信的重構。
技術債會複利累積；在進入時預防比事後修復更經濟。

### II. 測試標準（不可妥協）

**所有功能必須遵守測試紀律：**

- 測試驅動開發（TDD）：先寫測試 → 驗證失敗 → 實作 → 測試通過
- 所有使用者故事必須有驗收測試，驗證完整的使用者旅程
- 所有公開 API 必須有契約測試，驗證輸入/輸出行為
- 關鍵路徑必須有整合測試，涵蓋元件互動
- 新程式碼的單元測試覆蓋率必須 ≥80%；缺口必須在 PR 描述中說明理由
- 測試必須具備確定性（不容許不穩定測試）
- 測試名稱必須描述測試內容和預期結果（可使用正體中文）

**理由**：測試是可執行的規格。先寫測試能釐清需求、預防缺陷、支援重構、
並作為活文件。不穩定的測試會侵蝕信任並浪費開發時間。

### III. 使用者體驗一致性

**所有面向使用者的功能必須提供一致、可預測的體驗：**

- 錯誤訊息必須具備可操作性（說明發生什麼、為什麼、該怎麼做）並使用正體中文
- 命令列介面必須遵循一致模式（旗標、輸出格式、退出代碼）
- 使用者流程必須可從使用者視角進行端對端測試
- 對使用者 API 的破壞性變更必須版本化並記錄
- 行為變更時必須更新說明文字和文件
- 互動功能必須為長時間運行的操作提供回饋（使用正體中文）
- 輸入驗證必須儘早進行，並提供清晰的錯誤訊息（使用正體中文）
- 所有使用者介面文字必須使用正體中文

**理由**：一致的 UX 降低認知負擔、培訓時間和支援負擔。
使用者建立心智模型；不一致會打破這些模型並侵蝕信任。

### IV. 效能要求

**效能必須設計進去，而非事後補強：**

- 在實作前必須在規格中定義效能目標（延遲、吞吐量、記憶體）
- 非瑣碎操作的演算法必須記錄時間/空間複雜度
- 關鍵路徑必須測量資源使用（記憶體、CPU、I/O）
- 效能退化必須在測試中捕捉；基準測試必須自動化
- 優化必須以分析數據為依據；禁止過早優化
- 擴展性考量必須在設計階段解決（O(n) vs O(n²)、快取、批次處理）

**理由**：晚期發現的效能問題修復成本高昂。在設計期間理解效能特性
可預防架構錯誤。先測量，再優化；猜測會導致浪費精力。

### V. 語言與文件標準

**專案必須遵守以下語言使用規範：**

- 所有專案文件（README、規格、計畫）必須使用正體中文（zh-TW）撰寫
- **requirements.md 和 spec.md 必須使用正體中文（zh-TW）編寫** — 這是不可妥協的要求
- 程式碼中的變數、函數、類別命名必須使用英文
- 所有程式碼註解必須使用正體中文
- 錯誤訊息和使用者介面文字必須使用正體中文
- API 文件和技術規格必須使用正體中文說明
- Git commit 訊息可使用正體中文或英文，但需保持一致性
- 程式碼內的常數字串（如設定鍵、日誌訊息）優先使用英文，使用者可見字串使用正體中文
- 所有 `.specify/specs/` 目錄下的文件必須使用正體中文

**理由**：統一的語言標準確保團隊協作效率，正體中文文件降低本地團隊溝通成本，
英文命名符合國際程式設計慣例並確保程式碼可維護性。明確要求 requirements.md 和
spec.md 使用正體中文可消除歧義，確保核心規格文件的一致性和可讀性。

### VI. JavaScript ES6+ 技術標準

**所有 JavaScript 程式碼必須遵循現代最佳實踐：**

- 必須使用 ES6+ 語法：const/let（禁用 var）、箭頭函數、解構、模板字串
- 優先使用 async/await 處理非同步操作，避免回呼地獄
- 使用模組化：ES6 modules（import/export）組織程式碼
- 必須使用嚴格模式（'use strict'）或現代工具鏈預設啟用
- 陣列操作優先使用 map、filter、reduce 等函數式方法
- 使用展開運算子（spread operator）和其餘參數（rest parameters）
- 必須避免全域變數污染；使用模組作用域或 IIFE
- 物件屬性使用簡寫語法和計算屬性名稱
- 使用 Promise 和適當的錯誤處理（try/catch、.catch()）
- 遵循 Airbnb 或 Standard.js 風格指南（需在專案中明確選擇）
- 使用 ESLint 強制執行程式碼風格和最佳實踐
- 考慮使用 TypeScript 以獲得型別安全（建議但非強制）

**理由**：現代 JavaScript 語法提供更好的可讀性、更少的錯誤和更強的表達能力。
統一的技術標準確保程式碼庫一致性，降低維護成本和認知負擔。

## 品質門檻

**所有變更在合併前必須通過以下門檻：**

1. **自動化檢查**：
   - 所有測試通過（單元、整合、契約）
   - Linting 通過，無違規
   - 程式碼覆蓋率達到最低門檻（≥80%）
   - 效能基準測試未顯示顯著退化
   - ESLint 檢查通過，符合專案風格指南

2. **程式碼審查要求**：
   - 至少一位程式碼擁有者批准
   - 所有審查意見已解決或明確延後並說明理由
   - 新功能的測試覆蓋率已驗證
   - 關鍵路徑變更的效能影響已評估
   - 確認遵循 JavaScript ES6+ 最佳實踐

3. **文件要求**：
   - 公開 API 變更反映在文件中（使用正體中文）
   - 破壞性變更記錄在變更日誌/遷移指南中（使用正體中文）
   - 複雜演算法以註解說明（使用正體中文）
   - 使用者可見變更反映在說明文字中（使用正體中文）
   - README 和技術規格保持更新

## 開發工作流程

**標準開發流程：**

1. **規劃**：在 `.specify/specs/[###-feature]/spec.md` 撰寫功能規格，包含使用者故事和驗收標準（使用正體中文）
2. **設計**：建立實作計畫，包含架構決策、實體模型和契約定義（使用正體中文說明）
3. **TDD 循環**：對每個任務：
   - 撰寫需求測試（測試失敗）
   - 實作最少程式碼以通過測試
   - 重構並保持測試綠燈
   - 提交並附上描述性訊息
4. **審查**：提交 PR 並附上連結到規格的描述；處理審查回饋
5. **驗證**：驗證所有品質門檻通過；端對端測試使用者旅程
6. **合併**：Squash-merge 到 main 分支，附上乾淨的提交訊息

**Commit 訊息格式**：`<type>: <description>`，其中 type 為 feat|fix|docs|test|refactor|perf|chore
（描述可使用正體中文或英文）

**JavaScript 專案結構標準**：
- 使用 `src/` 存放原始碼
- 使用 `tests/` 存放測試（contract/、integration/、unit/）
- 使用 `docs/` 存放文件（正體中文）
- package.json 必須定義明確的 scripts（build、test、lint）
- 使用 .eslintrc 設定 ESLint 規則
- 使用 .prettierrc 設定程式碼格式化（若採用）

## 治理

**本憲章優先於所有其他開發實踐和指南。**

**修訂流程**：
- 修訂必須以書面形式提出並附上理由
- 對原則的破壞性變更需要 MAJOR 版本號升級
- 新增原則或擴展指導需要 MINOR 版本號升級
- 釐清和錯字修正需要 PATCH 版本號升級
- 修訂必須經專案利害關係人審查後批准

**合規性**：
- 所有拉取請求必須驗證與憲章原則的一致性
- 憲章違規必須在程式碼審查中指出
- 複雜性或偏差必須證明合理並記錄
- 使用 `.specify/` 框架和斜槓命令進行開發指導
- 憲章合規性在回顧會議中審查
- 技術決策必須參照相關憲章原則
- JavaScript ES6+ 最佳實踐必須在審查中驗證

**版本**：1.2.0 | **批准日期**：2025-12-09 | **最後修訂**：2025-12-09
