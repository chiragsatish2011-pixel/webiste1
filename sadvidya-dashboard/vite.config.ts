import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Served from the root of its own domain on Netlify/Vercel. This must stay '/'
  // (not './') so that a deep link like /articles/3 still finds the assets.
  base: '/',
})
