import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Index from '../src/pages/index.astro';
import Boxe from '../src/pages/boxe.astro';

test('homepage renders hero headline, 6 transformations and FAQ', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Index);
  expect(html).toContain('avec le sourire');
  expect((html.match(/class="tcard"/g) || []).length).toBe(6);
  expect(html).toContain('Questions fréquentes');
});

test('boxe page renders headline and CTA', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Boxe);
  expect(html).toContain('maîtrisez les fondamentaux');
  expect(html).toContain('Prêt(e) à mettre les gants ?');
});
