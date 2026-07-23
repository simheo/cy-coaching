/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

const astroViteConfigFn = getViteConfig({}, { integrations: [] });

export default async (inlineConfig: any = {}) => {
  const { command = 'serve', mode = 'test', ...rest } = inlineConfig;
  const config = await astroViteConfigFn({ command, mode });

  return {
    ...config,
    test: {
      globals: true,
      environment: 'node',
      ...(rest?.test || {}),
    }
  };
};
