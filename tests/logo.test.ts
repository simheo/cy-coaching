import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Logo from '../src/components/Logo.astro';

test('Logo renders the mark svg and the wordmark', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Logo);
  expect(html).toContain('<svg');
  expect(html).toContain('logo-mark');
  expect(html).toContain('CY');
  expect(html).toContain('Coaching');
  expect(html).toContain('tone-ink'); // default tone
});

test('Logo supports the cream tone for dark backgrounds', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Logo, { props: { tone: 'cream' } });
  expect(html).toContain('tone-cream');
});
