import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Ensures relative paths for assets, crucial for GitHub Pages
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        minify: 'terser', // Use terser for better minification
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.logs
                drop_debugger: true
            },
            mangle: {
                toplevel: true // Mangle top-level variable names
            },
            format: {
                comments: false // Remove comments
            }
        }
    },
    server: {
        open: true
    }
});
