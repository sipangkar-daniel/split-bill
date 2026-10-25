import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite plugin: SPA fallback for /s/* share routes.
 * Rewrites the internal request URL to '/' so Vite serves index.html,
 * while the browser keeps the original /s/... URL in the address bar.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      // Return a function so it runs AFTER Vite's internal middleware
      // but BEFORE the final 404 handler
      return () => {
        server.middlewares.use((req, _res, next) => {
          if (req.url && req.url.startsWith('/s/')) {
            req.url = '/index.html';
          }
          next();
        });
      };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), spaFallback()],
})
