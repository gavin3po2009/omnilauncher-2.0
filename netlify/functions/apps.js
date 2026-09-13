// File: netlify/functions/apps.js

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Helper to make requests to Supabase
async function supabaseRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase error: ${errText}`);
    }
    
    // Some responses (like DELETE) might be empty
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

exports.handler = async (event) => {
    const method = event.httpMethod;

    try {
        // GET: Anyone can view the apps from Supabase
        if (method === 'GET') {
            const apps = await supabaseRequest('apps?select=*&order=created_at.desc');
            return { statusCode: 200, body: JSON.stringify(apps) };
        }

        // Security Check: Must be logged in to Add or Delete apps!
        const cookies = event.headers.cookie || '';
        if (!cookies.includes('omni_admin=true')) {
            return { statusCode: 401, body: 'Unauthorized - Please log in' };
        }

        // POST: Add a new app to Supabase
        if (method === 'POST') {
            const data = JSON.parse(event.body);
            const newApp = {
                id: Date.now().toString(),
                title: data.title,
                category: data.category,
                icon: data.icon,
                description: data.description,
                code: data.code
            };

            await supabaseRequest('apps', 'POST', newApp);
            return { statusCode: 200, body: JSON.stringify(newApp) };
        }

        // DELETE: Remove an app from Supabase
        if (method === 'DELETE') {
            const parts = event.path.split('/');
            const id = parts[parts.length - 1];
            
            await supabaseRequest(`apps?id=eq.${id}`, 'DELETE');
            return { statusCode: 200, body: 'Deleted successfully' };
        }

        return { statusCode: 400, body: 'Bad Request' };

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
