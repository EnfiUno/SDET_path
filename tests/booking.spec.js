const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');
const { getToken } = require('../helpers/auth-helper');

// Load all booking test data from the JSON fixture file
const bookings = require('../fixtures/bookings.json');

// Schema for a single booking object returned by the API
const bookingSchema = {
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  properties: {
    firstname: { type: 'string' },
    lastname: { type: 'string' },
    totalprice: { type: 'number' },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      required: ['checkin', 'checkout'],
      properties: {
        checkin: { type: 'string' },
        checkout: { type: 'string' }
      }
    },
    additionalneeds: { type: 'string' }
  }
};

// Schema for the response when creating a new booking (adds a bookingid field)
const createBookingSchema = {
  type: 'object',
  required: ['bookingid', 'booking'],
  properties: {
    bookingid: { type: 'integer' },
    booking: bookingSchema
  }
};

// Get the auth token once before all tests in this file run
let authToken;

test.beforeAll(async ({ request }) => {
  authToken = await getToken(request);
});

// Run two tests for each entry in bookings.json
bookings.forEach(function (booking) {

  test('@smoke POST /booking - create booking for ' + booking.firstname + ' ' + booking.lastname + ' should match schema', async function ({ request }) {
    const response = await request.post('/booking', {
      data: booking
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validate the create response against the schema
    const ajv = new Ajv();
    const validate = ajv.compile(createBookingSchema);
    const isValid = validate(body);
    expect(isValid, 'Schema errors: ' + JSON.stringify(validate.errors)).toBe(true);
  });

  test('CRUD lifecycle for ' + booking.firstname + ' ' + booking.lastname + ': create → read → update → delete', async function ({ request }) {
    // Step 1: Create a new booking
    const createResponse = await request.post('/booking', {
      data: booking
    });
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;

    // Step 2: Read the booking back and validate the schema
    const getResponse = await request.get('/booking/' + bookingId);
    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();
    const ajv = new Ajv();
    const validate = ajv.compile(bookingSchema);
    const isValid = validate(getBody);
    expect(isValid, 'Schema errors: ' + JSON.stringify(validate.errors)).toBe(true);
    expect(getBody.firstname).toBe(booking.firstname);
    expect(getBody.lastname).toBe(booking.lastname);

    // Step 3: Update the booking price — auth token is required in the Cookie header
    const updatedBooking = Object.assign({}, booking, { totalprice: booking.totalprice + 50 });
    const putResponse = await request.put('/booking/' + bookingId, {
      data: updatedBooking,
      headers: {
        Cookie: 'token=' + authToken
      }
    });
    expect(putResponse.status()).toBe(200);
    const putBody = await putResponse.json();
    expect(putBody.totalprice).toBe(updatedBooking.totalprice);

    // Step 4: Delete the booking
    const deleteResponse = await request.delete('/booking/' + bookingId, {
      headers: {
        Cookie: 'token=' + authToken
      }
    });
    expect(deleteResponse.status()).toBe(201);
  });

});
