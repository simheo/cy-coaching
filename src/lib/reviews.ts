export function truncateWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return words.join(' ');
  return words.slice(0, max).join(' ') + '…';
}

export function starArray(rating: number): number[] {
  const n = Math.min(5, Math.max(0, Math.round(rating)));
  return Array.from({ length: n }, (_, i) => i + 1);
}

export function mapGoogleReview(r: { author_name: string; rating: number; text: string }) {
  return { author: r.author_name, rating: r.rating, text: r.text };
}
