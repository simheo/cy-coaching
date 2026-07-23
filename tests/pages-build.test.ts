import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Index from '../src/pages/index.astro';

test('homepage renders hero headline, 6 transformations and FAQ', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Index);
  expect(html).toContain('avec le sourire');
  expect((html.match(/class="tcard"/g) || []).length).toBe(6);
  expect(html).toContain('Questions fréquentes');
});
