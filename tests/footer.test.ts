import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Footer from '../src/components/Footer.astro';

test('footer shows contact channels', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Footer);
  expect(html).toContain('instagram.com/cy.coaching');
  expect(html).toContain('mailto:yoann.cycoaching@gmail.com');
  expect(html).toContain('0608703251');
});

test('footer links every page (only navigation reachable if the header menu fails)', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Footer);
  for (const href of ['/','/musculation','/boxe','/self-defense','/coaching-entreprise','/a-propos','/tarif','/contact']) {
    expect(html).toContain(`href="${href}"`);
  }
});
