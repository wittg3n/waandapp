import { createMongoAbility, subject } from '@casl/ability';
import { accessibleBy } from '@casl/mongoose';
import { PERMISSION_VALUES } from '@waandapp/shared';
import mongoose from 'mongoose';
import { ApiError } from '../middleware/errors.js';

const subjects = {
  users: 'User',
  'users.sessions': 'UserSession',
  'users.roles': 'UserRole',
  roles: 'Role',
  applications: 'Application',
  documents: 'Document',
  'education.countries': 'Country',
  'education.universities': 'University',
  'education.programs': 'Program',
  'blog.posts': 'BlogPost',
  'blog.categories': 'BlogCategory',
  'blog.tags': 'BlogTag',
  'blog.authors': 'BlogAuthor',
  'blog.media': 'BlogMedia',
  'blog.comments': 'Comment',
  'blog.seo': 'BlogSeo',
  'blog.analytics': 'Analytics',
  billing: 'Billing',
  agents: 'Agent',
  jobs: 'Job',
  audit: 'AuditLog',
  'system.settings': 'SystemSettings',
};
export const PERMISSION_RULES = Object.freeze(
  Object.fromEntries(
    PERMISSION_VALUES.map((permission) => {
      const dot = permission.lastIndexOf('.');
      const resource = subjects[permission.slice(0, dot)];
      if (!resource) throw new Error(`Missing subject for ${permission}`);
      return [permission, { action: permission.slice(dot + 1), subject: resource }];
    }),
  ),
);

export function defineAbilityFor(user, permissions = []) {
  const id = String(user._id);
  return createMongoAbility([
    { action: 'read', subject: 'User', conditions: { _id: id } },
    { action: ['read', 'update'], subject: 'ApplicantProfile', conditions: { userId: id } },
    ...permissions
      .filter((permission) => PERMISSION_RULES[permission])
      .map((permission) => PERMISSION_RULES[permission]),
  ]);
}

export function authorize(action, resource, loadResource) {
  return async (request, _response, next) => {
    try {
      if (!request.ability)
        throw new ApiError(401, 'AUTH_UNAUTHORIZED', 'Authentication is required.');
      const target = loadResource ? subject(resource, await loadResource(request)) : resource;
      const unconditional =
        loadResource ||
        request.ability
          .rulesFor(action, resource)
          .some((rule) => !rule.inverted && !rule.conditions && !rule.fields);
      if (!unconditional || !request.ability.can(action, target))
        throw new ApiError(403, 'AUTH_FORBIDDEN', 'The required permission is missing.');
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function authorizedFilter(ability, action, resource, filter = {}) {
  return mongoose.trusted({ $and: [filter, accessibleBy(ability, action).ofType(resource)] });
}
