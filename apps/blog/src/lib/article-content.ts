export interface ArticleBlock {
  type: 'h2' | 'p';
  text: string;
}

const entityValues: Readonly<Record<string, string>> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

function decodeEntity(entity: string) {
  if (entity.startsWith('#')) {
    const hexadecimal = entity[1]?.toLowerCase() === 'x';
    const value = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);

    if (Number.isInteger(value) && value >= 0 && value <= 0x10ffff) {
      return String.fromCodePoint(value);
    }
  }

  return entityValues[entity.toLowerCase()] ?? `&${entity};`;
}

function plainText(html: string) {
  return html
    .replace(/<[^>]*>/gu, ' ')
    .replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/giu, (_, entity: string) =>
      decodeEntity(entity),
    )
    .replace(/\s+/gu, ' ')
    .trim();
}

export function parseArticleContent(content: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];

  for (const match of content.matchAll(/<(p|h2)\b[^>]*>([\s\S]*?)<\/\1>/giu)) {
    const text = plainText(match[2] ?? '');
    if (text) blocks.push({ type: match[1]?.toLowerCase() === 'h2' ? 'h2' : 'p', text });
  }

  if (blocks.length > 0) return blocks;

  const fallback = plainText(content);
  return fallback ? [{ type: 'p', text: fallback }] : [];
}
