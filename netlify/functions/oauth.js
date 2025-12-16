// netlify/functions/oauth.js

// IMPORTANT: Access the variables at the global scope
const client_id = process.env.CMS_CLIENT_ID; // Or GITHUB_CLIENT_ID, based on your final Netlify settings
const client_secret = process.env.CMS_CLIENT_SECRET; // Or GITHUB_CLIENT_SECRET
const fetch = global.fetch; 

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { code, state } = event.queryStringParameters || {};

    // Crucial Check: Ensure the variables are defined
    if (!code || !state || !client_id || !client_secret) {
        console.error('Missing required parameters in OAuth function.');
        return { 
            statusCode: 400, 
            body: 'Missing required parameters for token exchange.' 
        };
    }

    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const params = {
        client_id: client_id,
        client_secret: client_secret,
        code: code,
        state: state
    };

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (data.error) {
            return { statusCode: 401, body: `GitHub error: ${data.error_description || data.error}` };
        }

        const token = data.access_token;

        // Success: Inject the token back into the CMS window
        const successBody = `
            <!doctype html>
            <html><body><script>
                function sendToken() {
                    var data = { token: "${token}", provider: 'github' };
                    window.opener.postMessage(JSON.stringify(data), '*');
                    window.close();
                }
                sendToken();
            </script></body></html>
        `;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' },
            body: successBody
        };

    } catch (error) {
        return { statusCode: 500, body: 'Server Error during token exchange.' };
    }
};