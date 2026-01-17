import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

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

export class ProductApiClient extends BaseApiClient {
	private readonly endpoint: string;

	constructor(request: APIRequestContext) {
		super(request);
		this.endpoint = '/api/v1/products';
	}

	/**
	 * Read產品資料
	 */
	async readProduct(id: number) {
		return await this.get(`${this.endpoint}/${id}`);
	}

	/**
	 * Create產品資料
	 */
	async createProduct(payload: CreateProductPayload) {
		return await this.post(this.endpoint, {
			data: payload,
		});
	}

	/**
	 * Update產品資料
	 */
	async updateProduct(id: number, payload: UpdateProductPayload) {
		return await this.put(`${this.endpoint}/${id}`, {
			data: payload,
		});
	}

	/**
	 * Delete產品資料
	 */
	async deleteProduct(id: number) {
		return await this.delete(`${this.endpoint}/${id}`);
	}
}
