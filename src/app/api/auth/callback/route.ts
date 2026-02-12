import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        const params = new URLSearchParams();
        const clientId = process.env.SECONDME_CLIENT_ID || '';
        const clientSecret = process.env.SECONDME_CLIENT_SECRET || '';
        // Use the incoming host to reconstruct the redirect_uri to match exactly what we sent
        const origin = new URL(req.url).origin;
        const redirectUri = process.env.SECONDME_REDIRECT_URI || `${origin}/api/auth/callback`;

        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirectUri);

        console.log('Sending Token Request to SecondMe:', {
            url: 'https://app.mindos.com/gate/lab/api/oauth/token/code',
            client_id: clientId,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code_prefix: code.substring(0, 10) + '...'
        });

        const response = await axios.post('https://app.mindos.com/gate/lab/api/oauth/token/code', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Token Response Payload:', JSON.stringify(response.data, null, 2));

        const accessToken = response.data.data?.accessToken || response.data.accessToken || response.data.data?.access_token || response.data.access_token;

        if (!accessToken) {
            console.error('Access token missing in:', response.data);
            throw new Error('Access token not found in response');
        }

        // In a real app, we'd set a cookie or session here.
        // For this prototype, we'll redirect back to the home page with the token.
        // WARNING: This is not secure for production but works for a hackathon demo.
        const redirectUrl = new URL('/', req.url);
        redirectUrl.searchParams.set('token', accessToken);

        return NextResponse.redirect(redirectUrl);
    } catch (error: any) {
        console.error('OAuth Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
