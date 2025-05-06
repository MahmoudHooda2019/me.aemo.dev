let extensions = [];

export const loadExtensions = async () => {
    try {
        const response = await fetch('/extensions/extensions.json', {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to load extensions.json: ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Expected JSON but got ${contentType}`);
        }
        extensions = await response.json();
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