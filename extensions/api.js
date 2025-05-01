import extensions from './extensions.json';

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path === '/extensions') {
            return new Response(JSON.stringify(extensions), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (path.startsWith('/extensions/')) {
            const id = path.split('/')[2];
            const extension = extensions.find(ext => ext.id === id);
            if (extension) {
                return new Response(JSON.stringify(extension), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                return new Response('Extension not found', { status: 404 });
            }
        }

        return new Response('Not Found', { status: 404 });
    },
};