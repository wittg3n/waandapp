import { administrationRepository } from '@/features/administration/repository/administration-repository';
import type { CanonicalPermissionKey } from '@/features/administration/types/administration.types';
import { appendAuditEvent } from '@/features/administration/repository/audit-store';
import { CURRENT_ADMIN_ID } from '@/features/administration/data/administration.seed';
import {
  blockedIpsSeed,
  featureFlagsSeed,
  healthSeed,
  jobsSeed,
  loginAttemptsSeed,
  securityEventsSeed,
  sessionsSeed,
  settingsSeed,
} from '../data/system.seed';
import {
  SystemValidationError,
  type BlockIpInput,
  type FeatureFlagInput,
  type JobListQuery,
  type PageResult,
  type SettingsSection,
  type SystemSettings,
} from '../types/system.types';
import type { SystemRepository } from './system-repository';

const state = {
  health: structuredClone(healthSeed),
  jobs: structuredClone(jobsSeed),
  sessions: structuredClone(sessionsSeed),
  loginAttempts: structuredClone(loginAttemptsSeed),
  securityEvents: structuredClone(securityEventsSeed),
  blockedIps: structuredClone(blockedIpsSeed),
  featureFlags: structuredClone(featureFlagsSeed),
  settings: structuredClone(settingsSeed),
};
let sequence = 100;
const clone = <T>(value: T): T => structuredClone(value);
const delay = (signal?: AbortSignal, ms = 260) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
const required = <T>(value: T | undefined, message: string): T => {
  if (!value) throw new Error(message);
  return value;
};
const paginate = <T>(items: T[], page = 1, pageSize = 20): PageResult<T> => {
  const size = [20, 50, 100].includes(pageSize) ? pageSize : 20;
  const current = Math.max(1, page);
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    pageSize: size,
    total: items.length,
    pageCount: Math.ceil(items.length / size),
  };
};
async function authorize(actorAdminId: string, permission: CanonicalPermissionKey) {
  const permissions = await administrationRepository.getEffectivePermissions(actorAdminId);
  if (!permissions.some((item) => item.key === permission))
    throw new Error('دسترسی انجام این عملیات را ندارید.');
}
const audit = (
  actorAdminId: string,
  action: Parameters<typeof appendAuditEvent>[0]['action'],
  domain: Parameters<typeof appendAuditEvent>[0]['domain'],
  target: { type: string; id: string; label: string },
  summaryFa: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>,
) =>
  appendAuditEvent({
    actorAdminId,
    action,
    domain,
    targetType: target.type,
    targetId: target.id,
    targetLabel: target.label,
    summaryFa,
    result: 'SUCCESS',
    source: 'ADMIN_UI',
    correlationId: `corr_local_${Date.now()}`,
    before,
    after,
  });
