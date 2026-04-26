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
      interval: 100,
      binaryInterval: 300,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
  customLogger: {
    info(msg) { console.log(msg) },
    warn(msg) { console.warn(msg) },
    error(msg) { console.error(msg) },
    warnOnce(msg) { console.warn(msg) },
    clearScreen() {},
    hasErrorLogged() { return false },
    hasWarned: false,
  }
})