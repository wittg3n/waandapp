import { PERMISSIONS } from '@waandapp/shared';
// Display rules only. The API independently checks every protected request.
const routes: Array<[string, string]> = [
  ['/users', PERMISSIONS.usersRead],
  ['/administration/admins', PERMISSIONS.usersRolesRead],
  ['/administration/roles', PERMISSIONS.usersRolesRead],
  ['/administration/permissions', PERMISSIONS.usersRolesRead],
  ['/administration/audit', PERMISSIONS.auditRead],
  ['/content/posts/new', PERMISSIONS.blogPostsCreate],
  ['/content/posts', PERMISSIONS.blogPostsRead],
  ['/content/categories', PERMISSIONS.blogCategoriesRead],
  ['/content/tags', PERMISSIONS.blogTagsRead],
  ['/content/media', PERMISSIONS.blogMediaRead],
  ['/content/comments', PERMISSIONS.blogCommentsRead],
  ['/content', PERMISSIONS.blogAnalyticsRead],
  ['/data/universities', PERMISSIONS.educationUniversitiesRead],
  ['/data/programs', PERMISSIONS.educationProgramsRead],
  ['/data', PERMISSIONS.educationCountriesRead],
  ['/system/jobs', PERMISSIONS.jobsRead],
  ['/system', PERMISSIONS.systemSettingsRead],
];
export function canAccessRoute(path: string, permissions: readonly string[]) {
  if (['/', '/dashboard', '/login'].includes(path)) return true;
  const rule = routes.find(([prefix]) => path === prefix || path.startsWith(prefix + '/'));
  return Boolean(rule && permissions.includes(rule[1]));
}
