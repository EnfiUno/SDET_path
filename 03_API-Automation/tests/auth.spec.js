const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

// Read all credentials from the CSV fixture file
const csvFile = fs.readFileSync(path.join(__dirname, '../fixtures/credentials.csv'));
const allCredentials = parse(csvFile, {
  columns: true,
  skip_empty_lines: true
});

// Split into valid and invalid based on the expected_valid column
const validCredentials = allCredentials.filter(function (row) {
  return row.expected_valid === 'true';
});

const invalidCredentials = allCredentials.filter(function (row) {
  return row.expected_valid === 'false';
});

// Shape we expect in a successful login response
const tokenSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 1 }
  }
};

test.describe('POST /auth — token retrieval', function () {

  // One test per valid credential row in the CSV
  validCredentials.forEach(function (cred) {
    test('@smoke valid login for ' + cred.username + ' should return a token', async function ({ request }) {
      const response = await request.post('/auth', {
        data: {
          username: cred.username,
          password: cred.password
        }
      });

      expect(response.status()).toBe(200);

      const body = await response.json();

      // Validate the response body matches the expected token schema
      const ajv = new Ajv();
      const validate = ajv.compile(tokenSchema);
      const isValid = validate(body);
      expect(isValid, 'Schema errors: ' + JSON.stringify(validate.errors)).toBe(true);
    });
  });

  // One test per invalid credential row in the CSV
  invalidCredentials.forEach(function (cred) {
    test('invalid login for ' + cred.username + ' / ' + cred.password + ' should return Bad credentials', async function ({ request }) {
      const response = await request.post('/auth', {
        data: {
          username: cred.username,
          password: cred.password
        }
      });

      // The API always returns HTTP 200 — invalid logins show an error inside the body
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.reason).toBe('Bad credentials');
    });
  });

});
