import { expect } from '@playwright/test';
import { bookingApiTest as test } from '../../fixtures/ApiObjects.fixture';
import type { UpdateBookingPayload } from '../../services/apis/BookingApiClient';

test.describe('Booking API Tests', () => {
	test('create a booking', async ({ bookingApi, newBookingPayload }) => {
		const response = await bookingApi.createBooking(newBookingPayload);
		expect(response).toBeOK(); //200~299 status code

		const createdBookingData = await response.json();
		const createdBookingId = createdBookingData.bookingid;
		expect(createdBookingId).toBeGreaterThan(0);
		expect.soft(createdBookingData.booking).toStrictEqual(newBookingPayload);
	});
	test('should perform full CRUD lifecycle for a booking', async ({
		bookingApi,
		newBookingPayload,
		updateBookingPayload,
	}) => {
		let createdBookingId: number;

		// 1. Create
		await test.step('Create Booking', async () => {
			console.log('Creating booking with payload:', newBookingPayload);
			const response = await bookingApi.createBooking(newBookingPayload);
			console.log('Response Body:', await response.text());
			expect(response.status()).toBe(200);

			const data = await response.json();
			createdBookingId = data.bookingid;
			expect(createdBookingId).toBeDefined();
			expect.soft(data.booking).toStrictEqual(newBookingPayload);
		});

		// 2. Read
		await test.step('Read Booking', async () => {
			const response = await bookingApi.getBookingByFirstName(newBookingPayload.firstname);
			expect(response.status()).toBe(200);

			const booking = await response.json();
			interface BookingItem {
				bookingid: number;
			}
			const idSet = new Set(booking.map((item: BookingItem) => item.bookingid));

			expect.soft(idSet).toContain(createdBookingId);
		});

		// 3. Update
		await test.step('Update Booking', async () => {
			const updatePayload: UpdateBookingPayload = updateBookingPayload;
			const response = await bookingApi.updateBooking(createdBookingId, updatePayload);
			expect(response.status()).toBe(200);
			const data = await response.json();
			expect.soft(data).toStrictEqual(updatePayload);
		});

		// 4. Read after Update
		await test.step('Read Booking after Update', async () => {
			const response = await bookingApi.getBookingByFirstName(newBookingPayload.firstname);
			expect(response.status()).toBe(200);

			const booking = await response.json();
			interface BookingItem {
				bookingid: number;
			}
			const idSet = new Set(booking.map((item: BookingItem) => item.bookingid));

			expect.soft(idSet).not.toContain(createdBookingId);
		});

		// 5. Delete
		await test.step('Delete Booking', async () => {
			const response = await bookingApi.deleteBooking(createdBookingId);
			expect(response.status()).toBe(201);

			const getResponse = await bookingApi.getBookingById(createdBookingId);
			expect.soft(getResponse.status()).toBe(404);
		});
	});
});
