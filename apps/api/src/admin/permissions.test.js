import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  PERMISSIONS,
  administrativeRolesForUser,
  hasPermission,
  rolesAssignableBy,
} from './permissions.js';

test('central RBAC matrix enforces human role boundaries and legacy compatibility', () => {
  assert.equal(hasPermission({ adminRoles: [] }, PERMISSIONS.blogPostsRead), false);
  assert.equal(hasPermission({ adminRoles: ['BLOG_EDITOR'] }, PERMISSIONS.blogPostsPublish), true);
  assert.equal(hasPermission({ adminRoles: ['BLOG_EDITOR'] }, PERMISSIONS.usersRead), false);
  assert.equal(hasPermission({ adminRoles: ['SUPPORT'] }, PERMISSIONS.usersSessionsRevoke), true);
  assert.equal(hasPermission({ adminRoles: ['SUPPORT'] }, PERMISSIONS.blogPostsRead), false);
  assert.equal(hasPermission({ adminRoles: ['ADMIN'] }, PERMISSIONS.systemSettingsUpdate), false);
  assert.equal(
    hasPermission({ adminRoles: ['SUPER_ADMIN'] }, PERMISSIONS.systemSettingsUpdate),
    true,
  );
  assert.deepEqual(administrativeRolesForUser({ role: 'admin', adminRoles: [] }), ['ADMIN']);
  assert.deepEqual(rolesAssignableBy({ adminRoles: ['ADMIN'] }), [
    'SUPPORT',
    'CONTENT_MANAGER',
    'BLOG_EDITOR',
    'OPERATIONS_ADMIN',
  ]);
  assert.ok(rolesAssignableBy({ adminRoles: ['SUPER_ADMIN'] }).includes('SUPER_ADMIN'));
});
