// Native fetch is used (Node 18+)

const API_URL = 'https://vibestudy.ru/api/admin/clear-cache';
const SECRET = process.env.ADMIN_SECRET || 'vibestudy-admin-secret';

async function clearCache(day, languageId) {
    console.log(`Clearing cache for Day ${day} (${languageId}) on ${API_URL}...`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ day, languageId, secret: SECRET })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('✅ Success:', data.message);
        } else {
            console.error('❌ Error:', data.error);
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

// Clear Day 1 for Python (default)
clearCache(1, 'python');
