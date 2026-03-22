/**
 * Extensions API module for managing MIT App Inventor extensions
 * @module ExtensionsAPI
 */

// Store extensions data
let extensions = [];
let isLoading = false;
let loadAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Utility function to delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Load extensions from JSON file with retry logic
 * @async
 * @function loadExtensions
 * @returns {Promise<Array>} Array of extension objects
 * @throws {Error} When all retry attempts fail
 */
export const loadExtensions = async () => {
    if (extensions.length > 0) return extensions;
    if (isLoading) {
        // Wait for ongoing load to complete
        while (isLoading) {
            await delay(100);
        }
        return extensions;
    }
    
    isLoading = true;
    
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
            const response = await fetch('/extensions/extensions.json', {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('Extensions data must be an array');
            }
            
            extensions = data;
            loadAttempts = 0;
            isLoading = false;
            console.log(`Successfully loaded ${extensions.length} extensions`);
            return extensions;
            
        } catch (error) {
            console.warn(`Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`, error.message);
            
            if (attempt === MAX_RETRY_ATTEMPTS) {
                isLoading = false;
                loadAttempts = attempt;
                console.error('Failed to load extensions after all retry attempts:', error);
                
                // Return empty array with error indication
                return [];
            }
            
            // Wait before retry
            await delay(RETRY_DELAY * attempt);
        }
    }
};

/**
 * Set extensions data
 * @function setExtensions
 * @param {Array} data - Array of extension objects
 */
export const setExtensions = (data) => {
    extensions = data;
};

/**
 * Get all extensions
 * @function getAllExtensions
 * @returns {Array} Array of extension objects
 */
export const getAllExtensions = () => extensions;

/**
 * Get extensions filtered by category
 * @function getExtensionsByFilter
 * @param {string} filter - Filter category ('all' for no filter)
 * @returns {Array} Filtered array of extension objects
 */
export const getExtensionsByFilter = (filter) => {
    if (filter === 'all') return extensions;
    return extensions.filter(ext => ext.filters && ext.filters.includes(filter));
};

/**
 * Get a specific extension by ID
 * @async
 * @function getExtensionById
 * @param {string} id - Extension ID to search for
 * @returns {Promise<Object|undefined>} Extension object or undefined if not found
 */
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