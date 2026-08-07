import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Avoid React Router "Unable to preload CSS for /assets/*.css" on Netlify
    // when stale or racey chunk CSS links fail and crash the whole app.
    cssCodeSplit: false,
  },
  server: {
    // Windows file watchers can drop/corrupt HMR after many saves;
    // polling is slower but much more stable for this project.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
