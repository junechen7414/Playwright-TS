import { test as baseTest } from '@playwright/test';
import {
	BookingApiClient,
	type CreateBookingPayload,
	type UpdateBookingPayload,
} from '../services/apis/BookingApiClient';

const newBookingPayload: CreateBookingPayload = {
	firstname: 'Jim',
	lastname: 'Brown',
	totalprice: 111,
	depositpaid: true,
	bookingdates: {
		checkin: '2018-01-01',
		checkout: '2019-01-01',
	},
	additionalneeds: 'Breakfast',
};

const updateBookingPayload: UpdateBookingPayload = {
	firstname: 'James',
	lastname: 'Brown',
	totalprice: 111,
	depositpaid: true,
	bookingdates: {
		checkin: '2018-01-01',
		checkout: '2019-01-01',
	},
	additionalneeds: 'Breakfast',
};

type BookingApiFixtures = {
	bookingApi: BookingApiClient;
	bookingApiWithDataDeletedAfterward: { bookingApi: BookingApiClient; bookingId: number };
	newBookingPayload: CreateBookingPayload;
	updateBookingPayload: UpdateBookingPayload;
};

export const bookingApiTest = baseTest.extend<BookingApiFixtures>({
	bookingApi: async ({ request }, use) => {
		const client = new BookingApiClient(request);
		await use(client);
	},
	bookingApiWithDataDeletedAfterward: async ({ bookingApi }, use) => {
		const createResponse = await bookingApi.createBooking(newBookingPayload);
		if (!createResponse.ok()) {
			throw new Error('Failed to create booking');
		}
		const responseJson = await createResponse.json();
		const bookingId = responseJson.bookingid;

		await use({ bookingApi, bookingId });

		await bookingApi.deleteBooking(bookingId).catch(() => {
			// 忽略已經被測案刪除的情況
			/*靜默處理*/
		});
	},
	newBookingPayload: async ({ request: _ }, use) => {
		await use({ ...newBookingPayload });
	},
	updateBookingPayload: async ({ request: _ }, use) => {
		await use({ ...updateBookingPayload });
	},
});

export { expect } from '@playwright/test';
