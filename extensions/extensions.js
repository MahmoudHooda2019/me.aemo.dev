import extensions from './extensions.json';

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

export default { getAllExtensions, getExtensionsByFilter, getExtensionById };