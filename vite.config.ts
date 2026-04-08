import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  build: {
    // Security: Don't expose source maps in production
    sourcemap: false,
    // Minify for production
    minify: 'esbuild',
    // Generate integrity hashes for scripts
    rollupOptions: {
      output: {
        // Consistent chunk naming for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) return 'firebase'
          if (id.includes('node_modules/react-dom')) return 'vendor'
          if (id.includes('node_modules/react-router')) return 'vendor'
          if (id.includes('node_modules/@tanstack/react-query')) return 'query'
          if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror')) return 'editor'
          if (id.includes('node_modules/zod')) return 'zod'
        },
      },
    },
  },
  // Prevent leaking of environment variables
  envPrefix: 'VITE_',
})
