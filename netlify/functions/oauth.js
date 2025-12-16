// netlify/functions/auth.js

// 1. Define variables at the global scope to ensure Netlify loads them
const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;
const fetch = global.fetch; // Use the native fetch API available in Node 20

exports.handler = async (event, context) => {
    
    // Check if the request method is not GET (we only expect GET from the redirect)
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 2. Get the parameters from the URL query string
    const { code, state } = event.queryStringParameters || {};

    // 3. CRITICAL CHECK: If any parameter is missing, return error
    if (!code || !state || !client_id || !client_secret) {
        console.error('Missing parameters:', { 
            code: !!code, 
            state: !!state, 
            client_id: !!client_id, 
            client_secret: !!client_secret 
        });
        return { 
            statusCode: 400, 
            body: 'Missing required parameters. Check Netlify logs for details.' 
        };
    }

    // 4. Exchange the temporary code for an access token
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
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (data.error) {
            console.error('GitHub Token Exchange Error:', data.error_description || data.error);
            return {
                statusCode: 401,
                body: `GitHub error: ${data.error_description || data.error}`
            };
        }

        const token = data.access_token;

        // 5. Success! Inject the token into the Netlify CMS auth response
        const successBody = `
            <!doctype html>
            <html>
            <body>
            <script>
                // This script sends the token back to the main CMS window via postMessage
                function sendToken() {
                    var token = "${token}";
                    var data = { token: token, provider: 'github' };
                    
                    // The targetOrigin needs to be the domain of the parent window (your CMS)
                    // We use '*' here for simplicity in Netlify functions, but a specific origin is more secure
                    window.opener.postMessage(JSON.stringify(data), '*');
                    window.close();
                }
                sendToken();
            </script>
            </body>
            </html>
        `;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            },
            body: successBody
        };
        
    } catch (error) {
        console.error('Token exchange failed:', error);
        return { statusCode: 500, body: 'Server Error during token exchange.' };
    }
};