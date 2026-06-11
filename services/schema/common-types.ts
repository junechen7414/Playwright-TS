/**
 * 通用型別定義
 * 此檔案包含手動維護的型別，不會被自動生成工具覆蓋
 */

/**
 * 分頁回應的通用型別
 * @template T - 分頁內容的型別
 */
export interface PageResponse<T> {
	/** 分頁內容陣列 */
	content: T[];
	/** 當前頁碼（從 0 開始） */
	page: number;
	/** 每頁大小 */
	size: number;
	/** 總元素數量 */
	totalElements: number;
	/** 總頁數 */
	totalPages: number;
}

/**
 * 分頁查詢參數
 */
export interface PaginationParams {
	/** 頁碼（從 0 開始） */
	page?: number;
	/** 每頁大小 */
	size?: number;
	/** 排序欄位和方向（例如：'name,asc'） */
	sort?: string;
}
