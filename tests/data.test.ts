import { expect, test } from 'vitest';
import { faq } from '../src/data/faq';
import { fallbackReviews } from '../src/data/reviews-fallback';

test('faq has at least 5 complete entries', () => {
  expect(faq.length).toBeGreaterThanOrEqual(5);
  for (const f of faq) { expect(f.q).toBeTruthy(); expect(f.a).toBeTruthy(); }
});

test('fallback has exactly 5 reviews rated 1..5', () => {
  expect(fallbackReviews).toHaveLength(5);
  for (const r of fallbackReviews) { expect(r.rating).toBeGreaterThanOrEqual(1); expect(r.rating).toBeLessThanOrEqual(5); }
});
