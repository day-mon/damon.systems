// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },

  adapter: node({
    mode: 'standalone',
  }),
});