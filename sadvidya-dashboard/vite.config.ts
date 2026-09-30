import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // '/' for local use and for a domain root (Netlify/Vercel). GitHub Pages serves
  // the site under /webiste1/, so the Pages workflow overrides this with
  // --base=/webiste1/. It must never be './': a relative base breaks a deep link
  // such as /articles/3, which would then look for assets under /articles/.
  base: '/',
})
