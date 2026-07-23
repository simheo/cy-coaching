import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import FaqItem from '../src/components/FaqItem.astro';

test('FaqItem renders question and answer in details/summary', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(FaqItem, { props: { q: 'À domicile ?', a: 'Oui, à Toulouse.' } });
  expect(html).toContain('<details');
  expect(html).toContain('À domicile ?');
  expect(html).toContain('Oui, à Toulouse.');
});
