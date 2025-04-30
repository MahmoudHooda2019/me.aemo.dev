// API Endpoint for Android
const express = require('express');
const app = express();
const cors = require('cors');
const ExtensionsAPI = require('./extensions.js');

app.use(cors());

// Get all extensions
app.get('/api/extensions', (req, res) => {
    res.json(ExtensionsAPI.getAllExtensions());
});

// Get extensions by filter
app.get('/api/extensions/filter/:type', (req, res) => {
    const filter = req.params.type;
    res.json(ExtensionsAPI.getExtensionsByFilter(filter));
});

// Get extension by ID
app.get('/api/extensions/:id', (req, res) => {
    const extension = ExtensionsAPI.getExtensionById(req.params.id);
    if (extension) {
        res.json(extension);
    } else {
        res.status(404).json({ error: 'Extension not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
}); 