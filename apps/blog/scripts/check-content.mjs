import assert from 'node:assert/strict';

import { parseArticleContent } from '../src/lib/article-content.ts';
import { readingMinutes } from '../src/lib/format.ts';
import { normalizeSearchQuery, positivePage } from '../src/lib/route-params.ts';

assert.deepEqual(parseArticleContent('<h2>عنوان</h2><p>متن <strong>امن</strong> &amp; روشن</p>'), [
  { type: 'h2', text: 'عنوان' },
  { type: 'p', text: 'متن امن & روشن' },
]);
assert.deepEqual(parseArticleContent('<div>متن ناقص</div>'), [{ type: 'p', text: 'متن ناقص' }]);
assert.equal(normalizeSearchQuery('  انتخاب   دانشگاه  '), 'انتخاب دانشگاه');
assert.equal(normalizeSearchQuery('ا'.repeat(130)).length, 100);
assert.equal(positivePage('-2'), 1);
assert.equal(positivePage('100000'), 100_000);
assert.equal(positivePage('100001'), 100_000);
assert.equal(readingMinutes({ readingTime: 0 }), 1);
