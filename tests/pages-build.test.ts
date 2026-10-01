import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Index from '../src/pages/index.astro';
import Boxe from '../src/pages/boxe.astro';
import Self from '../src/pages/self-defense.astro';
import Muscu from '../src/pages/musculation.astro';
import Ent from '../src/pages/coaching-entreprise.astro';
import About from '../src/pages/a-propos.astro';
import Tarif from '../src/pages/tarif.astro';
import Contact from '../src/pages/contact.astro';

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

test('self-defense page renders key notions', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Self);
  expect(html).toContain('prévention, de protection et de détermination');
});

test('musculation page renders headline and 3 featured transformations', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Muscu);
  expect(html).toContain('Sculptez le corps que vous visez');
  expect((html.match(/class="tcard"/g) || []).length).toBe(3);
});

test('entreprise page renders without images, shows benefits', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Ent);
  expect(html).toContain("Investissez dans vos équipes");
  expect(html).toContain("Investissement au travail");
  expect(html).not.toContain('<img');
});

test('a-propos page shows STAPS credentials', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(About);
  expect(html).toContain('deux Licences STAPS');
});

test('tarif page shows all three pricing groups', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Tarif);
  expect(html).toContain('Coaching individuel');
  expect(html).toContain('Mini-groupe (2 à 5 personnes)');
  expect(html).toContain('Programmes à distance');
});

test('contact page posts to the Formspree endpoint with all fields', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Contact);
  expect(html).toContain('https://formspree.io/f/mbjenzqk');
  for (const n of ['nom','email','telephone','message']) expect(html).toContain(`name="${n}"`);
});

test('homepage hero image is the LCP: loaded eagerly with high priority', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Index);
  const hero = html.match(/<img[^>]*hero-bg[^>]*>/)?.[0] ?? '';
  expect(hero).toContain('loading="eager"');
  expect(hero).toContain('fetchpriority="high"');
});
