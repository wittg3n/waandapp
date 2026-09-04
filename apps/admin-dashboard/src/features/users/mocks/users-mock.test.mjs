import assert from 'node:assert/strict';
import test from 'node:test';

import { mockUsersRepository } from './users-mock.ts';

test('mock users filter and mutate without a backend', async () => {
  const banned = await mockUsersRepository.list(new URLSearchParams({ status: 'banned' }));
  assert.ok(banned.items.length > 0);

  const user = banned.items[0];
  await mockUsersRepository.changeStatus(user.id, 'active', 'بازبینی رابط');
  assert.equal((await mockUsersRepository.get(user.id)).status, 'active');
});
