// Store extensions data
let extensions = [];

export const loadExtensions = async () => {
    if (extensions.length > 0) return extensions;
    try {
        const response = await fetch('./extensions/extensions.json');
        if (!response.ok) {
            throw new Error(`Failed to load extensions.json: ${response.statusText}`);
        }
        extensions = await response.json();
        return extensions;
    } catch (error) {
        console.error('Error loading extensions:', error);
        return [];
    }
};

export const setExtensions = (data) => {
    extensions = data;
};

export const getAllExtensions = () => extensions;

export const getExtensionsByFilter = (filter) => {
    if (filter === 'all') return extensions;
    return extensions.filter(ext => ext.filters.includes(filter));
};

export const getExtensionById = async (id) => {
    if (extensions.length === 0) {
        await loadExtensions();
    }
    const extension = extensions.find(ext => ext.id === id);
    return extension;
};

export default {
    loadExtensions,
    getAllExtensions,
    getExtensionsByFilter,
    getExtensionById,
    setExtensions
};