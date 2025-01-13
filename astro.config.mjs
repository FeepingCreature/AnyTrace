import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
    entrypoint: 'src/server/entry.ts'
  }),
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000
  }
});
