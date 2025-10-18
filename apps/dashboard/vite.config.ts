import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 3003,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,

    // ✅ Code Splitting Optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting
        manualChunks: (id) => {
          // Vendor chunk - all node_modules
          if (id.includes('node_modules')) {
            // Firebase in separate chunk (large library)
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // React and related libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-hook-form')) {
              return 'vendor-react';
            }
            // Date/time libraries
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            // Everything else in general vendor chunk
            return 'vendor';
          }

          // Shared code in separate chunk
          if (id.includes('/shared/')) {
            return 'shared';
          }
        },

        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
  },
});
