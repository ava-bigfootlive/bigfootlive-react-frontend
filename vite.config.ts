import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Generate unique build timestamp for cache-busting
const buildId = Date.now().toString();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Force unique filenames with timestamp
        entryFileNames: `assets/[name]-${buildId}.[hash].js`,
        chunkFileNames: `assets/[name]-${buildId}.[hash].js`,
        assetFileNames: `assets/[name]-${buildId}.[hash].[ext]`
      }
    }
  },
  define: {
    // Inject build timestamp into app
    __BUILD_ID__: JSON.stringify(buildId)
  }
})
