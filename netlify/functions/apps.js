// File: netlify/functions/apps.js
let apps = [
    {
        id: 'welcome-1',
        title: 'Backend Connected!',
        category: 'System',
        icon: 'fa-solid fa-check-circle',
        description: 'If you can see this, your Netlify backend is working perfectly.',
        code: '<h1 style="color:white; font-family:sans-serif; text-align:center; margin-top:50px;">Backend is live! You can now delete this app and add your own.</h1>'
    }
];

exports.handler = async (event) => {
    const method = event.httpMethod;

    // GET: Anyone can view the apps
    if (method === 'GET') {
        return { statusCode: 200, body: JSON.stringify(apps) };
    }

    // Security Check: You must be logged in to Add or Delete apps!
    const cookies = event.headers.cookie || '';
    if (!cookies.includes('omni_admin=true')) {
        return { statusCode: 401, body: 'Unauthorized - Please log in' };
    }

    // POST: Add a new app
    if (method === 'POST') {
        const newApp = JSON.parse(event.body);
        newApp.id = Date.now().toString(); // Generate unique ID
        apps.push(newApp);
        return { statusCode: 200, body: JSON.stringify(newApp) };
    }

    // DELETE: Remove an app
    if (method === 'DELETE') {
        // Extract the ID from the end of the URL (e.g., /api/apps/12345)
        const parts = event.path.split('/');
        const id = parts[parts.length - 1];
        apps = apps.filter(a => a.id !== id);
        return { statusCode: 200, body: 'Deleted successfully' };
    }

    return { statusCode: 400, body: 'Bad Request' };
};