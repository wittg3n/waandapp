export function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function positivePage(value: string | string[] | undefined) {
  const page = Number(firstQueryValue(value));
  return Number.isInteger(page) && page > 0 ? Math.min(page, 100_000) : 1;
}

export function normalizeSearchQuery(value: string | string[] | undefined) {
  return firstQueryValue(value).trim().replace(/\s+/gu, ' ').slice(0, 100);
}
