// API Endpoint for Android and Browser
import express from 'express';
import cors from 'cors';
import ExtensionsAPI from './extensions.js';

const app = express();
app.use(cors());
app.use(express.json());

// Set JSON response headers
app.use((_req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
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
app.get('/api/extensions', (_req, res) => {
    try {
        const extensions = ExtensionsAPI.getAllExtensions();
        res.json({
            status: 'success',
            data: extensions
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch extensions'
        });
    }
});

// Get extensions by filter
app.get('/api/extensions/filter/:type', (req, res) => {
    try {
        const filter = req.params.type;
        const extensions = ExtensionsAPI.getExtensionsByFilter(filter);
        res.json({
            status: 'success',
            data: extensions
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to filter extensions'
        });
    }
});

// Get extension by ID
app.get('/api/extensions/:id', (req, res) => {
    try {
        const extension = ExtensionsAPI.getExtensionById(req.params.id);
        if (extension) {
            res.json({
                status: 'success',
                data: extension
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Extension not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch extension'
        });
    }
});

// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Access the API at: http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET / - API documentation');
    console.log('- GET /api/extensions - Get all extensions');
    console.log('- GET /api/extensions/filter/:type - Filter extensions');
    console.log('- GET /api/extensions/:id - Get extension by ID');
});

export default app; 