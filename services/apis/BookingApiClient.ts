import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

export interface CreateBookingPayload {
	firstname: string;
	lastname: string;
	totalprice: number;
	depositpaid: boolean;
	bookingdates: {
		checkin: string;
		checkout: string;
	};
	additionalneeds?: string;
}

export interface CreateBookingResponse {
	id: number;
	booking: CreateBookingPayload;
}

export interface UpdateBookingPayload {
	firstname?: string;
	lastname?: string;
	totalprice?: number;
	depositpaid?: boolean;
	bookingdates?: {
		checkin?: string;
		checkout?: string;
	};
	additionalneeds?: string;
}

export interface UpdateBookingResponse {
	id: number;
	booking: CreateBookingPayload;
}

export class BookingApiClient extends BaseApiClient {
	private readonly endpoint: string;
	private token: string;

	constructor(request: APIRequestContext) {
		super(request);
		this.endpoint = '/booking';
		this.token = '';
	}

	async getToken() {
		if (this.token) {
			return this.token;
		}
		const response = await this.post('/auth', {
			data: {
				username: 'admin',
				password: 'password123',
			},
		});
		const token = (await response.json()).token;
		this.token = `token=${token}`;
		return this.token;
	}

	/**
	 * Read產品資料
	 */
	async getBookingById(id: number) {
		return await this.get(`${this.endpoint}/${id}`);
	}

	/**
	 * Create產品資料
	 */
	async createBooking(payload: CreateBookingPayload) {
		return await this.post(this.endpoint, {
			data: payload,
		});
	}

	/**
	 * Update產品資料
	 */
	async updateBooking(id: number, payload: UpdateBookingPayload) {
		return await this.put(`${this.endpoint}/${id}`, {
			data: payload,
			headers: { Cookie: await this.getToken() },
		});
	}

	/**
	 * Delete產品資料
	 */
	async deleteBooking(id: number) {
		return await this.delete(`${this.endpoint}/${id}`, {
			headers: { Cookie: await this.getToken() },
		});
	}
}
