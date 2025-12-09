/**
 * SuperKo Checker using Set-based history tracking
 * 超級打劫檢查器 - 使用 Set 實現 O(1) 查詢
 */
export class SuperKoChecker {
  private boardHistory: Set<string>;

  constructor() {
    this.boardHistory = new Set();
  }

  /**
   * 新增盤面到歷史記錄
   */
  addPosition(hash: string): void {
    this.boardHistory.add(hash);
  }

  /**
   * 檢查盤面是否重複（超級打劫）
   * Time Complexity: O(1)
   */
  isRepeated(hash: string): boolean {
    return this.boardHistory.has(hash);
  }

  /**
   * 取得歷史記錄大小
   */
  getHistorySize(): number {
    return this.boardHistory.size;
  }

  /**
   * 清除歷史記錄
   */
  clear(): void {
    this.boardHistory.clear();
  }

  /**
   * 從陣列初始化歷史記錄
   */
  initializeFromHistory(hashes: string[]): void {
    this.clear();
    hashes.forEach(hash => this.addPosition(hash));
  }
}
