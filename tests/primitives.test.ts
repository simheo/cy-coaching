import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Button from '../src/components/Button.astro';
import SectionHead from '../src/components/SectionHead.astro';
import CtaBand from '../src/components/CtaBand.astro';

test('Button renders anchor with variant class and label', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Button, { props: { href: '/contact', variant: 'ghost' }, slots: { default: 'Clique' } });
  expect(html).toContain('href="/contact"');
  expect(html).toContain('btn--ghost');
  expect(html).toContain('Clique');
});

test('SectionHead renders eyebrow, title, lede', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(SectionHead, { props: { eyebrow: 'Pour qui', title: "À qui je m'adresse", lede: 'Peu importe le départ.' } });
  expect(html).toContain('Pour qui');
  expect(html).toContain('À qui je m&#39;adresse');
  expect(html).toContain('Peu importe le départ.');
});

test('CtaBand renders title and cta link', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(CtaBand, { props: { title: 'Prêt ?', text: 'Séance offerte.', href: '/contact', cta: 'Réserver' } });
  expect(html).toContain('Prêt ?');
  expect(html).toContain('href="/contact"');
  expect(html).toContain('Réserver');
});
