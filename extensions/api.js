import ExtensionsAPI from './extensions.js';

// Simulate API endpoints
const simulateAPI = () => {
    const rootEndpoint = {
        status: 'success',
        message: 'Welcome to Aemo Developer API',
        endpoints: {
            allExtensions: '/api/extensions',
            filterExtensions: '/api/extensions/filter/:type',
            getExtensionById: '/api/extensions/:id'
        }
    };

    console.log('Root Endpoint:', rootEndpoint);

    // Simulate fetching all extensions
    console.log('GET /api/extensions:', {
        status: 'success',
        data: ExtensionsAPI.getAllExtensions()
    });

    // Simulate filtering extensions
    const filterType = 'free';
    console.log(`GET /api/extensions/filter/${filterType}:`, {
        status: 'success',
        data: ExtensionsAPI.getExtensionsByFilter(filterType)
    });

    // Simulate fetching an extension by ID
    const extensionId = 'number_checker';
    const extension = ExtensionsAPI.getExtensionById(extensionId);
    if (extension) {
        console.log(`GET /api/extensions/${extensionId}:`, {
            status: 'success',
            data: extension
        });
    } else {
        console.log(`GET /api/extensions/${extensionId}:`, {
            status: 'error',
            message: 'Extension not found'
        });
    }
};

// Run the simulated API in the browser
simulateAPI();