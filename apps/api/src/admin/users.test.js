import assert from 'node:assert/strict';
import { test } from 'node:test';

import { userUpdateBodySchema, usersQuerySchema } from './validation.js';

test('normal user query parsing keeps pagination, filters, and sorting server-side', () => {
  const query = usersQuerySchema.parse({
    page: '2',
    pageSize: '10',
    emailVerified: 'true',
    phoneVerified: 'false',
    profileCompleted: 'true',
    registeredFrom: '2026-01-01',
    registeredTo: '2026-01-31',
    sortBy: 'lastLoginAt',
    sortOrder: 'asc',
  });

  assert.deepEqual(query, {
    page: 2,
    pageSize: 10,
    emailVerified: true,
    phoneVerified: false,
    profileCompleted: true,
    registeredFrom: '2026-01-01',
    registeredTo: '2026-01-31',
    sortBy: 'lastLoginAt',
    sortOrder: 'asc',
  });
  assert.equal(
    usersQuerySchema.safeParse({ registeredFrom: '2026-02-01', registeredTo: '2026-01-01' })
      .success,
    false,
  );
});

test('normal user updates require a safe editable field and an audit reason', () => {
  assert.equal(userUpdateBodySchema.safeParse({ reason: 'اصلاح مشخصات' }).success, false);
  assert.deepEqual(userUpdateBodySchema.parse({ firstName: ' سارا ', reason: ' اصلاح مشخصات ' }), {
    firstName: 'سارا',
    reason: 'اصلاح مشخصات',
  });
});
