import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Base from '../src/layouts/Base.astro';

test('Base sets lang, title, meta description and GA id', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Base, {
    props: { title: 'Titre test', description: 'Desc test' },
    slots: { default: '<main>contenu</main>' },
  });
  expect(html).toContain('lang="fr"');
  expect(html).toContain('<title>Titre test</title>');
  expect(html).toContain('Desc test');
  expect(html).toContain('G-TTRMH9G96E');
  expect(html).toContain('contenu');
});
