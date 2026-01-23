import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import VitePluginSitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginSitemap({
      hostname: 'https://acses-3d.pages.dev/', // Replace with your actual domain
      dynamicRoutes: [
        '/',
        '/about',
        '/contact',
        '/events',
        '/teams'
      ]
    })
  ],
})
