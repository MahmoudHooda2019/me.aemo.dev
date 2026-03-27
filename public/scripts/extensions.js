// Extensions module for template.html
// Fetches extension data from the same JSON file used by the Vue app

let extensionsCache = null;

async function loadExtensions() {
    if (extensionsCache) return extensionsCache;
    
    try {
        const response = await fetch('/extensions/extensions.json', {
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Extensions data must be an array');
        }
        
        extensionsCache = data;
        console.log(`Loaded ${data.length} extensions`);
        return data;
    } catch (error) {
        console.error('Failed to load extensions:', error);
        throw error;
    }
}

export async function getExtensionById(id) {
    const extensions = await loadExtensions();
    return extensions.find(ext => ext.id === id);
}

export async function getAllExtensions() {
    return await loadExtensions();
}
