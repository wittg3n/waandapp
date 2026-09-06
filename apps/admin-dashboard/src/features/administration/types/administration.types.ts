export const PERMISSION_KEYS = [
  'dashboard.read',
  'users.read',
  'users.update',
  'users.suspend',
  'users.ban',
  'users.delete',
  'users.verification.reset',
  'users.sessions.revoke',
  'users.export',
  'data.read',
  'data.universities.manage',
  'data.majors.manage',
  'data.programs.manage',
  'data.admissions.manage',
  'data.sources.manage',
  'data.imports.manage',
  'data.imports.commit',
  'data.quality.resolve',
  'data.duplicates.merge',
  'content.read',
  'content.posts.create',
  'content.posts.update',
  'content.posts.publish',
  'content.posts.archive',
  'content.categories.manage',
  'content.tags.manage',
  'content.media.manage',
  'content.comments.moderate',
  'analytics.read',
  'notifications.read',
  'notifications.create',
  'administration.admins.read',
  'administration.admins.create',
  'administration.admins.update',
  'administration.admins.suspend',
  'administration.roles.read',
  'administration.roles.manage',
  'administration.permissions.read',
  'audit.read',
  'system.health.read',
  'system.jobs.read',
  'system.jobs.retry',
  'system.jobs.cancel',
  'system.security.read',
  'system.security.manage',
  'system.feature_flags.read',
  'system.feature_flags.manage',
  'system.settings.read',
  'system.settings.manage',
] as const;

export type CanonicalPermissionKey = (typeof PERMISSION_KEYS)[number];
export type PermissionKey = CanonicalPermissionKey | '*';
export type PermissionGroup =
  | 'DASHBOARD'
  | 'USERS'
  | 'DATA'
  | 'CONTENT'
  | 'ANALYTICS'
  | 'NOTIFICATIONS'
  | 'ADMINISTRATION'
  | 'AUDIT'
  | 'SYSTEM';
export type AdminStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';
export type AuditResult = 'SUCCESS' | 'FAILURE';
export type AuditSource = 'ADMIN_UI' | 'SYSTEM';
export type AuditDomain = 'USER' | 'ADMIN' | 'ROLE' | 'DATA' | 'CONTENT' | 'SYSTEM' | 'SECURITY';
export type AuditAction =
  | 'ADMIN_INVITED'
  | 'ADMIN_INVITATION_REVOKED'
  | 'ADMIN_ROLES_CHANGED'
  | 'ADMIN_SUSPENDED'
  | 'ADMIN_REACTIVATED'
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED'
  | 'USER_BANNED'
  | 'USER_UPDATED'
  | 'USER_SESSION_REVOKED'
  | 'DATA_ENTITY_UPDATED'
  | 'DATA_DUPLICATE_MERGED'
  | 'IMPORT_STARTED'
  | 'IMPORT_COMMITTED'
  | 'QUALITY_ISSUE_RESOLVED'
  | 'POST_CREATED'
  | 'POST_PUBLISHED'
  | 'POST_ARCHIVED'
  | 'COMMENT_MODERATED'
  | 'JOB_RETRIED'
  | 'JOB_CANCELLED'
  | 'SECURITY_EVENT_ACKNOWLEDGED'
  | 'SECURITY_EVENT_RESOLVED'
  | 'IP_BLOCKED'
  | 'IP_UNBLOCKED'
  | 'FEATURE_FLAG_CREATED'
  | 'FEATURE_FLAG_UPDATED'
  | 'SYSTEM_SETTINGS_UPDATED'
  | 'MAINTENANCE_MODE_CHANGED';

export interface Permission {
  key: CanonicalPermissionKey;
  group: PermissionGroup;
  labelFa: string;
  descriptionFa: string;
}
export interface AdminAccount {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  status: AdminStatus;
  roleIds: string[];
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
export interface AdminRole {
  id: string;
  key: string;
  nameFa: string;
  descriptionFa: string;
  isSystem: boolean;
  permissionKeys: PermissionKey[];
  createdAt: string;
  updatedAt: string;
}
export interface AuditEvent {
  id: string;
  occurredAt: string;
  actorAdminId?: string;
  action: AuditAction;
  domain: AuditDomain;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  summaryFa: string;
  result: AuditResult;
  source: AuditSource;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}
export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}
export interface AdminRow extends AdminAccount {
  roles: AdminRole[];
}
export interface RoleRow extends AdminRole {
  adminCount: number;
  permissionCount: number;
}
export interface PermissionRow extends Permission {
  roleCount: number;
}
export interface AdminListQuery {
  search?: string;
  status?: AdminStatus;
  role?: string;
  mfa?: boolean;
  sort?: 'displayName' | 'createdAt' | 'lastLoginAt';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: 20 | 50 | 100;
}
export interface AuditListQuery {
  search?: string;
  actor?: string;
  domain?: AuditDomain;
  action?: AuditAction;
  result?: AuditResult;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: 20 | 50 | 100;
}
export interface InviteAdminInput {
  displayName: string;
  email: string;
  roleIds: string[];
}
export interface UpdateAdminInput {
  displayName: string;
  email: string;
  roleIds: string[];
}
export interface RoleInput {
  key: string;
  nameFa: string;
  descriptionFa: string;
  permissionKeys: CanonicalPermissionKey[];
}

export const ADMIN_PERMISSIONS = {
  adminsRead: 'administration.admins.read',
  adminsCreate: 'administration.admins.create',
  adminsUpdate: 'administration.admins.update',
  adminsSuspend: 'administration.admins.suspend',
  rolesRead: 'administration.roles.read',
  rolesManage: 'administration.roles.manage',
  permissionsRead: 'administration.permissions.read',
  auditRead: 'audit.read',
} as const satisfies Record<string, CanonicalPermissionKey>;

export const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
  ACTIVE: 'فعال',
  INVITED: 'دعوت‌شده',
  SUSPENDED: 'تعلیق‌شده',
};
export const PERMISSION_GROUP_LABELS: Record<PermissionGroup, string> = {
  DASHBOARD: 'داشبورد',
  USERS: 'کاربران',
  DATA: 'داده',
  CONTENT: 'محتوا',
  ANALYTICS: 'تحلیل‌ها',
  NOTIFICATIONS: 'اعلان‌ها',
  ADMINISTRATION: 'مدیریت',
  AUDIT: 'ممیزی',
  SYSTEM: 'سیستم',
};

export class AdministrationValidationError extends Error {
  readonly fields: Record<string, string>;
  constructor(fields: Record<string, string>) {
    super(Object.values(fields)[0] ?? 'اطلاعات معتبر نیست.');
    this.fields = fields;
    this.name = 'AdministrationValidationError';
  }
}
