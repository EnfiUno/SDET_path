const { defineConfig } = require('@playwright/test');

// Playwright loads .env automatically — no extra setup needed
module.exports = defineConfig({
  testDir: './tests',

  // Generate an HTML report to browse locally and a JUnit XML file for CI
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  use: {
    // Base URL is read from the .env file — see .env.example for the variable names
    baseURL: process.env.API_URL || 'https://restful-booker.herokuapp.com',

    // Every request sends these headers by default
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
});
