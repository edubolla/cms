import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Em desenvolvimento, serve /admin e /admin/ como a pasta public/admin (na Vercel isso já funciona).
const adminIndex = {
  name: 'admin-index',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url === '/admin/') req.url = '/admin/index.html';
      next();
    });
  },
};

// Troque pelo domínio definitivo (ex.: https://metingertech.com.br) quando apontar o DNS.
export default defineConfig({
  site: 'https://cms-ivory-chi.vercel.app',
  integrations: [sitemap({ filter: page => !page.includes('/calculadora') })],
  vite: { plugins: [adminIndex] },
});
