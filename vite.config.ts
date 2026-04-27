import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ACFT Calculator',
        short_name: 'ACFT',
        description: 'Army Combat Fitness Test score calculator',
        theme_color: '#3a2a1c',
        background_color: '#241a13',
        display: 'standalone',
        icons: [
          { src: '/favicons/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
