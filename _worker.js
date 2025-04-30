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