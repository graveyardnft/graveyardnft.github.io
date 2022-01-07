import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    https: true
  },
  plugins: [
    vue(),
    {
      name: 'csp-dev-server',
      apply: 'serve',
      transformIndexHtml(html) {
        return html.replace(/object-src 'none';/, `object-src 'none';connect-src wss://localhost:3000/`)
      }
    }
  ],
  build: {
    sourcemap: true
  }
})
