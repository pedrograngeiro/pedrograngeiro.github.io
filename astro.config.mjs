import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://pedrograngeiro.github.io',
  integrations: [mdx()]
});
