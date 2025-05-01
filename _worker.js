import { Hono } from 'hono';
import { cors } from 'hono/cors';
import ExtensionsAPI from './extensions/extensions.js';

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Root endpoint
app.get('/', (c) => {
    return c.json({
        status: 'success',
        message: 'Welcome to Aemo Developer API',
        endpoints: {
            allExtensions: '/api/extensions',
            filterExtensions: '/api/extensions/filter/:type',
            getExtensionById: '/api/extensions/:id'
        }
    });
});

// Get all extensions
app.get('/api/extensions', (c) => {
    try {
        const extensions = ExtensionsAPI.getAllExtensions();
        return c.json({
            status: 'success',
            data: extensions
        });
    } catch (error) {
        return c.json({
            status: 'error',
            message: 'Failed to fetch extensions'
        }, 500);
    }
});

// Get extensions by filter
app.get('/api/extensions/filter/:type', (c) => {
    try {
        const filter = c.req.param('type');
        const extensions = ExtensionsAPI.getExtensionsByFilter(filter);
        return c.json({
            status: 'success',
            data: extensions
        });
    } catch (error) {
        return c.json({
            status: 'error',
            message: 'Failed to fetch extensions'
        }, 500);
    }
});

// Get extension by ID
app.get('/api/extensions/:id', (c) => {
    try {
        const id = c.req.param('id');
        const extension = ExtensionsAPI.getExtensionById(id);
        if (!extension) {
            return c.json({
                status: 'error',
                message: 'Extension not found'
            }, 404);
        }
        return c.json({
            status: 'success',
            data: extension
        });
    } catch (error) {
        return c.json({
            status: 'error',
            message: 'Failed to fetch extension'
        }, 500);
    }
});

export default app;

// Service Worker for API simulation

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/extensions')) {
        event.respondWith(handleAPIRequest(url));
    }
});

async function handleAPIRequest(url) {
    const ExtensionsAPI = await import('./extensions/extensions.js');

    if (url.pathname === '/api/extensions') {
        // Return all extensions
        return new Response(JSON.stringify({
            status: 'success',
            data: ExtensionsAPI.default.getAllExtensions()
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else if (url.pathname.startsWith('/api/extensions/filter/')) {
        // Filter extensions by type
        const filterType = url.pathname.split('/').pop();
        return new Response(JSON.stringify({
            status: 'success',
            data: ExtensionsAPI.default.getExtensionsByFilter(filterType)
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else if (url.pathname.startsWith('/api/extensions/')) {
        // Get extension by ID
        const extensionId = url.pathname.split('/').pop();
        const extension = ExtensionsAPI.default.getExtensionById(extensionId);
        if (extension) {
            return new Response(JSON.stringify({
                status: 'success',
                data: extension
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Extension not found'
            }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404
            });
        }
    }

    // Fallback for unknown routes
    return new Response(JSON.stringify({
        status: 'error',
        message: 'Invalid API endpoint'
    }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
    });
}