import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users':    'http://localhost:4000',
      '/expenses': 'http://localhost:4000',
    }
  }
})