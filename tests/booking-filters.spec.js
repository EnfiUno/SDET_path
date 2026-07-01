const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');

// Load booking data used to seed filter tests
const bookings = require('../fixtures/bookings.json');

// Schema to validate the list of booking IDs returned by GET /booking
const bookingIdsSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['bookingid'],
    properties: {
      bookingid: { type: 'integer' }
    }
  }
};

test.describe('GET /booking — list and filter', function () {

  test('@smoke GET /booking - should return all bookings as a valid array', async function ({ request }) {
    const response = await request.get('/booking');

    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validate the response is an array of booking ID objects
    const ajv = new Ajv();
    const validate = ajv.compile(bookingIdsSchema);
    const isValid = validate(body);
    expect(isValid, 'Schema errors: ' + JSON.stringify(validate.errors)).toBe(true);

    // There should be at least one booking already in the system
    expect(body.length).toBeGreaterThan(0);
  });

  // One filter test per entry in bookings.json
  bookings.forEach(function (booking) {

    test('GET /booking - filter by ' + booking.firstname + ' ' + booking.lastname + ' should return at least one result', async function ({ request }) {
      // Create a booking first so the filter always has something to find
      const createResponse = await request.post('/booking', { data: booking });
      expect(createResponse.status()).toBe(200);

      // Now filter by first and last name
      const response = await request.get('/booking', {
        params: {
          firstname: booking.firstname,
          lastname: booking.lastname
        }
      });

      expect(response.status()).toBe(200);

      const body = await response.json();

      // Validate the filtered results also follow the schema
      const ajv = new Ajv();
      const validate = ajv.compile(bookingIdsSchema);
      const isValid = validate(body);
      expect(isValid, 'Schema errors: ' + JSON.stringify(validate.errors)).toBe(true);

      // We should find at least the booking we just created
      expect(body.length).toBeGreaterThan(0);
    });

  });

});
