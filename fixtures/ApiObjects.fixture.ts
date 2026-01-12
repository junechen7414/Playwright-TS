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
	bookingApiWithData: BookingApiClient;
	bookingApiWithDataDeletedAfterward: BookingApiClient;
	newBookingPayload: CreateBookingPayload;
	updateBookingPayload: UpdateBookingPayload;
};

export const bookingApiTest = baseTest.extend<BookingApiFixtures>({
	bookingApi: async ({ request }, use) => {
		const client = new BookingApiClient(request);
		await use(client);
	},
	bookingApiWithData: async ({ bookingApi }, use) => {
		await bookingApi.createBooking(newBookingPayload);
		await use(bookingApi);
	},
	bookingApiWithDataDeletedAfterward: async ({ bookingApi }, use) => {
		const createResponse = await bookingApi.createBooking(newBookingPayload);
		const responseJson = await createResponse.json();
		const bookingId = responseJson.bookingid;

		await use(bookingApi);

		// 測試結束後，刪除已建立的預約資料
		// 這裡假設 BookingApiClient 中存在 deleteBooking 方法，並且它會處理刪除請求所需的身份驗證
		if (bookingId) {
			// 假設 deleteBooking 需要 token 才能驗證，這部分邏輯應封裝在 BookingApiClient 內
			await bookingApi.deleteBooking(bookingId);
		}
	},
	newBookingPayload: async ({ request: _ }, use) => {
		await use({ ...newBookingPayload });
	},
	updateBookingPayload: async ({ request: _ }, use) => {
		await use({ ...updateBookingPayload });
	},
});
