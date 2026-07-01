const { test, expect } = require('@playwright/test');

// Smoke test: quickly checks the API is alive before running the full suite
test('@smoke GET /ping - API health check should return 201', async ({ request }) => {
  const response = await request.get('/ping');

  expect(response.status()).toBe(201);
});
