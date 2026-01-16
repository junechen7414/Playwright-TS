import { expect, bookingApiTest as test } from '../../fixtures/ApiObjects.fixture';

test.describe('Booking API Tests', () => {
	test('create a booking', async ({ bookingApi, newBookingPayload }) => {
		const response = await bookingApi.createBooking(newBookingPayload);
		expect(response).toBeOK(); //200~299 status code

		const createdBookingData = await response.json();
		const createdBookingId = createdBookingData.bookingid;
		expect(createdBookingId).toBeGreaterThan(0);

		expect.soft(createdBookingData.booking).toStrictEqual(newBookingPayload);
	});
	test('read a booking', async ({
		bookingApiWithDataDeletedAfterward: { bookingApi, bookingId },
		newBookingPayload,
	}) => {
		const response = await bookingApi.getBookingById(bookingId);
		expect(response).toBeOK();

		const booking = await response.json();
		expect.soft(booking).toStrictEqual(newBookingPayload);
	});
	test('update a booking', async ({
		updateBookingPayload,
		bookingApiWithDataDeletedAfterward: { bookingApi, bookingId }, // 提前解構不使用bookingApi.甚麼.甚麼.的形式
	}) => {
		const response = await bookingApi.updateBooking(bookingId, updateBookingPayload);

		expect(response).toBeOK();
		const updatedBooking = await response.json();
		expect.soft(updatedBooking).toStrictEqual(updateBookingPayload);
	});
	test('delete a booking', async ({
		bookingApiWithDataDeletedAfterward: { bookingApi, bookingId },
	}) => {
		const response = await bookingApi.deleteBooking(bookingId);
		expect(response).toBeOK();

		const getResponse = await bookingApi.getBookingById(bookingId);
		expect(getResponse.status()).toBe(404);
	});
});
