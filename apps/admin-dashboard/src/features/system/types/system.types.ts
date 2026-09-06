export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export type JobType =
  | 'SANJESH_IMPORT'
  | 'DATA_QUALITY_SCAN'
  | 'CONTENT_SCHEDULE_PUBLISH'
  | 'USER_EXPORT'
  | 'NOTIFICATION_BROADCAST';
export type AdminSessionStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type LoginAttemptReason =
  'SUCCESS' | 'INVALID_CREDENTIALS' | 'MFA_FAILED' | 'ACCOUNT_SUSPENDED' | 'RATE_LIMITED';
export type SecuritySeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type SecurityEventStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
export type SecurityEventType =
  | 'NEW_ADMIN_DEVICE'
  | 'REPEATED_FAILED_LOGIN'
  | 'MFA_DISABLED'
  | 'SUSPICIOUS_LOGIN'
  | 'IP_BLOCKED'
  | 'SESSION_REVOKED';
export type BlockedIpStatus = 'ACTIVE' | 'EXPIRED';
export type FeatureRolloutStrategy = 'ALL' | 'PERCENTAGE' | 'ADMINS_ONLY';
export type FeatureOwner = 'PRODUCT' | 'DATA' | 'CONTENT' | 'PLATFORM';
export type SettingsSection =
  'GENERAL' | 'AUTHENTICATION' | 'EMAIL' | 'SMS' | 'SEO' | 'BLOG' | 'MAINTENANCE';

export interface ServiceHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  latencyMs?: number;
  uptimePercent?: number;
  message?: string;
  lastCheckedAt: string;
}
export interface BackgroundJob {
  id: string;
  type: JobType;
  title: string;
  status: JobStatus;
  progress?: number;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  triggeredByAdminId?: string;
  relatedEntity?: { type: string; id: string; label: string; href?: string };
  payloadSummary?: string;
  errorMessage?: string;
}
export interface AdminSession {
  id: string;
  adminId: string;
  status: AdminSessionStatus;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  browser: string;
  os: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  ipAddress: string;
  isCurrent: boolean;
}
export interface LoginAttempt {
  id: string;
  email: string;
  successful: boolean;
  reason: LoginAttemptReason;
  ipAddress: string;
  browser: string;
  createdAt: string;
}
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  status: SecurityEventStatus;
  adminId?: string;
  ipAddress?: string;
  titleFa: string;
  descriptionFa: string;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}
export interface BlockedIp {
  id: string;
  ipAddress: string;
  reason: string;
  status: BlockedIpStatus;
  createdAt: string;
  expiresAt?: string;
  createdByAdminId: string;
}
export interface FeatureFlag {
  id: string;
  key: string;
  nameFa: string;
  descriptionFa: string;
  enabled: boolean;
  rollout: { strategy: FeatureRolloutStrategy; percentage?: number };
  owner: FeatureOwner;
  createdAt: string;
  updatedAt: string;
  updatedByAdminId: string;
}
export interface GeneralSettings {
  productName: string;
  defaultLocale: 'fa-IR';
  timezone: 'Asia/Tehran';
  supportEmail: string;
}
export interface AuthenticationSettings {
  adminMfaRequired: boolean;
  adminSessionHours: number;
  userSessionDays: number;
  maxLoginAttempts: number;
  lockoutMinutes: number;
}
export interface EmailSettings {
  enabled: boolean;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
}
export interface SmsSettings {
  enabled: boolean;
  otpEnabled: boolean;
  notificationSmsEnabled: boolean;
}
export interface SeoSettings {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  allowIndexing: boolean;
}
export interface BlogSettings {
  postsPerPage: number;
  commentsEnabled: boolean;
  guestCommentsEnabled: boolean;
  commentsRequireModeration: boolean;
}
export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  allowAdminAccess: boolean;
}
export interface SystemSettings {
  GENERAL: GeneralSettings;
  AUTHENTICATION: AuthenticationSettings;
  EMAIL: EmailSettings;
  SMS: SmsSettings;
  SEO: SeoSettings;
  BLOG: BlogSettings;
  MAINTENANCE: MaintenanceSettings;
}
export interface JobListQuery {
  search?: string;
  status?: JobStatus;
  type?: JobType;
  date?: string;
  page?: number;
  pageSize?: 20 | 50 | 100;
}
export interface LoginAttemptQuery {
  successful?: boolean;
  reason?: LoginAttemptReason;
  date?: string;
}
export interface SecurityEventQuery {
  status?: SecurityEventStatus;
  severity?: SecuritySeverity;
  type?: SecurityEventType;
}
export interface FeatureFlagInput {
  key: string;
  nameFa: string;
  descriptionFa: string;
  enabled: boolean;
  rollout: FeatureFlag['rollout'];
  owner: FeatureOwner;
}
export interface BlockIpInput {
  ipAddress: string;
  reason: string;
  expiresAt?: string;
  confirmCurrent?: boolean;
}
export interface SystemDashboardSummary {
  degradedServiceCount: number;
  criticalSecurityEventCount: number;
  failedJobCount: number;
  activeAlertCount: number;
}
export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export const SYSTEM_PERMISSIONS = {
  healthRead: 'system.health.read',
  jobsRead: 'system.jobs.read',
  jobsRetry: 'system.jobs.retry',
  jobsCancel: 'system.jobs.cancel',
  securityRead: 'system.security.read',
  securityManage: 'system.security.manage',
  flagsRead: 'system.feature_flags.read',
  flagsManage: 'system.feature_flags.manage',
  settingsRead: 'system.settings.read',
  settingsManage: 'system.settings.manage',
} as const;
export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  HEALTHY: 'سالم',
  DEGRADED: 'اختلال جزئی',
  DOWN: 'از دسترس خارج',
  UNKNOWN: 'نامشخص',
};
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  QUEUED: 'در صف',
  RUNNING: 'در حال اجرا',
  SUCCEEDED: 'موفق',
  FAILED: 'ناموفق',
  CANCELLED: 'لغوشده',
};
export const JOB_TYPE_LABELS: Record<JobType, string> = {
  SANJESH_IMPORT: 'ورودی سنجش',
  DATA_QUALITY_SCAN: 'بررسی کیفیت داده',
  CONTENT_SCHEDULE_PUBLISH: 'انتشار زمان‌بندی‌شده',
  USER_EXPORT: 'خروجی کاربران',
  NOTIFICATION_BROADCAST: 'ارسال اعلان عمومی',
};
export class SystemValidationError extends Error {
  readonly fields: Record<string, string>;
  constructor(fields: Record<string, string>) {
    super(Object.values(fields)[0] ?? 'اطلاعات معتبر نیست.');
    this.fields = fields;
    this.name = 'SystemValidationError';
  }
}
