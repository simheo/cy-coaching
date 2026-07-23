import { expect, test } from 'vitest';
import { pricing } from '../src/data/pricing';
test('pricing has 3 groups, each with items', () => {
  expect(pricing).toHaveLength(3);
  for (const g of pricing) { expect(g.title).toBeTruthy(); expect(g.items.length).toBeGreaterThan(0); }
});
