import type { APIRequestContext } from '@playwright/test';
import { ApiRequester } from './base-api-client';

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

export class BookingApiClient {
	private readonly endpoint: string;
	private token: string;
	private readonly requester: ApiRequester;

	constructor(request: APIRequestContext) {
		this.endpoint = '/booking';
		this.token = '';
		this.requester = new ApiRequester(request);
	}

	async getToken() {
		if (this.token) {
			return this.token;
		}
		const response = await this.requester.post('/auth', {
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
		return await this.requester.get(`${this.endpoint}/${id}`);
	}

	/**
	 * Create產品資料
	 */
	async createBooking(payload: CreateBookingPayload) {
		return await this.requester.post(this.endpoint, {
			data: payload,
		});
	}

	/**
	 * Update產品資料
	 */
	async updateBooking(id: number, payload: UpdateBookingPayload) {
		return await this.requester.put(`${this.endpoint}/${id}`, {
			data: payload,
			headers: { Cookie: await this.getToken() },
		});
	}

	/**
	 * Delete產品資料
	 */
	async deleteBooking(id: number) {
		return await this.requester.delete(`${this.endpoint}/${id}`, {
			headers: { Cookie: await this.getToken() },
		});
	}
}
