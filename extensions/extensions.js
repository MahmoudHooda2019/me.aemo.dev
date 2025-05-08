let extensions = [];

export const loadExtensions = async () => {
    try {
        // Use a relative path that works from both template.html and index.html
        const response = await fetch('/extensions/extensions.json');
        
        if (!response.ok) {
            console.error('Failed to load extensions:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        extensions = await response.json();
        console.log('Extensions loaded successfully:', extensions.length);
        return extensions;
    } catch (error) {
        console.error('Error loading extensions:', error);
        return [];
    }
};

export const getAllExtensions = () => extensions;

export const getExtensionsByFilter = (filter) => {
    if (filter === 'all') return extensions;
    return extensions.filter(ext => ext.filters.includes(filter));
};

export const getExtensionById = async (id) => {
    try {
        if (extensions.length === 0) {
            console.log('Loading extensions as none are loaded yet');
            await loadExtensions();
        }
        const extension = extensions.find(ext => ext.id === id);
        console.log('Found extension:', extension?.title || 'Not found');
        return extension;
    } catch (error) {
        console.error('Error in getExtensionById:', error);
        throw error;
    }
};

export default { loadExtensions, getAllExtensions, getExtensionsByFilter, getExtensionById };