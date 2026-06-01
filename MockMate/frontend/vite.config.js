import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import fs from 'node:fs'
import path from 'node:path'

const backendPortFile = path.resolve(__dirname, '.backend-port')
const defaultBackendPort = Number(process.env.BACKEND_PORT || process.env.PORT) || 5003

let runtimeBackendPort = defaultBackendPort
if (fs.existsSync(backendPortFile)) {
  const filePort = Number(fs.readFileSync(backendPortFile, 'utf8').trim())
  if (Number.isInteger(filePort) && filePort > 0) {
    runtimeBackendPort = filePort
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // simple-peer needs crypto, events, util polyfills
      include: ['buffer', 'process', 'events', 'util', 'stream']
    })
  ],
  server: {
    host: true, // Expose to local network
    port: 5174,
    proxy: {
      '/api': `http://localhost:${runtimeBackendPort}`
    }
  },
  define: {
    global: 'window',
    'import.meta.env.VITE_RUNTIME_BACKEND_PORT': JSON.stringify(String(runtimeBackendPort))
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
