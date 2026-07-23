import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import AudienceCard from '../src/components/AudienceCard.astro';
import MethodItem from '../src/components/MethodItem.astro';

test('AudienceCard renders title and text', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(AudienceCard, { props: { icon: 'ph:heartbeat', title: 'Remise en forme', text: 'Retrouver de l’énergie.' } });
  expect(html).toContain('Remise en forme');
  expect(html).toContain('Retrouver de l’énergie.');
});

test('MethodItem renders title and text', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(MethodItem, { props: { icon: 'ph:flask', title: 'Basée sur la science', text: 'Selon les dernières études.' } });
  expect(html).toContain('Basée sur la science');
});
