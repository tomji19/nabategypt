import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Windows file watchers can drop/corrupt HMR after many saves;
    // polling is slower but much more stable for this project.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
