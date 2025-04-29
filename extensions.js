// Extensions API
const ExtensionsAPI = {
    // Get all extensions
    getAllExtensions: () => {
        return extensions;
    },

    // Get extensions by filter
    getExtensionsByFilter: (filter) => {
        if (filter === 'all') return extensions;
        return extensions.filter(ext => ext.filters.includes(filter));
    },

    // Get extension by ID
    getExtensionById: (id) => {
        return extensions.find(ext => ext.id === id);
    },

    // Get extensions by category
    getExtensionsByCategory: (category) => {
        return extensions.filter(ext => ext.category === category);
    }
};

// Extensions data
const extensions = [
    {
        id: 'number_checker',
        title: 'Number Checker',
        subtitle: 'Check if a number is prime, even, or odd',
        price: 'Free',
        filters: ['all', 'free'],
        category: 'utility',
        href: 'extensions/number_checker/index.html'
    },
    {
        id: 'islamic_history',
        title: 'Islamic History',
        subtitle: 'Hijri date for Muslims and Islamic history utilities',
        price: 'Free',
        filters: ['all', 'free'],
        category: 'utility',
        href: 'extensions/islamic_history/index.html'
    },
    {
        id: 'device_info',
        title: 'Device Info',
        subtitle: 'Retrieve essential information about the device',
        price: 'Free',
        filters: ['all', 'free'],
        category: 'utility',
        href: 'extensions/device_info/index.html'
    },
    {
        id: 'slide_color_picker',
        title: 'Slide Color Picker',
        subtitle: 'Create a custom slider bar for color selection',
        price: '$5.00',
        filters: ['all', 'paid'],
        category: 'ui',
        href: 'extensions/slide_color_picker/index.html'
    },
    {
        id: 'painter',
        title: 'Painter',
        subtitle: 'Create custom drawings with awesome functions',
        price: '$8.00',
        filters: ['all', 'paid'],
        category: 'ui',
        href: 'extensions/painter/index.html'
    },
    {
        id: 'painter_pro',
        title: 'Painter Pro',
        subtitle: 'Advanced features for custom drawings with even more functionality',
        price: '$8.00',
        filters: ['all', 'paid'],
        category: 'ui',
        href: 'extensions/painter_pro/index.html'
    },
    {
        id: 'image_compressor',
        title: 'Image Compressor',
        subtitle: 'Compress images efficiently',
        price: '$5.00',
        filters: ['all', 'paid'],
        category: 'media',
        href: 'extensions/image_compressor/index.html'
    },
    {
        id: 'video_compressor',
        title: 'Video Compressor',
        subtitle: 'Compress video files with ease',
        price: '$5.00',
        filters: ['all', 'paid'],
        category: 'media',
        href: 'extensions/video_compressor/index.html'
    },
    {
        id: 'photo_filter_pro',
        title: 'Photo Filter Pro',
        subtitle: 'Filter your images with custom filters',
        price: '$5.00',
        filters: ['all', 'paid'],
        category: 'media',
        href: 'extensions/photo_filter_pro/index.html'
    },
    {
        id: 'htxml',
        title: 'HTXML',
        subtitle: 'Advanced HTML/XML functionalities',
        price: '$8',
        filters: ['all', 'paid'],
        category: 'utility',
        href: 'extensions/htxml/index.html'
    },
    {
        id: 'music_bar',
        title: 'Music Bar',
        subtitle: 'Create custom music bars',
        price: '$5',
        filters: ['all', 'paid'],
        category: 'ui',
        href: 'extensions/music_bar/index.html'
    },
    {
        id: 'sms_pro',
        title: 'SMS Pro',
        subtitle: 'Advanced SMS features',
        price: '$8',
        filters: ['all', 'paid'],
        category: 'utility',
        href: 'extensions/sms_pro/index.html'
    },
    {
        id: 'youtube_downloader',
        title: 'YouTube Downloader',
        subtitle: 'Download videos from YouTube with ease',
        price: '$10',
        filters: ['all', 'paid'],
        category: 'media',
        href: 'extensions/youtube_downloader/index.html'
    }
];

// Export the API
export default ExtensionsAPI; 