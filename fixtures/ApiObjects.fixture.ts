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
	newBookingPayload: async ({ request: _ }, use) => {
		await use({ ...newBookingPayload });
	},
	updateBookingPayload: async ({ request: _ }, use) => {
		await use({ ...updateBookingPayload });
	},
});
