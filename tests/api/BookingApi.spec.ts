import { expect, test } from '@playwright/test';
import {
	BookingApiClient,
	type CreateBookingPayload,
	type UpdateBookingPayload,
} from '../../services/apis/BookingApiClient';

test.describe('Booking API Tests', () => {
	test('should perform full CRUD lifecycle for a booking', async ({ request }) => {
		const apiClient = new BookingApiClient(request);

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

		let createdBookingId: number;

		// 1. Create
		await test.step('Create Booking', async () => {
			console.log('Creating booking with payload:', newBookingPayload);
			const response = await apiClient.createBooking(newBookingPayload);
			console.log('Response Body:', await response.text());
			expect(response.status()).toBe(200);

			const data = await response.json();
			createdBookingId = data.bookingid;
			expect(createdBookingId).toBeDefined();
			expect.soft(data.booking).toStrictEqual(newBookingPayload);
		});

		// 2. Read
		await test.step('Read Booking', async () => {
			const response = await apiClient.getBookingByFirstName(newBookingPayload.firstname);
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
			const response = await apiClient.updateBooking(createdBookingId, updatePayload);
			expect(response.status()).toBe(200);
			const data = await response.json();
			expect.soft(data).toStrictEqual(updatePayload);
		});

		// 4. Read after Update
		await test.step('Read Booking after Update', async () => {
			const response = await apiClient.getBookingByFirstName(newBookingPayload.firstname);
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
			const response = await apiClient.deleteBooking(createdBookingId);
			expect(response.status()).toBe(201); // Platzi delete 通常回傳 true 或被刪除的物件

			const getResponse = await apiClient.getBookingById(createdBookingId);
			expect.soft(getResponse.status()).toBe(404);
		});
	});
});
