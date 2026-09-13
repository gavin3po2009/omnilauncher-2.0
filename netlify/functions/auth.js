// File: netlify/functions/auth.js
exports.handler = async (event) => {
    // Check your environment variables first, default to "1234" if not set yet
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || '1234'; 
    const path = event.path.replace('/.netlify/functions/auth/', '').replace('/api/auth/', '');
    
    // LOGIN
    if (path === 'login' && event.httpMethod === 'POST') {
        const body = JSON.parse(event.body);
        if (body.password === ADMIN_PASS) {
            return {
                statusCode: 200,
                // Give the browser a secure cookie that lasts for 24 hours
                headers: { 'Set-Cookie': 'omni_admin=true; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400' },
                body: JSON.stringify({ success: true })
            };
        }
        return { statusCode: 401, body: 'Wrong password' };
    }

    // CHECK SESSION
    if (path === 'session' && event.httpMethod === 'GET') {
        const cookies = event.headers.cookie || '';
        const isAdmin = cookies.includes('omni_admin=true');
        return {
            statusCode: 200,
            body: JSON.stringify({ loggedIn: isAdmin, isAdmin })
        };
    }

    // LOGOUT
    if (path === 'logout' && event.httpMethod === 'POST') {
        return {
            statusCode: 200,
            headers: { 'Set-Cookie': 'omni_admin=false; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' },
            body: JSON.stringify({ success: true })
        };
    }

    return { statusCode: 404, body: 'Not found' };
};