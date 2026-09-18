import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Reachable from phones on the same Wi-Fi so the app can be
    // loaded inside Nimiq Pay via the Mini Apps custom URL field.
    host: true,
  },
})
