import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    watch: {
      usePolling: true,
      interval: 100,        // much faster polling
      binaryInterval: 300,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  }
})