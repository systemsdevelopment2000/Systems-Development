import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Genera los íconos PWA (favicon, apple-touch, pwa-192/512, maskable)
// a partir del logo de marca. Ejecuta:  npm run generate-pwa-assets
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: minimal2023Preset,
  // Imagen fuente: el emblema circular de SD (cuadrado), ideal para íconos.
  images: ['public/emblema-sd.jpeg'],
})
