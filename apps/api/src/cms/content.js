import sanitizeHtml from 'sanitize-html';

const options = Object.freeze({
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    's',
    'blockquote',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'a',
    'code',
    'pre',
    'hr',
    'img',
    'figure',
    'figcaption',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['scope'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  enforceHtmlBoundary: true,
  transformTags: {
    a: (_tagName, attributes) => ({
      tagName: 'a',
      attribs: {
        ...attributes,
        ...(attributes.target === '_blank' ? { rel: 'noopener noreferrer' } : {}),
      },
    }),
    img: (_tagName, attributes) => ({
      tagName: 'img',
      attribs: { ...attributes, loading: 'lazy' },
    }),
  },
});

export function sanitizeCmsHtml(value) {
  return sanitizeHtml(value, options).trim();
}

export function textFromCmsHtml(value) {
  const separated = value.replace(
    /<\/(?:p|h2|h3|h4|li|blockquote|pre|figcaption|tr|table)>/giu,
    ' ',
  );
  return sanitizeHtml(separated, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/gu, ' ')
    .trim();
}

export function readingTimeForText(value) {
  const words = value.split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.min(120, Math.ceil(words / 180)));
}