const validIp = (value: string) => {
  const parts = value.split('.');
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/u.test(part) && Number(part) >= 0 && Number(part) <= 255)
  );
};
const validateFlag = (input: FeatureFlagInput, currentId?: string) => {
  const fields: Record<string, string> = {};
  const key = input.key.trim();
  if (!/^[a-z][a-z0-9_]*$/u.test(key))
    fields.key = 'کلید باید با حروف کوچک و قالب snake_case باشد.';
  if (state.featureFlags.some((item) => item.id !== currentId && item.key === key))
    fields.key = 'این کلید قبلاً ثبت شده است.';
  if (!input.nameFa.trim()) fields.nameFa = 'نام ویژگی الزامی است.';
  if (
    input.rollout.strategy === 'PERCENTAGE' &&
    (input.rollout.percentage === undefined ||
      input.rollout.percentage < 0 ||
      input.rollout.percentage > 100)
  )
    fields.percentage = 'درصد انتشار باید بین ۰ تا ۱۰۰ باشد.';
  if (input.rollout.strategy !== 'PERCENTAGE' && input.rollout.percentage !== undefined)
    fields.percentage = 'درصد فقط برای انتشار درصدی مجاز است.';
  if (Object.keys(fields).length) throw new SystemValidationError(fields);
};
function validateSettings<K extends SettingsSection>(section: K, input: SystemSettings[K]) {
  const fields: Record<string, string> = {};
  const email = (value: string) => /^\S+@\S+\.\S+$/u.test(value);
  if (section === 'GENERAL') {
    const value = input as SystemSettings['GENERAL'];
    if (!value.productName.trim()) fields.productName = 'نام محصول الزامی است.';
    if (!email(value.supportEmail)) fields.supportEmail = 'ایمیل پشتیبانی معتبر نیست.';
  }
  if (section === 'AUTHENTICATION') {
    const value = input as SystemSettings['AUTHENTICATION'];
    if (value.adminSessionHours < 1 || value.adminSessionHours > 168)
      fields.adminSessionHours = 'مدت نشست ادمین باید بین ۱ تا ۱۶۸ ساعت باشد.';
    if (value.userSessionDays < 1 || value.userSessionDays > 90)
      fields.userSessionDays = 'مدت نشست کاربر باید بین ۱ تا ۹۰ روز باشد.';
    if (value.maxLoginAttempts < 3 || value.maxLoginAttempts > 20)
      fields.maxLoginAttempts = 'تعداد تلاش ورود باید بین ۳ تا ۲۰ باشد.';
    if (value.lockoutMinutes < 1 || value.lockoutMinutes > 1440)
      fields.lockoutMinutes = 'زمان قفل باید بین ۱ تا ۱۴۴۰ دقیقه باشد.';
  }
  if (section === 'EMAIL') {
    const value = input as SystemSettings['EMAIL'];
    if (!value.senderName.trim()) fields.senderName = 'نام فرستنده الزامی است.';
    if (!email(value.senderEmail)) fields.senderEmail = 'ایمیل فرستنده معتبر نیست.';
    if (!email(value.replyToEmail)) fields.replyToEmail = 'ایمیل پاسخ معتبر نیست.';
  }
  if (section === 'SEO') {
    const value = input as SystemSettings['SEO'];
    if (value.defaultTitle.length > 60)
      fields.defaultTitle = 'عنوان پیش‌فرض نباید بیشتر از ۶۰ نویسه باشد.';
    if (value.defaultDescription.length > 160)
      fields.defaultDescription = 'توضیح پیش‌فرض نباید بیشتر از ۱۶۰ نویسه باشد.';
  }
  if (section === 'BLOG') {
    const value = input as SystemSettings['BLOG'];
    if (value.postsPerPage < 6 || value.postsPerPage > 50)
      fields.postsPerPage = 'تعداد نوشته در صفحه باید بین ۶ تا ۵۰ باشد.';
  }
  if (section === 'MAINTENANCE') {
    const value = input as SystemSettings['MAINTENANCE'];
    if (value.enabled && !value.message.trim()) fields.message = 'پیام حالت نگهداری الزامی است.';
  }
  if (Object.keys(fields).length) throw new SystemValidationError(fields);
}

