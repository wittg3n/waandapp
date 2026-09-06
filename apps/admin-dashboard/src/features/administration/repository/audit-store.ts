import type { AuditAction, AuditEvent } from '../types/administration.types';

const actions: Array<[AuditAction, AuditEvent['domain'], string, string, string]> = [
  ['ADMIN_INVITED', 'ADMIN', 'دعوت ادمین ثبت شد', 'ADMIN', 'adm_010'],
  ['ADMIN_ROLES_CHANGED', 'ADMIN', 'نقش‌های ادمین تغییر کرد', 'ADMIN', 'adm_003'],
  ['USER_SUSPENDED', 'USER', 'کاربر عادی تعلیق شد', 'USER', '000000000000000000000004'],
  ['USER_SESSION_REVOKED', 'USER', 'نشست‌های کاربر لغو شد', 'USER', '000000000000000000000006'],
  ['IMPORT_STARTED', 'DATA', 'ورودی سنجش آغاز شد', 'IMPORT', 'import-math-1404'],
  ['QUALITY_ISSUE_RESOLVED', 'DATA', 'مسئله کیفیت داده حل شد', 'QUALITY', 'issue-001'],
  ['POST_PUBLISHED', 'CONTENT', 'نوشته وبلاگ منتشر شد', 'POST', 'post-001'],
  ['COMMENT_MODERATED', 'CONTENT', 'دیدگاه وبلاگ مدیریت شد', 'COMMENT', 'comment-001'],
  ['JOB_RETRIED', 'SYSTEM', 'جاب شکست‌خورده دوباره اجرا شد', 'JOB', 'job_006'],
  [
    'SECURITY_EVENT_ACKNOWLEDGED',
    'SECURITY',
    'رویداد امنیتی تأیید دریافت شد',
    'SECURITY_EVENT',
    'sec_002',
  ],
  ['FEATURE_FLAG_UPDATED', 'SYSTEM', 'فلگ ویژگی به‌روزرسانی شد', 'FEATURE_FLAG', 'flag_003'],
  [
    'SYSTEM_SETTINGS_UPDATED',
    'SYSTEM',
    'تنظیمات احراز هویت تغییر کرد',
    'SETTINGS',
    'AUTHENTICATION',
  ],
  ['ADMIN_SUSPENDED', 'ADMIN', 'حساب ادمین تعلیق شد', 'ADMIN', 'adm_009'],
  ['ADMIN_REACTIVATED', 'ADMIN', 'حساب ادمین دوباره فعال شد', 'ADMIN', 'adm_004'],
  ['ROLE_UPDATED', 'ROLE', 'دسترسی‌های نقش ویرایش شد', 'ROLE', 'SUPPORT'],
  ['USER_UPDATED', 'USER', 'اطلاعات کاربر ویرایش شد', 'USER', '000000000000000000000002'],
  ['USER_BANNED', 'USER', 'حساب کاربر مسدود شد', 'USER', '000000000000000000000005'],
  ['DATA_ENTITY_UPDATED', 'DATA', 'اطلاعات دانشگاه ویرایش شد', 'UNIVERSITY', 'uni-ut'],
  [
    'DATA_DUPLICATE_MERGED',
    'DATA',
    'رکوردهای دانشگاه تکراری ادغام شدند',
    'UNIVERSITY',
    'uni-ut-duplicate',
  ],
  ['IMPORT_COMMITTED', 'DATA', 'ورودی داده ثبت نهایی شد', 'IMPORT', 'import-math-1404'],
  ['POST_CREATED', 'CONTENT', 'پیش‌نویس نوشته ایجاد شد', 'POST', 'post-002'],
  ['POST_ARCHIVED', 'CONTENT', 'نوشته وبلاگ آرشیو شد', 'POST', 'post-006'],
  ['JOB_CANCELLED', 'SYSTEM', 'جاب صف لغو شد', 'JOB', 'job_003'],
  ['SECURITY_EVENT_RESOLVED', 'SECURITY', 'رویداد امنیتی حل شد', 'SECURITY_EVENT', 'sec_003'],
  ['IP_BLOCKED', 'SECURITY', 'نشانی IP مسدود شد', 'BLOCKED_IP', 'ip_001'],
  ['MAINTENANCE_MODE_CHANGED', 'SYSTEM', 'حالت نگهداری تغییر کرد', 'SETTINGS', 'MAINTENANCE'],
];

const targetLabel = (type: string, id: string) =>
  type === 'ADMIN'
    ? `ادمین ${id}`
    : type === 'USER'
      ? `کاربر ${id.slice(-4)}`
      : type === 'POST'
        ? `نوشته ${id}`
        : type === 'IMPORT'
          ? 'ورودی سنجش ۱۴۰۴'
          : id;
const events: AuditEvent[] = actions.map(
  ([action, domain, summaryFa, targetType, targetId], index) => ({
    id: `audit_${String(index + 1).padStart(3, '0')}`,
    occurredAt: `2026-08-${String(28 - (index % 24)).padStart(2, '0')}T${String(8 + (index % 10)).padStart(2, '0')}:15:00.000Z`,
    actorAdminId: index % 7 === 0 ? undefined : `adm_${String((index % 8) + 1).padStart(3, '0')}`,
    action,
    domain,
    targetType,
    targetId,
    targetLabel: targetLabel(targetType, targetId),
    summaryFa,
    result: 'SUCCESS',
    source: index % 7 === 0 ? 'SYSTEM' : 'ADMIN_UI',
    correlationId: `corr_${String(index + 1).padStart(4, '0')}`,
    metadata: { channel: 'local_repository', requestId: `req_${index + 1}` },
  }),
);
let sequence = 1000;
const sensitive = /password|token|secret|credential|otp|verification.?code/i;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitive.test(key) ? '[REDACTED]' : sanitize(item),
      ]),
    );
  return value;
}

export function appendAuditEvent(
  event: Omit<AuditEvent, 'id' | 'occurredAt'> & { occurredAt?: string },
) {
  const next: AuditEvent = {
    ...event,
    id: `audit_${++sequence}`,
    occurredAt: event.occurredAt ?? new Date().toISOString(),
    metadata: sanitize(event.metadata) as Record<string, unknown> | undefined,
    before: sanitize(event.before) as Record<string, unknown> | undefined,
    after: sanitize(event.after) as Record<string, unknown> | undefined,
  };
  events.unshift(next);
  return structuredClone(next);
}

export function readAuditEvents() {
  return structuredClone(events);
}
export function readAuditEvent(id: string) {
  return structuredClone(events.find((item) => item.id === id) ?? null);
}
