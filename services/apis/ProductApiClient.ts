import type { APIRequestContext } from '@playwright/test';

export interface CreateProductPayload {
	title: string;
	price: number;
	description: string;
	categoryId: number;
	images: string[];
}

export interface UpdateProductPayload {
	title?: string;
	price?: number;
	description?: string;
}

export class ProductApiClient {
	private readonly endpoint: string;

	constructor(private readonly request: APIRequestContext) {
		this.endpoint = '/api/v1/products';
	}

	/**
	 * Read產品資料
	 */
	async readProduct(id: number) {
		const response = await this.request.get(`${this.endpoint}/${id}`);
		return response;
	}

	/**
	 * Create產品資料
	 */
	async createProduct(payload: CreateProductPayload) {
		const response = await this.request.post(this.endpoint, {
			data: payload,
		});
		return response;
	}
	/**
	 * Update產品資料
	 */
	async updateProduct(id: number, payload: UpdateProductPayload) {
		const response = await this.request.put(`${this.endpoint}/${id}`, {
			data: payload,
		});
		return response;
	}
	/**
	 * Delete產品資料
	 */
	async deleteProduct(id: number) {
		const response = await this.request.delete(`${this.endpoint}/${id}`);
		return response;
	}
}
