let extensions = [];

export const loadExtensions = async () => {
    try {
        const response = await fetch('/extensions/extensions.json', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Verify content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError(`Expected JSON but got ${contentType}`);
        }

        const text = await response.text();
        try {
            extensions = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON:', text.substring(0, 100) + '...');
            throw e;
        }
    } catch (error) {
        console.error('Error loading extensions:', error);
        throw error;
    }
};

export const getAllExtensions = () => extensions;

export const getExtensionsByFilter = (filter) => {
    if (filter === 'all') return extensions;
    return extensions.filter(ext => ext.filters.includes(filter));
};

export const getExtensionById = (id) => {
    const extension = extensions.find(ext => ext.id === id);
    if (!extension) {
        return null;
    }
    return extension;
};

export default { loadExtensions, getAllExtensions, getExtensionsByFilter, getExtensionById };