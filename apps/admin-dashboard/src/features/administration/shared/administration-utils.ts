import type { AuditAction, AuditDomain } from '../types/administration.types';

export const auditActionLabels: Record<AuditAction, string> = {
  ADMIN_INVITED: 'دعوت ادمین',
  ADMIN_INVITATION_REVOKED: 'لغو دعوت ادمین',
  ADMIN_ROLES_CHANGED: 'تغییر نقش‌های ادمین',
  ADMIN_SUSPENDED: 'تعلیق ادمین',
  ADMIN_REACTIVATED: 'فعال‌سازی ادمین',
  ROLE_CREATED: 'ایجاد نقش',
  ROLE_UPDATED: 'ویرایش نقش',
  ROLE_DELETED: 'حذف نقش',
  USER_SUSPENDED: 'تعلیق کاربر',
  USER_REACTIVATED: 'فعال‌سازی کاربر',
  USER_BANNED: 'مسدودسازی کاربر',
  USER_UPDATED: 'ویرایش کاربر',
  USER_SESSION_REVOKED: 'لغو نشست',
  DATA_ENTITY_UPDATED: 'ویرایش داده',
  DATA_DUPLICATE_MERGED: 'ادغام داده تکراری',
  IMPORT_STARTED: 'شروع ورودی',
  IMPORT_COMMITTED: 'ثبت ورودی',
  QUALITY_ISSUE_RESOLVED: 'حل کیفیت داده',
  POST_CREATED: 'ایجاد نوشته',
  POST_PUBLISHED: 'انتشار نوشته',
  POST_ARCHIVED: 'آرشیو نوشته',
  COMMENT_MODERATED: 'مدیریت دیدگاه',
  JOB_RETRIED: 'تلاش مجدد جاب',
  JOB_CANCELLED: 'لغو جاب',
  SECURITY_EVENT_ACKNOWLEDGED: 'تأیید رویداد امنیتی',
  SECURITY_EVENT_RESOLVED: 'حل رویداد امنیتی',
  IP_BLOCKED: 'مسدودسازی IP',
  IP_UNBLOCKED: 'رفع مسدودی IP',
  FEATURE_FLAG_CREATED: 'ایجاد فلگ ویژگی',
  FEATURE_FLAG_UPDATED: 'ویرایش فلگ ویژگی',
  SYSTEM_SETTINGS_UPDATED: 'ویرایش تنظیمات',
  MAINTENANCE_MODE_CHANGED: 'تغییر حالت نگهداری',
};
export const auditDomainLabels: Record<AuditDomain, string> = {
  USER: 'کاربر',
  ADMIN: 'ادمین',
  ROLE: 'نقش',
  DATA: 'داده',
  CONTENT: 'محتوا',
  SYSTEM: 'سیستم',
  SECURITY: 'امنیت',
};
export function auditTargetHref(type?: string, id?: string) {
  if (!type || !id) return undefined;
  if (type === 'ADMIN') return `/administration/admins/${id}`;
  if (type === 'ROLE') return `/administration/roles/${id}`;
  if (type === 'USER') return `/users/${id}`;
  if (type === 'POST') return `/content/posts/${id}`;
  if (type === 'COMMENT') return '/content/comments';
  if (type === 'IMPORT') return `/data/imports/${id}`;
  if (type === 'UNIVERSITY') return `/data/universities/${id}`;
  if (type === 'QUALITY') return '/data/quality';
  if (type === 'JOB') return `/system/jobs/${id}`;
  if (type === 'SECURITY_EVENT' || type === 'BLOCKED_IP') return '/system/security';
  if (type === 'FEATURE_FLAG') return '/system/feature-flags';
  if (type === 'SETTINGS') return '/system/settings';
  return undefined;
}
const sensitive = /password|token|secret|credential|otp|verification.?code/i;
export function safeDisplay(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(safeDisplay);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitive.test(key) ? '[REDACTED]' : safeDisplay(item),
      ]),
    );
  return value;
}
