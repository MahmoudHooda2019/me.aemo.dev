// Store extensions data
let extensions = [];

export const loadExtensions = async () => {
    try {
        console.log('Attempting to load extensions.json');
        // If we already have extensions data loaded, return it
        if (extensions.length > 0) {
            console.log('Extensions already loaded:', extensions);
            return extensions;
        }

        // Dynamically resolve the path to extensions.json
        let jsonPath;
        if (location.pathname.endsWith('/index.html') || location.pathname === '/' || location.pathname === '/index.html') {
            jsonPath = './extensions/extensions.json';
        } else {
            jsonPath = './extensions.json';
        }

        // Get extensions data from JSON file
        const response = await fetch(jsonPath);
        console.log('Fetch response:', response);

        if (!response.ok) {
            console.error('Failed to fetch extensions.json:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Extensions data loaded:', data);
        extensions = data; // Store the loaded data
        return extensions;
    } catch (error) {
        console.error('Error loading extensions:', error);
        return [];
    }
};

// Allow setting extensions data from external source
export const setExtensions = (data) => {
    extensions = data;
};

export const getAllExtensions = () => extensions;

export const getExtensionsByFilter = (filter) => {
    if (filter === 'all') return extensions;
    return extensions.filter(ext => ext.filters.includes(filter));
};

export const getExtensionById = async (id) => {
    try {
        if (extensions.length === 0) {
            await loadExtensions();
        }
        const extension = extensions.find(ext => ext.id === id);
        return extension;
    } catch (error) {
        console.error('Error in getExtensionById:', error);
        throw error;
    }
};

export default {
    loadExtensions,
    getAllExtensions,
    getExtensionsByFilter,
    getExtensionById,
    setExtensions
};