// The function is exposed at /netlify/functions/auth
exports.handler = async (event, context) => {
    // 1. Get the code from the request query string
    const code = event.queryStringParameters.code;

    // 2. Define the security credentials from Netlify Environment Variables
    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    if (!code || !client_id || !client_secret) {
        return { statusCode: 400, body: 'Missing required parameters.' };
    }

    try {
        // 3. Exchange the code for an access token via GitHub's API
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code,
            }),
        });

        const data = await response.json();
        const accessToken = data.access_token;

        if (!accessToken) {
            console.error('GitHub token exchange failed:', data);
            return { statusCode: 500, body: 'Authentication failed.' };
        }
        
        // 4. Send the token back to Sveltia CMS (The key step)
        // Sveltia expects a specific response structure or relies on a small HTML
        // page that uses JavaScript to pass the token back to the CMS window.
        
        // The common Decap/Sveltia method is to use a simple HTML page 
        // that closes the pop-up and passes the token.
        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <script>
                    (function() {
                        if (window.opener) {
                            window.opener.postMessage({
                                'access_token': '${accessToken}',
                                'provider': 'github'
                            }, '*');
                            window.close();
                        } else {
                            // Fallback for non-popup flows
                            document.body.innerHTML = 'Authentication successful! You can close this window.';
                        }
                    })();
                </script>
            </head>
            <body></body>
            </html>
        `;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            body: htmlBody,
        };

    } catch (error) {
        return { statusCode: 500, body: `Server error: ${error.message}` };
    }
};