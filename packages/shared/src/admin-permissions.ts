export const ADMIN_ROLES = [
  'USER',
  'SUPPORT',
  'CONTENT_MANAGER',
  'BLOG_EDITOR',
  'OPERATIONS_ADMIN',
  'ADMIN',
  'SUPER_ADMIN',
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const MACHINE_IDENTITIES = ['SYSTEM', 'SERVICE_ACCOUNT'] as const;
export type MachineIdentity = (typeof MACHINE_IDENTITIES)[number];

export const PERMISSIONS = {
  usersRead: 'users.read',
  usersUpdate: 'users.update',
  usersSuspend: 'users.suspend',
  usersBan: 'users.ban',
  usersSessionsRevoke: 'users.sessions.revoke',
  usersRolesRead: 'users.roles.read',
  usersRolesAssign: 'users.roles.assign',
  applicationsRead: 'applications.read',
  applicationsUpdate: 'applications.update',
  applicationsAssign: 'applications.assign',
  documentsRead: 'documents.read',
  documentsReview: 'documents.review',
  documentsDelete: 'documents.delete',
  educationCountriesRead: 'education.countries.read',
  educationCountriesCreate: 'education.countries.create',
  educationCountriesUpdate: 'education.countries.update',
  educationCountriesArchive: 'education.countries.archive',
  educationUniversitiesRead: 'education.universities.read',
  educationUniversitiesCreate: 'education.universities.create',
  educationUniversitiesUpdate: 'education.universities.update',
  educationUniversitiesPublish: 'education.universities.publish',
  educationProgramsRead: 'education.programs.read',
  educationProgramsCreate: 'education.programs.create',
  educationProgramsUpdate: 'education.programs.update',
  educationProgramsPublish: 'education.programs.publish',
  blogPostsRead: 'blog.posts.read',
  blogPostsCreate: 'blog.posts.create',
  blogPostsUpdate: 'blog.posts.update',
  blogPostsPublish: 'blog.posts.publish',
  blogPostsSchedule: 'blog.posts.schedule',
  blogPostsArchive: 'blog.posts.archive',
  blogPostsDelete: 'blog.posts.delete',
  blogCategoriesRead: 'blog.categories.read',
  blogCategoriesCreate: 'blog.categories.create',
  blogCategoriesUpdate: 'blog.categories.update',
  blogCategoriesDelete: 'blog.categories.delete',
  blogTagsRead: 'blog.tags.read',
  blogTagsCreate: 'blog.tags.create',
  blogTagsUpdate: 'blog.tags.update',
  blogTagsDelete: 'blog.tags.delete',
  blogAuthorsRead: 'blog.authors.read',
  blogAuthorsCreate: 'blog.authors.create',
  blogAuthorsUpdate: 'blog.authors.update',
  blogMediaRead: 'blog.media.read',
  blogMediaUpload: 'blog.media.upload',
  blogMediaUpdate: 'blog.media.update',
  blogMediaDelete: 'blog.media.delete',
  blogCommentsRead: 'blog.comments.read',
  blogCommentsModerate: 'blog.comments.moderate',
  blogSeoUpdate: 'blog.seo.update',
  blogAnalyticsRead: 'blog.analytics.read',
  billingRead: 'billing.read',
  billingRefund: 'billing.refund',
  agentsRead: 'agents.read',
  agentsRetry: 'agents.retry',
  jobsRead: 'jobs.read',
  jobsRetry: 'jobs.retry',
  auditRead: 'audit.read',
  rolesRead: 'roles.read',
  rolesAssign: 'roles.assign',
  systemSettingsRead: 'system.settings.read',
  systemSettingsUpdate: 'system.settings.update',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export const PERMISSION_VALUES = Object.freeze(Object.values(PERMISSIONS)) as readonly Permission[];

const values = <T extends Permission[]>(...permissions: T) => permissions;

const support = values(
  PERMISSIONS.usersRead,
  PERMISSIONS.usersSessionsRevoke,
  PERMISSIONS.usersRolesRead,
);

const education = values(
  PERMISSIONS.educationCountriesRead,
  PERMISSIONS.educationCountriesCreate,
  PERMISSIONS.educationCountriesUpdate,
  PERMISSIONS.educationCountriesArchive,
  PERMISSIONS.educationUniversitiesRead,
  PERMISSIONS.educationUniversitiesCreate,
  PERMISSIONS.educationUniversitiesUpdate,
  PERMISSIONS.educationUniversitiesPublish,
  PERMISSIONS.educationProgramsRead,
  PERMISSIONS.educationProgramsCreate,
  PERMISSIONS.educationProgramsUpdate,
  PERMISSIONS.educationProgramsPublish,
);

const blog = values(
  PERMISSIONS.blogPostsRead,
  PERMISSIONS.blogPostsCreate,
  PERMISSIONS.blogPostsUpdate,
  PERMISSIONS.blogPostsPublish,
  PERMISSIONS.blogPostsSchedule,
  PERMISSIONS.blogPostsArchive,
  PERMISSIONS.blogPostsDelete,
  PERMISSIONS.blogCategoriesRead,
  PERMISSIONS.blogCategoriesCreate,
  PERMISSIONS.blogCategoriesUpdate,
  PERMISSIONS.blogCategoriesDelete,
  PERMISSIONS.blogTagsRead,
  PERMISSIONS.blogTagsCreate,
  PERMISSIONS.blogTagsUpdate,
  PERMISSIONS.blogTagsDelete,
  PERMISSIONS.blogAuthorsRead,
  PERMISSIONS.blogAuthorsCreate,
  PERMISSIONS.blogAuthorsUpdate,
  PERMISSIONS.blogMediaRead,
  PERMISSIONS.blogMediaUpload,
  PERMISSIONS.blogMediaUpdate,
  PERMISSIONS.blogMediaDelete,
  PERMISSIONS.blogCommentsRead,
  PERMISSIONS.blogCommentsModerate,
  PERMISSIONS.blogSeoUpdate,
  PERMISSIONS.blogAnalyticsRead,
);

const operations = values(
  PERMISSIONS.applicationsRead,
  PERMISSIONS.applicationsUpdate,
  PERMISSIONS.applicationsAssign,
  PERMISSIONS.documentsRead,
  PERMISSIONS.documentsReview,
  PERMISSIONS.agentsRead,
  PERMISSIONS.agentsRetry,
  PERMISSIONS.jobsRead,
  PERMISSIONS.jobsRetry,
);

const administrator = values(
  ...support,
  PERMISSIONS.usersUpdate,
  PERMISSIONS.usersSuspend,
  PERMISSIONS.usersBan,
  PERMISSIONS.usersRolesAssign,
  ...education,
  ...blog,
  ...operations,
  PERMISSIONS.documentsDelete,
  PERMISSIONS.billingRead,
  PERMISSIONS.billingRefund,
  PERMISSIONS.auditRead,
  PERMISSIONS.rolesRead,
  PERMISSIONS.rolesAssign,
  PERMISSIONS.systemSettingsRead,
);

export const ROLE_PERMISSIONS: Readonly<Record<AdminRole, readonly Permission[]>> = Object.freeze({
  USER: Object.freeze([]),
  SUPPORT: Object.freeze(support),
  CONTENT_MANAGER: Object.freeze(education),
  BLOG_EDITOR: Object.freeze(blog),
  OPERATIONS_ADMIN: Object.freeze(operations),
  ADMIN: Object.freeze(administrator),
  SUPER_ADMIN: PERMISSION_VALUES,
});

export function permissionsForRoles(roles: readonly AdminRole[]): Permission[] {
  return [...new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? []))];
}

export function hasPermission(roles: readonly AdminRole[], permission: Permission): boolean {
  return roles.includes('SUPER_ADMIN') || permissionsForRoles(roles).includes(permission);
}
