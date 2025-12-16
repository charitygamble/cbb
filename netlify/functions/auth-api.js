// netlify/functions/auth-api.js

exports.handler = async (event, context) => {
  // Return a status 200 with a simple message to satisfy the CMS's initial GET request check
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'ok',
        message: 'Simulated API endpoint is available.'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    };
  }
  return { statusCode: 405, body: 'Method Not Allowed' };
};