export const localSystemRepository: SystemRepository = {
  async getHealth(signal) {
    await delay(signal);
    return clone(state.health);
  },
  async getDashboardSummary(signal) {
    await delay(signal);
    const degradedServiceCount = state.health.filter((item) => item.status === 'DEGRADED').length;
    const criticalSecurityEventCount = state.securityEvents.filter(
      (item) => item.severity === 'CRITICAL' && item.status !== 'RESOLVED',
    ).length;
    const failedJobCount = state.jobs.filter((item) => item.status === 'FAILED').length;
    return {
      degradedServiceCount,
      criticalSecurityEventCount,
      failedJobCount,
      activeAlertCount: degradedServiceCount + criticalSecurityEventCount + failedJobCount,
    };
  },
  async listJobs(query: JobListQuery, signal) {
    await delay(signal);
    let items = clone(state.jobs);
    const search = query.search?.trim().toLocaleLowerCase('fa-IR');
    if (search)
      items = items.filter((item) =>
        `${item.title} ${item.id}`.toLocaleLowerCase('fa-IR').includes(search),
      );
    if (query.status) items = items.filter((item) => item.status === query.status);
    if (query.type) items = items.filter((item) => item.type === query.type);
    if (query.date) items = items.filter((item) => item.createdAt.startsWith(query.date!));
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return paginate(items, query.page, query.pageSize);
  },
  async getJob(id, signal) {
    await delay(signal);
    return clone(state.jobs.find((item) => item.id === id) ?? null);
  },
  async retryJob(id, actorAdminId = CURRENT_ADMIN_ID) {
    await authorize(actorAdminId, 'system.jobs.retry');
    await delay();
    const job = required(
      state.jobs.find((item) => item.id === id),
      'جاب موردنظر پیدا نشد.',
    );
    if (job.status !== 'FAILED') throw new Error('فقط جاب ناموفق قابل تلاش مجدد است.');
    if (job.attempts >= job.maxAttempts)
      throw new Error('حداکثر تعداد تلاش این جاب تکمیل شده است.');
    const before = { status: job.status, attempts: job.attempts };
    job.attempts += 1;
    job.status = 'RUNNING';
    job.progress = 15;
    job.startedAt = new Date().toISOString();
    job.completedAt = undefined;
    job.errorMessage = undefined;
    await delay(undefined, 320);
    job.status = 'SUCCEEDED';
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    audit(
      actorAdminId,
      'JOB_RETRIED',
      'SYSTEM',
      { type: 'JOB', id: job.id, label: job.title },
      'جاب ناموفق دوباره اجرا شد',
      before,
      { status: job.status, attempts: job.attempts },
    );
    return clone(job);
  },
  async cancelJob(id, actorAdminId = CURRENT_ADMIN_ID) {
    await authorize(actorAdminId, 'system.jobs.cancel');
    await delay();
    const job = required(
      state.jobs.find((item) => item.id === id),
      'جاب موردنظر پیدا نشد.',
    );
    if (job.status !== 'QUEUED' && job.status !== 'RUNNING')
      throw new Error('فقط جاب در صف یا در حال اجرا قابل لغو است.');
    const before = { status: job.status };
    job.status = 'CANCELLED';
    job.completedAt = new Date().toISOString();
    audit(
      actorAdminId,
      'JOB_CANCELLED',
      'SYSTEM',
      { type: 'JOB', id: job.id, label: job.title },
      'جاب لغو شد',
      before,
      { status: job.status },
    );
    return clone(job);
  },
  async listAdminSessions(signal) {
    await delay(signal);
    return clone(state.sessions);
  },
  async revokeSession(id, actorAdminId = CURRENT_ADMIN_ID, confirmCurrent = false) {
    await authorize(actorAdminId, 'system.security.manage');
    await delay();
    const session = required(
      state.sessions.find((item) => item.id === id),
      'نشست موردنظر پیدا نشد.',
    );
    if (session.status !== 'ACTIVE') throw new Error('این نشست فعال نیست.');
    if (session.isCurrent && !confirmCurrent)
      throw new Error('لغو نشست جاری به تأیید جداگانه نیاز دارد.');
    session.status = 'REVOKED';
    audit(
      actorAdminId,
      'USER_SESSION_REVOKED',
      'SECURITY',
      { type: 'ADMIN_SESSION', id: session.id, label: `نشست ${session.adminId}` },
      'نشست ادمین لغو شد',
      { status: 'ACTIVE' },
      { status: 'REVOKED' },
    );
    return clone(session);
  },
  async revokeAllSessions(adminId, actorAdminId = CURRENT_ADMIN_ID, includeCurrent = false) {
    await authorize(actorAdminId, 'system.security.manage');
    await delay();
    const targets = state.sessions.filter(
      (item) =>
        item.adminId === adminId && item.status === 'ACTIVE' && (includeCurrent || !item.isCurrent),
    );
    targets.forEach((item) => {
      item.status = 'REVOKED';
    });
    if (targets.length)
      audit(
        actorAdminId,
        'USER_SESSION_REVOKED',
        'SECURITY',
        { type: 'ADMIN', id: adminId, label: `نشست‌های ${adminId}` },
        'نشست‌های ادمین لغو شدند',
        undefined,
        { count: targets.length, includeCurrent },
      );
    return targets.length;
  },
  async listLoginAttempts(query, signal) {
    await delay(signal);
    let items = clone(state.loginAttempts);
    if (query.successful !== undefined)
      items = items.filter((item) => item.successful === query.successful);
    if (query.reason) items = items.filter((item) => item.reason === query.reason);
    if (query.date) items = items.filter((item) => item.createdAt.startsWith(query.date!));
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async listSecurityEvents(query, signal) {
    await delay(signal);
    let items = clone(state.securityEvents);
    if (query.status) items = items.filter((item) => item.status === query.status);
    if (query.severity) items = items.filter((item) => item.severity === query.severity);
    if (query.type) items = items.filter((item) => item.type === query.type);
    return items.sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
  },
  async acknowledgeSecurityEvent(id, actorAdminId = CURRENT_ADMIN_ID) {
    await authorize(actorAdminId, 'system.security.manage');
    await delay();
    const event = required(
      state.securityEvents.find((item) => item.id === id),
      'رویداد امنیتی پیدا نشد.',
    );
    if (event.status !== 'OPEN') throw new Error('فقط رویداد باز قابل تأیید است.');
    event.status = 'ACKNOWLEDGED';
    event.acknowledgedAt = new Date().toISOString();
    audit(
      actorAdminId,
      'SECURITY_EVENT_ACKNOWLEDGED',
      'SECURITY',
      { type: 'SECURITY_EVENT', id: event.id, label: event.titleFa },
      'رویداد امنیتی تأیید شد',
      { status: 'OPEN' },
      { status: event.status },
    );
    return clone(event);
  },
  async resolveSecurityEvent(id, actorAdminId = CURRENT_ADMIN_ID) {
    await authorize(actorAdminId, 'system.security.manage');
    await delay();
    const event = required(
      state.securityEvents.find((item) => item.id === id),
      'رویداد امنیتی پیدا نشد.',
    );
    if (event.status === 'RESOLVED') throw new Error('این رویداد قبلاً حل شده است.');
    event.status = 'RESOLVED';
    event.resolvedAt = new Date().toISOString();
    audit(
      actorAdminId,
      'SECURITY_EVENT_RESOLVED',
      'SECURITY',
      { type: 'SECURITY_EVENT', id: event.id, label: event.titleFa },
      'رویداد امنیتی حل شد',
      undefined,
      { status: event.status },
    );
    return clone(event);
  },
  async listBlockedIps(signal) {
    await delay(signal);
    return clone(state.blockedIps);
  },
  async blockIp(input: BlockIpInput, actorAdminId = CURRENT_ADMIN_ID) {
    await authorize(actorAdminId, 'system.security.manage');
    await delay();
    const ip = input.ipAddress.trim();
    const fields: Record<string, string> = {};
    if (!validIp(ip)) fields.ipAddress = 'نشانی IPv4 معتبر نیست.';
    if (!input.reason.trim()) fields.reason = 'دلیل مسدودسازی الزامی است.';
    if (state.blockedIps.some((item) => item.ipAddress === ip && item.status === 'ACTIVE'))
      fields.ipAddress = 'این نشانی هم‌اکنون مسدود است.';
    const currentIp = state.sessions.find(
      (item) => item.isCurrent && item.status === 'ACTIVE',
    )?.ipAddress;
    if (ip === currentIp && !input.confirmCurrent)
      fields.ipAddress = 'مسدودسازی IP نشست جاری به تأیید جداگانه نیاز دارد.';
    if (Object.keys(fields).length) throw new SystemValidationError(fields);
    const block = {
      id: `ip_${++sequence}`,
      ipAddress: ip,
      reason: input.reason.trim(),
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt || undefined,
      createdByAdminId: actorAdminId,
    };
    state.blockedIps.unshift(block);
    audit(
      actorAdminId,
      'IP_BLOCKED',
      'SECURITY',
      { type: 'BLOCKED_IP', id: block.id, label: block.ipAddress },
      'نشانی IP مسدود شد',
      undefined,
      { ipAddress: block.ipAddress, reason: block.reason, expiresAt: block.expiresAt },
    );
    return clone(block);
  },
  async unblockIp(id, actorAdminId = CURRENT_ADMIN_ID) {
    await authorize(actorAdminId, 'system.security.manage');
    await delay();
    const block = required(
      state.blockedIps.find((item) => item.id === id),
      'نشانی مسدودشده پیدا نشد.',
    );
    if (block.status !== 'ACTIVE') throw new Error('این نشانی مسدود فعال نیست.');
    block.status = 'EXPIRED';
    audit(
      actorAdminId,
      'IP_UNBLOCKED',
      'SECURITY',
      { type: 'BLOCKED_IP', id: block.id, label: block.ipAddress },
      'مسدودسازی IP لغو شد',
      { status: 'ACTIVE' },
      { status: 'EXPIRED' },
    );
    return clone(block);
  },
  async listFeatureFlags(signal) {
    await delay(signal);
    return clone(state.featureFlags).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async createFeatureFlag(input, actorAdminId = CURRENT_ADMIN_ID, confirmAll = false) {
    await authorize(actorAdminId, 'system.feature_flags.manage');
    await delay();
    validateFlag(input);
    if (input.enabled && input.rollout.strategy === 'ALL' && !confirmAll)
      throw new Error('فعال‌سازی برای همه کاربران به تأیید نیاز دارد.');
    const timestamp = new Date().toISOString();
    const flag = {
      ...clone(input),
      rollout:
        input.rollout.strategy === 'PERCENTAGE'
          ? clone(input.rollout)
          : { strategy: input.rollout.strategy },
      id: `flag_${++sequence}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedByAdminId: actorAdminId,
    };
    state.featureFlags.unshift(flag);
    audit(
      actorAdminId,
      'FEATURE_FLAG_CREATED',
      'SYSTEM',
      { type: 'FEATURE_FLAG', id: flag.id, label: flag.nameFa },
      'فلگ ویژگی ایجاد شد',
      undefined,
      { key: flag.key, enabled: flag.enabled, rollout: flag.rollout, owner: flag.owner },
    );
    return clone(flag);
  },
  async updateFeatureFlag(id, input, actorAdminId = CURRENT_ADMIN_ID, confirmAll = false) {
    await authorize(actorAdminId, 'system.feature_flags.manage');
    await delay();
    const flag = required(
      state.featureFlags.find((item) => item.id === id),
      'فلگ ویژگی پیدا نشد.',
    );
    const value = { ...input, key: flag.key };
    validateFlag(value, id);
    const affectsAll =
      (flag.enabled && flag.rollout.strategy === 'ALL') ||
      (input.enabled &&
        input.rollout.strategy === 'ALL' &&
        (!flag.enabled || flag.rollout.strategy !== 'ALL'));
    if (affectsAll && !confirmAll)
      throw new Error('تغییر فلگ فعال برای همه کاربران به تأیید نیاز دارد.');
    const before = {
      enabled: flag.enabled,
      rollout: clone(flag.rollout),
      nameFa: flag.nameFa,
      descriptionFa: flag.descriptionFa,
      owner: flag.owner,
    };
    Object.assign(flag, clone(input), {
      rollout:
        input.rollout.strategy === 'PERCENTAGE'
          ? clone(input.rollout)
          : { strategy: input.rollout.strategy },
      updatedAt: new Date().toISOString(),
      updatedByAdminId: actorAdminId,
    });
    audit(
      actorAdminId,
      'FEATURE_FLAG_UPDATED',
      'SYSTEM',
      { type: 'FEATURE_FLAG', id: flag.id, label: flag.nameFa },
      'فلگ ویژگی به‌روزرسانی شد',
      before,
      {
        enabled: flag.enabled,
        rollout: flag.rollout,
        nameFa: flag.nameFa,
        descriptionFa: flag.descriptionFa,
        owner: flag.owner,
      },
    );
    return clone(flag);
  },
  async getSettings(signal) {
    await delay(signal);
    return clone(state.settings);
  },
  async updateSettings<K extends SettingsSection>(
    section: K,
    input: SystemSettings[K],
    actorAdminId = CURRENT_ADMIN_ID,
    confirmMaintenance = false,
  ) {
    await authorize(actorAdminId, 'system.settings.manage');
    await delay();
    validateSettings(section, input);
    if (section === 'MAINTENANCE') {
      const current = state.settings.MAINTENANCE;
      const next = input as SystemSettings['MAINTENANCE'];
      if (next.enabled && !current.enabled && !confirmMaintenance)
        throw new Error('فعال‌سازی حالت نگهداری به تأیید نیاز دارد.');
    }
    const before = clone(state.settings[section]);
    state.settings[section] = clone(input) as SystemSettings[K];
    const action =
      section === 'MAINTENANCE' &&
      Boolean((before as SystemSettings['MAINTENANCE']).enabled) !==
        Boolean((input as SystemSettings['MAINTENANCE']).enabled)
        ? 'MAINTENANCE_MODE_CHANGED'
        : 'SYSTEM_SETTINGS_UPDATED';
    audit(
      actorAdminId,
      action,
      'SYSTEM',
      { type: 'SETTINGS', id: section, label: section },
      section === 'MAINTENANCE' ? 'حالت نگهداری تغییر کرد' : 'تنظیمات سیستم به‌روزرسانی شد',
      before as unknown as Record<string, unknown>,
      input as unknown as Record<string, unknown>,
    );
    return clone(state.settings[section]);
  },
};

export function validateSystemGraph() {
  const adminIds = new Set([
    'adm_001',
    'adm_002',
    'adm_003',
    'adm_004',
    'adm_005',
    'adm_006',
    'adm_007',
    'adm_008',
    'adm_009',
    'adm_010',
  ]);
  return {
    jobsValid: state.jobs.every(
      (job) => !job.triggeredByAdminId || adminIds.has(job.triggeredByAdminId),
    ),
    sessionsValid: state.sessions.every((session) => adminIds.has(session.adminId)),
    securityValid: state.securityEvents.every(
      (event) => !event.adminId || adminIds.has(event.adminId),
    ),
    blockedIpsValid: state.blockedIps.every((item) => adminIds.has(item.createdByAdminId)),
    flagsValid: state.featureFlags.every((item) => adminIds.has(item.updatedByAdminId)),
    uniqueFlagKeys:
      new Set(state.featureFlags.map((item) => item.key)).size === state.featureFlags.length,
    counts: {
      services: state.health.length,
      jobs: state.jobs.length,
      sessions: state.sessions.length,
      attempts: state.loginAttempts.length,
      securityEvents: state.securityEvents.length,
      blockedIps: state.blockedIps.length,
      flags: state.featureFlags.length,
    },
  };
}
