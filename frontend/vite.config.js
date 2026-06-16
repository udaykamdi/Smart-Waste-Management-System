import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://smart-waste-management-system-0t43.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
