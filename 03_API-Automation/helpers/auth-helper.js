// This helper retrieves an auth token from the API using credentials
// stored in environment variables.
// How to use: call getToken(request) inside a test.beforeAll() so the
// token is fetched once and reused for all tests in that file.

async function getToken(request) {
  const response = await request.post('/auth', {
    data: {
      username: process.env.BOOKER_USERNAME || 'admin',
      password: process.env.BOOKER_PASSWORD || 'password123'
    }
  });

  const body = await response.json();
  return body.token;
}

module.exports = { getToken };
