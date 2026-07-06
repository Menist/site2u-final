import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://site2u.by',
  trailingSlash: 'always',
  integrations: [sitemap()],
});