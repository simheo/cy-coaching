import { expect, test } from 'vitest';
import { transformations } from '../src/data/transformations';

test('there are 6 transformations, each fully described', () => {
  expect(transformations).toHaveLength(6);
  for (const t of transformations) {
    expect(t.image.src).toBeTruthy();
    expect(t.title.length).toBeGreaterThan(0);
    expect(t.freq.length).toBeGreaterThan(0);
    expect(t.tag.length).toBeGreaterThan(0);
  }
});

test('three entries carry an age/profile badge', () => {
  expect(transformations.filter((t) => t.badge).length).toBe(3);
});
