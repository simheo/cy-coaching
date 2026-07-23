import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Healthcheck from '../src/pages/_healthcheck.astro';

test('container renders a component to string', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Healthcheck);
  expect(html).toContain('id="ok"');
});
