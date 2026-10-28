import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Dev server only: POST a cloud save bundle here and it's written to IdleOn Resources/raw-save.json
// (CloudLogin's dev button). The cloud bundle has no guildData/tournament/accountCreateTime/extraData,
// so those are kept from the file's last Toolbox export.
const DEV_RAW_SAVE_ENDPOINT = '/__dev/raw-save'
const TOOLBOX_ONLY_KEYS = ['accountCreateTime', 'extraData', 'guildData', 'tournament']

function devRawSaveWriter() {
  return {
    name: 'dev-raw-save-writer',
    apply: 'serve',
    configureServer(server) {
      const file = path.resolve(server.config.root, 'IdleOn Resources', 'raw-save.json')
      server.middlewares.use(DEV_RAW_SAVE_ENDPOINT, async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const cloud = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          if (!cloud?.data) throw new Error('No save data in the request')

          let previous = {}
          try {
            previous = JSON.parse(await readFile(file, 'utf8'))
          } catch {
            // No earlier export: write the cloud bundle on its own
          }
          const kept = Object.fromEntries(TOOLBOX_ONLY_KEYS
            .filter(key => previous[key] !== undefined)
            .map(key => [key, previous[key]]))

          const merged = {
            ...kept,
            ...cloud,
            lastUpdated: Date.now(),
            savedFrom: 'cloud',
          }
          await writeFile(file, JSON.stringify(merged, null, 2))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ file, kept: Object.keys(kept) }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

// `npm run dev` serves from the site root; `npm run build` targets GitHub Pages,
// which hosts the site at https://yungwern.github.io/idleon-tracker/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/idleon-tracker/' : '/',
  plugins: [
    react(),
    devRawSaveWriter(),
  ],
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
