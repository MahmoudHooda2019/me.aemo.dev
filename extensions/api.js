// API Endpoint for Android
const express = require('express');
const app = express();
const cors = require('cors');
const ExtensionsAPI = require('./extensions.js');

app.use(cors());
app.use(express.json());

// Set JSON response headers
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Get all extensions
app.get('/api/extensions', (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
}); 