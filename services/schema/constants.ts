/**
 * 帳戶狀態
 */
export enum AccountStatus {
	/** 啟用 */
	Active = 'Y',
	/** 停用 */
	Inactive = 'N',
}

/**
 * 商品銷售狀態
 */
export enum ProductSaleStatus {
	/** 可銷售 */
	Available = 1001,
	/** 停售 */
	Inactive = 1002,
}

/**
 * 訂單狀態
 */
export enum OrderStatus {
	/** 待處理 */
	Pending = 1001,
	/** 已完成 */
	Completed = 1002,
	/** 已取消 */
	Cancelled = 1003,
}
