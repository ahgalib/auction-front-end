import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [vue(), tailwindcss()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
        proxy: {
            '/graphql': {
                target: process.env.VITE_BACKEND_URL || 'http://backend:8000',
                changeOrigin: true,
            },
        },
    },
});
