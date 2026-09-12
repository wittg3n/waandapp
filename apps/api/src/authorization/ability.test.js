import assert from 'node:assert/strict';
import { test } from 'node:test';
import { subject } from '@casl/ability';
import { defineAbilityFor, authorize, authorizedFilter, PERMISSION_RULES } from './ability.js';

test('central abilities enforce concrete ownership and known permission vocabulary', async () => {
  const ability = defineAbilityFor({ _id: 'owner' });
  assert.equal(ability.can('read', subject('User', { _id: 'owner' })), true);
  assert.equal(ability.can('read', subject('User', { _id: 'other' })), false);
  assert.equal(ability.can('update', subject('ApplicantProfile', { userId: 'other' })), false);
  assert.equal(ability.can('update', subject('ApplicantProfile', { userId: 'owner' })), true);
  assert.equal(ability.can('publish', 'BlogPost'), false);
  assert.equal(
    defineAbilityFor({ _id: 'editor' }, ['blog.posts.publish']).can('publish', 'BlogPost'),
    true,
  );
  assert.equal(defineAbilityFor({ _id: 'editor' }, ['made.up']).can('manage', 'all'), false);
  const admin = defineAbilityFor({ _id: 'admin' }, Object.keys(PERMISSION_RULES));
  assert.equal(admin.can('read', subject('User', { _id: 'other' })), true);
  assert.ok(authorizedFilter(ability, 'read', 'User').$and);
  let failure;
  await authorize('read', 'User')({}, {}, (error) => {
    failure = error;
  });
  assert.equal(failure.statusCode, 401);
  await authorize('read', 'User', () => ({ _id: 'other' }))({ ability }, {}, (error) => {
    failure = error;
  });
  assert.equal(failure.statusCode, 403);
});
