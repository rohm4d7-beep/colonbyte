import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Fixed at 3002 (native dev and the docker-compose mapping both use this) so it never
    // collides with sibling projects on this machine defaulting to 3000 (dormos, Next.js apps).
    port: 3002,
    strictPort: true,
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
      '/demo': process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
    },
  },
});
