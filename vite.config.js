import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run dev` serves from the site root; `npm run build` targets GitHub Pages,
// which hosts the site at https://yungwern.github.io/idleon-tracker/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/idleon-tracker/' : '/',
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
}))
