import {
  adminsSeed,
  CURRENT_ADMIN_ID,
  permissionsSeed,
  rolesSeed,
} from '../data/administration.seed';
import {
  AdministrationValidationError,
  PERMISSION_KEYS,
  type AdminAccount,
  type AdminRole,
  type CanonicalPermissionKey,
  type InviteAdminInput,
  type PageResult,
  type UpdateAdminInput,
} from '../types/administration.types';
import { appendAuditEvent, readAuditEvent, readAuditEvents } from './audit-store';
import type { AdministrationRepository } from './administration-repository';

const state = { admins: structuredClone(adminsSeed), roles: structuredClone(rolesSeed) };
let sequence = 100;
const clone = <T>(value: T): T => structuredClone(value);
const delay = (signal?: AbortSignal, ms = 240) =>
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
const roleById = (id: string) =>
  required(
    state.roles.find((item) => item.id === id),
    'نقش موردنظر پیدا نشد.',
  );
const adminById = (id: string) =>
  required(
    state.admins.find((item) => item.id === id),
    'ادمین موردنظر پیدا نشد.',
  );
const effectiveKeys = (admin: AdminAccount) => {
  const grants = admin.roleIds.flatMap((id) => roleById(id).permissionKeys);
  return grants.includes('*')
    ? [...PERMISSION_KEYS]
    : ([...new Set(grants)] as CanonicalPermissionKey[]);
};
const has = (actorId: string, permission: CanonicalPermissionKey) =>
  effectiveKeys(adminById(actorId)).includes(permission);
const authorize = (actorId: string, permission: CanonicalPermissionKey) => {
  if (!has(actorId, permission)) throw new Error('دسترسی انجام این عملیات را ندارید.');
};
const isPlatform = (admin: AdminAccount) =>
  admin.roleIds.includes('PLATFORM_ADMIN') && !admin.roleIds.includes('SUPER_ADMIN');
const isSuper = (admin: AdminAccount) => admin.roleIds.includes('SUPER_ADMIN');
const activeSupers = () =>
  state.admins.filter((admin) => admin.status === 'ACTIVE' && isSuper(admin));
const validateRoles = (roleIds: string[]) => {
  const fields: Record<string, string> = {};
  if (!roleIds.length) fields.roleIds = 'حداقل یک نقش الزامی است.';
  if (roleIds.some((id) => !state.roles.some((role) => role.id === id)))
    fields.roleIds = 'یکی از نقش‌های انتخاب‌شده معتبر نیست.';
  if (Object.keys(fields).length) throw new AdministrationValidationError(fields);
};
const validateAdmin = (input: InviteAdminInput | UpdateAdminInput, currentId?: string) => {
  const fields: Record<string, string> = {};
  const name = input.displayName.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) fields.displayName = 'نام نمایشی الزامی است.';
  if (!/^\S+@\S+\.\S+$/u.test(email)) fields.email = 'ایمیل معتبر الزامی است.';
  if (state.admins.some((item) => item.id !== currentId && item.email.toLowerCase() === email))
    fields.email = 'این ایمیل قبلاً ثبت شده است.';
  validateRoles(input.roleIds);
  if (Object.keys(fields).length) throw new AdministrationValidationError(fields);
  return { displayName: name, email, roleIds: [...new Set(input.roleIds)] };
};
const protectSuper = (actor: AdminAccount, target: AdminAccount, nextRoles?: string[]) => {
  if (isPlatform(actor) && isSuper(target))
    throw new Error('مدیر پلتفرم نمی‌تواند حساب مدیر ارشد را تغییر دهد.');
  if (isPlatform(actor) && nextRoles?.includes('SUPER_ADMIN'))
    throw new Error('مدیر پلتفرم نمی‌تواند نقش مدیر ارشد اختصاص دهد.');
  if (target.id === actor.id && isSuper(target) && nextRoles && !nextRoles.includes('SUPER_ADMIN'))
    throw new Error('نمی‌توانید نقش مدیر ارشد خود را حذف کنید.');
  if (
    isSuper(target) &&
    nextRoles &&
    !nextRoles.includes('SUPER_ADMIN') &&
    target.status === 'ACTIVE' &&
    activeSupers().length === 1
  )
    throw new Error('آخرین مدیر ارشد فعال نمی‌تواند نقش مدیر ارشد را از دست بدهد.');
};
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

