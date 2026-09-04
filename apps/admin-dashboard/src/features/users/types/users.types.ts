export type UserStatus = 'pending_verification' | 'active' | 'suspended' | 'banned' | 'deleted';
export type UserStatusAction = 'active' | 'suspended' | 'banned';

export type UserPermission =
  | 'users.read'
  | 'users.update'
  | 'users.suspend'
  | 'users.ban'
  | 'users.sessions.revoke'
  | 'audit.read';

export const USER_PERMISSIONS = {
  read: 'users.read',
  update: 'users.update',
  suspend: 'users.suspend',
  ban: 'users.ban',
  sessionsRevoke: 'users.sessions.revoke',
  auditRead: 'audit.read',
} as const satisfies Record<string, UserPermission>;

export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: 'applicant';
  adminRoles: [];
  permissions: [];
  status: UserStatus;
  profileCompletion: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantProfile {
  id: string;
  currentDegree: string;
  educationCountryCode: 'IR';
  fieldId: string;
  universityId: string;
  studyStatus: string;
  gradeAverage: number;
  gradeScale: string;
  targetFieldId: string;
  targetDegree: string;
  targetCountries: string[];
  intake: { term: string; year: number | null };
  hasLanguageCertificate: boolean;
  languageCertificates: Array<{ type: string; score?: number; level?: string; testDate?: string }>;
  annualBudget: string;
  scholarshipImportance: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends ManagedUser {
  profile: ApplicantProfile | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface UsersResult {
  items: ManagedUser[];
  pagination: Pagination;
}

export interface AdminSessionUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'applicant' | 'staff' | 'admin';
  adminRoles: string[];
  permissions: string[];
  status: UserStatus;
}

export interface AdminSession {
  user: AdminSessionUser | null;
}

export interface UserAuditEntry {
  id: string;
  actorUserId: string | null;
  actorType: 'USER' | 'SYSTEM';
  actor: { firstName: string; lastName: string; username: string } | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  createdAt: string;
}

export interface UserAuditResult {
  items: UserAuditEntry[];
  pagination: Pagination;
}

export type UserSortField = 'createdAt' | 'lastLoginAt' | 'firstName' | 'email' | 'status';
export type SortOrder = 'asc' | 'desc';
