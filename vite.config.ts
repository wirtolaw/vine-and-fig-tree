import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/vine-and-fig-tree/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
