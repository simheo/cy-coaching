import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Header from '../src/components/Header.astro';

test('header exposes all nav destinations and the CTA', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Header);
  for (const href of ['/','/musculation','/boxe','/self-defense','/coaching-entreprise','/a-propos','/tarif','/contact']) {
    expect(html).toContain(`href="${href}"`);
  }
  expect(html).toContain('Séance offerte');
});
