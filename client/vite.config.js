import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    tailwindcss(), // Integrate Tailwind CSS plugin
  ],

  server: {
    proxy: {
      // All requests starting with '/api' will be proxied
      '/api': {
        target: 'http://localhost:3000', // The address of our backend
        changeOrigin: true, // Recommended setting
      },
    },
  },
});
