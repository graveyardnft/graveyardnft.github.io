import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    https: true
  },
  plugins: [vue()],
  build: {
    sourcemap: true
  }
})
