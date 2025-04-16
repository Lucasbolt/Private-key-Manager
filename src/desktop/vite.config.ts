import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'main.js',
      },
      {
        entry: 'preload.ts',
        onstart(options) {
          options.reload()
        }
      }
    ]),
    renderer()

  ],
  build: {
    outDir: 'build'
  },
  resolve: {
    alias: {
      "@services": path.resolve(__dirname, '../services')
    }
  }
})