export const localAdministrationRepository: AdministrationRepository = {
  async listAdmins(query, signal) {
    await delay(signal);
    let items = state.admins.map((admin) => ({
      ...clone(admin),
      roles: clone(state.roles.filter((role) => admin.roleIds.includes(role.id))),
    }));
    const search = query.search?.trim().toLocaleLowerCase('fa-IR');
    if (search)
      items = items.filter((item) =>
        `${item.displayName} ${item.email}`.toLocaleLowerCase('fa-IR').includes(search),
      );
    if (query.status) items = items.filter((item) => item.status === query.status);
    if (query.role) items = items.filter((item) => item.roleIds.includes(query.role!));
    if (query.mfa !== undefined) items = items.filter((item) => item.mfaEnabled === query.mfa);
    const sort = query.sort ?? 'createdAt';
    const direction = query.order === 'asc' ? 1 : -1;
    items.sort(
      (a, b) => String(a[sort] ?? '').localeCompare(String(b[sort] ?? ''), 'fa') * direction,
    );
    return paginate(items, query.page, query.pageSize);
  },
  async getAdmin(id, signal) {
    await delay(signal);
    return clone(state.admins.find((item) => item.id === id) ?? null);
  },
  async inviteAdmin(input, actorAdminId = CURRENT_ADMIN_ID) {
    await delay();
    authorize(actorAdminId, 'administration.admins.create');
    const value = validateAdmin(input);
    const actor = adminById(actorAdminId);
    if (isPlatform(actor) && value.roleIds.includes('SUPER_ADMIN'))
      throw new Error('مدیر پلتفرم نمی‌تواند مدیر ارشد ایجاد کند.');
    const timestamp = new Date().toISOString();
    const admin: AdminAccount = {
      id: `adm_${String(++sequence).padStart(3, '0')}`,
      ...value,
      status: 'INVITED',
      mfaEnabled: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    state.admins.unshift(admin);
    audit(
      actorAdminId,
      'ADMIN_INVITED',
      'ADMIN',
      { type: 'ADMIN', id: admin.id, label: admin.displayName },
      'دعوت ادمین ثبت شد',
      undefined,
      { email: admin.email, roleIds: admin.roleIds },
    );
    return clone(admin);
  },
  async updateAdmin(id, input, actorAdminId = CURRENT_ADMIN_ID) {
    await delay();
    authorize(actorAdminId, 'administration.admins.update');
    const target = adminById(id);
    const actor = adminById(actorAdminId);
    const value = validateAdmin(input, id);
    protectSuper(actor, target, value.roleIds);
    const before = {
      displayName: target.displayName,
      email: target.email,
      roleIds: [...target.roleIds],
    };
    Object.assign(target, value, { updatedAt: new Date().toISOString() });
    audit(
      actorAdminId,
      'ADMIN_ROLES_CHANGED',
      'ADMIN',
      { type: 'ADMIN', id, label: target.displayName },
      'اطلاعات و نقش‌های ادمین تغییر کرد',
      before,
      { displayName: target.displayName, email: target.email, roleIds: target.roleIds },
    );
    return clone(target);
  },
  async suspendAdmin(id, actorAdminId = CURRENT_ADMIN_ID) {
    await delay();
    authorize(actorAdminId, 'administration.admins.suspend');
    const target = adminById(id);
    const actor = adminById(actorAdminId);
    if (id === actorAdminId) throw new Error('نمی‌توانید حساب مدیریتی خود را تعلیق کنید.');
    protectSuper(actor, target);
    if (target.status !== 'ACTIVE') throw new Error('فقط ادمین فعال قابل تعلیق است.');
    if (isSuper(target) && activeSupers().length === 1)
      throw new Error('آخرین مدیر ارشد فعال قابل تعلیق نیست.');
    target.status = 'SUSPENDED';
    target.updatedAt = new Date().toISOString();
    audit(
      actorAdminId,
      'ADMIN_SUSPENDED',
      'ADMIN',
      { type: 'ADMIN', id, label: target.displayName },
      'حساب ادمین تعلیق شد',
      { status: 'ACTIVE' },
      { status: 'SUSPENDED' },
    );
    return clone(target);
  },
  async reactivateAdmin(id, actorAdminId = CURRENT_ADMIN_ID) {
    await delay();
    authorize(actorAdminId, 'administration.admins.suspend');
    const target = adminById(id);
    protectSuper(adminById(actorAdminId), target);
    if (target.status !== 'SUSPENDED') throw new Error('فقط ادمین تعلیق‌شده قابل فعال‌سازی است.');
    target.status = 'ACTIVE';
    target.updatedAt = new Date().toISOString();
    audit(
      actorAdminId,
      'ADMIN_REACTIVATED',
      'ADMIN',
      { type: 'ADMIN', id, label: target.displayName },
      'حساب ادمین دوباره فعال شد',
      { status: 'SUSPENDED' },
      { status: 'ACTIVE' },
    );
    return clone(target);
  },
  async revokeInvitation(id, actorAdminId = CURRENT_ADMIN_ID) {
    await delay();
    authorize(actorAdminId, 'administration.admins.update');
    const index = state.admins.findIndex((item) => item.id === id);
    const target = required(state.admins[index], 'ادمین موردنظر پیدا نشد.');
    protectSuper(adminById(actorAdminId), target);
    if (target.status !== 'INVITED') throw new Error('فقط دعوت ثبت‌شده قابل لغو است.');
    state.admins.splice(index, 1);
    audit(
      actorAdminId,
      'ADMIN_INVITATION_REVOKED',
      'ADMIN',
      { type: 'ADMIN', id, label: target.displayName },
      'دعوت ادمین لغو شد',
      { status: 'INVITED' },
    );
  },
  async listRoles(signal) {
    await delay(signal);
    return clone(
      state.roles
        .map((role) => ({
          ...role,
          adminCount: state.admins.filter((admin) => admin.roleIds.includes(role.id)).length,
          permissionCount: role.permissionKeys.includes('*')
            ? PERMISSION_KEYS.length
            : role.permissionKeys.length,
        }))
        .sort(
          (a, b) =>
            Number(b.isSystem) - Number(a.isSystem) || a.nameFa.localeCompare(b.nameFa, 'fa'),
        ),
    );
  },
  async getRole(id, signal) {
    await delay(signal);
    return clone(state.roles.find((item) => item.id === id) ?? null);
  },
  async createRole(input, actorAdminId = CURRENT_ADMIN_ID) {
    await delay();
    authorize(actorAdminId, 'administration.roles.manage');
    const key = input.key.trim().toUpperCase();
    const fields: Record<string, string> = {};
    if (!/^CUSTOM_[A-Z0-9_]+$/u.test(key)) fields.key = 'کلید نقش سفارشی باید با CUSTOM_ آغاز شود.';
    if (state.roles.some((item) => item.key === key))
      fields.key = 'این کلید نقش قبلاً ثبت شده است.';
    if (!input.nameFa.trim()) fields.nameFa = 'نام نقش الزامی است.';
    if (input.permissionKeys.some((item) => !PERMISSION_KEYS.includes(item)))
      fields.permissionKeys = 'یکی از دسترسی‌ها معتبر نیست.';
    if (Object.keys(fields).length) throw new AdministrationValidationError(fields);
    const timestamp = new Date().toISOString();
    const role: AdminRole = {
      id: key,
      key,
      nameFa: input.nameFa.trim(),
      descriptionFa: input.descriptionFa.trim(),
      isSystem: false,
      permissionKeys: [...new Set(input.permissionKeys)],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    state.roles.push(role);
    audit(
      actorAdminId,
      'ROLE_CREATED',
      'ROLE',
      { type: 'ROLE', id: role.id, label: role.nameFa },
      'نقش سفارشی ایجاد شد',
      undefined,
      { key: role.key, permissionKeys: role.permissionKeys },
    );
    return clone(role);
  },
  async updateRole(id, input, actorAdminId = CURRENT_ADMIN_ID) {
    await delay();
    authorize(actorAdminId, 'administration.roles.manage');
    const role = roleById(id);
    if (role.key === 'SUPER_ADMIN') throw new Error('دسترسی‌های مدیر ارشد تغییرناپذیر است.');
    if (!input.nameFa.trim())
      throw new AdministrationValidationError({ nameFa: 'نام نقش الزامی است.' });
    if (input.permissionKeys.some((item) => !PERMISSION_KEYS.includes(item)))
      throw new AdministrationValidationError({ permissionKeys: 'یکی از دسترسی‌ها معتبر نیست.' });
    const before = {
      nameFa: role.nameFa,
      descriptionFa: role.descriptionFa,
      permissionKeys: [...role.permissionKeys],
    };
    role.nameFa = input.nameFa.trim();
    role.descriptionFa = input.descriptionFa.trim();
    role.permissionKeys = [...new Set(input.permissionKeys)];
    role.updatedAt = new Date().toISOString();
    audit(
      actorAdminId,
      'ROLE_UPDATED',
      'ROLE',
      { type: 'ROLE', id, label: role.nameFa },
      'نقش به‌روزرسانی شد',
      before,
      {
        nameFa: role.nameFa,
        descriptionFa: role.descriptionFa,
        permissionKeys: role.permissionKeys,
      },
    );
    return clone(role);
  },
  async duplicateRole(id, actorAdminId = CURRENT_ADMIN_ID) {
    const source = roleById(id);
    let key = `CUSTOM_${source.key.replace(/^CUSTOM_/u, '')}_COPY`;
    let suffix = 2;
    while (state.roles.some((item) => item.key === key))
      key = `CUSTOM_${source.key.replace(/^CUSTOM_/u, '')}_COPY_${suffix++}`;
    return this.createRole(
      {
        key,
        nameFa: `${source.nameFa} — کپی`,
        descriptionFa: source.descriptionFa,
        permissionKeys: source.permissionKeys.filter(
          (item): item is CanonicalPermissionKey => item !== '*',
        ),
      },
      actorAdminId,
    );
  },
  async deleteRole(id, actorAdminId = CURRENT_ADMIN_ID) {
    await delay();
    authorize(actorAdminId, 'administration.roles.manage');
    const role = roleById(id);
    if (role.isSystem) throw new Error('نقش سیستمی قابل حذف نیست.');
    const count = state.admins.filter((admin) => admin.roleIds.includes(id)).length;
    if (count)
      throw new Error(`این نقش به ${count.toLocaleString('fa-IR')} ادمین اختصاص داده شده است.`);
    state.roles.splice(state.roles.indexOf(role), 1);
    audit(
      actorAdminId,
      'ROLE_DELETED',
      'ROLE',
      { type: 'ROLE', id, label: role.nameFa },
      'نقش سفارشی حذف شد',
      { key: role.key, permissionKeys: role.permissionKeys },
    );
  },
  async listPermissions(signal) {
    await delay(signal);
    return clone(
      permissionsSeed.map((permission) => ({
        ...permission,
        roleCount: state.roles.filter(
          (role) =>
            role.permissionKeys.includes('*') || role.permissionKeys.includes(permission.key),
        ).length,
      })),
    );
  },
  async getEffectivePermissions(adminId) {
    await delay();
    const admin = adminById(adminId);
    return effectiveKeys(admin).map((key) => ({
      key,
      roleIds: admin.roleIds.filter((id) => {
        const role = roleById(id);
        return role.permissionKeys.includes('*') || role.permissionKeys.includes(key);
      }),
    }));
  },
  async listAuditEvents(query, signal) {
    await delay(signal);
    let items = readAuditEvents();
    const search = query.search?.trim().toLocaleLowerCase('fa-IR');
    if (search)
      items = items.filter((item) =>
        `${item.targetId ?? ''} ${item.targetLabel ?? ''} ${item.summaryFa} ${item.correlationId ?? ''}`
          .toLocaleLowerCase('fa-IR')
          .includes(search),
      );
    if (query.actor) items = items.filter((item) => item.actorAdminId === query.actor);
    if (query.domain) items = items.filter((item) => item.domain === query.domain);
    if (query.action) items = items.filter((item) => item.action === query.action);
    if (query.result) items = items.filter((item) => item.result === query.result);
    if (query.from)
      items = items.filter((item) => item.occurredAt >= `${query.from}T00:00:00.000Z`);
    if (query.to) items = items.filter((item) => item.occurredAt <= `${query.to}T23:59:59.999Z`);
    items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return paginate(items, query.page, query.pageSize);
  },
  async getAuditEvent(id, signal) {
    await delay(signal);
    return readAuditEvent(id);
  },
};

export function validateAdministrationGraph() {
  const roleIds = new Set(state.roles.map((item) => item.id));
  const permissionKeys = new Set(PERMISSION_KEYS);
  return {
    adminsValid: state.admins.every(
      (admin) => admin.roleIds.length > 0 && admin.roleIds.every((id) => roleIds.has(id)),
    ),
    rolesValid: state.roles.every((role) =>
      role.permissionKeys.every((key) => key === '*' || permissionKeys.has(key)),
    ),
    uniqueAdminEmails:
      new Set(state.admins.map((item) => item.email.toLowerCase())).size === state.admins.length,
    uniqueRoleKeys: new Set(state.roles.map((item) => item.key)).size === state.roles.length,
    counts: {
      admins: state.admins.length,
      roles: state.roles.length,
      permissions: permissionsSeed.length,
      audit: readAuditEvents().length,
    },
  };
}
