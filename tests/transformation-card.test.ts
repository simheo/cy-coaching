import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import TransformationCard from '../src/components/TransformationCard.astro';
import { transformations } from '../src/data/transformations';

test('card shows title, freq, tag, before/after labels and badge when present', async () => {
  const c = await AstroContainer.create();
  const withBadge = transformations.find((t) => t.badge)!;
  const html = await c.renderToString(TransformationCard, { props: { t: withBadge } });
  expect(html).toContain(withBadge.title);
  expect(html).toContain(withBadge.freq);
  expect(html).toContain(withBadge.tag);
  expect(html).toContain('Avant');
  expect(html).toContain('Après');
  expect(html).toContain(withBadge.badge!);
});
