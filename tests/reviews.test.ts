import { expect, test } from 'vitest';
import { truncateWords, starArray, mapGoogleReview } from '../src/lib/reviews';

test('truncateWords keeps short text unchanged', () => {
  expect(truncateWords('a b c', 5)).toBe('a b c');
});
test('truncateWords cuts and adds ellipsis', () => {
  expect(truncateWords('a b c d e f', 3)).toBe('a b c…');
});
test('starArray rounds and caps at 5', () => {
  expect(starArray(5)).toHaveLength(5);
  expect(starArray(4.6)).toHaveLength(5);
  expect(starArray(3.2)).toHaveLength(3);
  expect(starArray(9)).toHaveLength(5);
});
test('mapGoogleReview normalizes field names', () => {
  expect(mapGoogleReview({ author_name: 'Jean D.', rating: 5, text: 'Top' }))
    .toEqual({ author: 'Jean D.', rating: 5, text: 'Top' });
});
