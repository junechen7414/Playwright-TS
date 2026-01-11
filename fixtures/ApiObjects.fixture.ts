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

type ApiObject = {
	bookingApiClient: BookingApiClient;
	newBookingPayload: CreateBookingPayload;
	updateBookingPayload: UpdateBookingPayload;
};

export const apiObjectTest = baseTest.extend<ApiObject>({
	bookingApiClient: async ({ request }, use) => {
		const bookingApiClient = new BookingApiClient(request);
		await bookingApiClient.createBooking(newBookingPayload);
		await use(bookingApiClient);
	},
	newBookingPayload: async ({ request: _ }, use) => {
		await use({ ...newBookingPayload });
	},
	updateBookingPayload: async ({ request: _ }, use) => {
		await use({ ...updateBookingPayload });
	},
});
