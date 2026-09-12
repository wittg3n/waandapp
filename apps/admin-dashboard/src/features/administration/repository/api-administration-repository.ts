import { adminRequest } from '@/features/authentication/admin-api';
import type { AdministrationRepository } from './administration-repository';
import {
  AdministrationValidationError,
  type AdminAccount,
  type AdminRole,
  type AuditEvent,
  type PermissionRow,
  type RoleInput,
} from '../types/administration.types';

type ApiRole = {
  key: string;
  name: string;
  description?: string;
  permissions: string[];
  system: boolean;
  adminCount?: number;
  createdAt: string;
  updatedAt: string;
};
type ApiUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  adminRoles: string[];
  status: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
};
type ApiAudit = {
  id: string;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  createdAt: string;
  requestId: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
};
type Page<T> = {
  items: T[];
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
};
const reason = 'تغییر از صفحه مدیریت دسترسی';
const account = (user: ApiUser): AdminAccount => ({
  id: user.id,
  displayName: `${user.firstName} ${user.lastName}`,
  email: user.email,
  roleIds: user.adminRoles,
  status: user.status === 'active' ? 'ACTIVE' : 'SUSPENDED',
  mfaEnabled: true,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
const role = (value: ApiRole): AdminRole => ({
  id: value.key,
  key: value.key,
  nameFa: value.name,
  descriptionFa: value.description ?? '',
  permissionKeys: value.permissions,
  isSystem: value.system,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
});
const audit = (value: ApiAudit): AuditEvent => ({
  id: value.id,
  occurredAt: value.createdAt,
  actorAdminId: value.actorUserId ?? undefined,
  action: value.action as AuditEvent['action'],
  domain:
    value.resourceType === 'ROLE' ? 'ROLE' : value.resourceType === 'USER' ? 'USER' : 'CONTENT',
  targetType: value.resourceType,
  targetId: value.resourceId,
  summaryFa: value.reason ?? value.action,
  result: 'SUCCESS',
  source: 'ADMIN_UI',
  correlationId: value.requestId,
  before: value.before,
  after: value.after,
});
const params = (value: Record<string, unknown>) =>
  new URLSearchParams(
    Object.entries(value)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString();
async function roles(signal?: AbortSignal) {
  return (await adminRequest<{ roles: ApiRole[] }>('/roles', { signal })).roles.map((value) => ({
    ...role(value),
    adminCount: value.adminCount ?? 0,
  }));
}
async function getAccount(id: string, signal?: AbortSignal) {
  return account(
    (await adminRequest<{ user: ApiUser }>(`/accounts/${encodeURIComponent(id)}`, { signal })).user,
  );
}
const roleInput = (input: Omit<RoleInput, 'key'>) => ({
  name: input.nameFa,
  description: input.descriptionFa,
  permissions: input.permissionKeys,
  reason,
});
export const apiAdministrationRepository: AdministrationRepository = {
  async listAdmins(query, signal) {
    const result = await adminRequest<Page<ApiUser>>(
      `/accounts?${params({ search: query.search, status: query.status?.toLowerCase(), adminRole: query.role, page: query.page, pageSize: query.pageSize, sortBy: query.sort === 'displayName' ? 'firstName' : query.sort, sortOrder: query.order })}`,
      { signal },
    );
    const catalog = await roles(signal);
    return {
      ...result.pagination,
      items: result.items.map((user) => ({
        ...account(user),
        roles: catalog.filter((r) => user.adminRoles.includes(r.id)),
      })),
    };
  },
  getAdmin: getAccount,
  async inviteAdmin(input) {
    return account(
      (
        await adminRequest<{ user: ApiUser }>('/accounts/grant', {
          method: 'POST',
          body: { email: input.email, roles: input.roleIds, reason },
        })
      ).user,
    );
  },
  async updateAdmin(id, input) {
    const current = await getAccount(id);
    if (current.email !== input.email || current.displayName !== input.displayName)
      throw new AdministrationValidationError({
        email: 'تغییر مشخصات هویتی باید توسط صاحب حساب تأیید شود.',
      });
    return account(
      (
        await adminRequest<{ user: ApiUser }>(`/users/${encodeURIComponent(id)}/roles`, {
          method: 'PATCH',
          body: { roles: input.roleIds, reason },
        })
      ).user,
    );
  },
  async suspendAdmin(id) {
    return account(
      (
        await adminRequest<{ user: ApiUser }>(`/users/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          body: { status: 'suspended', reason },
        })
      ).user,
    );
  },
  async reactivateAdmin(id) {
    return account(
      (
        await adminRequest<{ user: ApiUser }>(`/users/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          body: { status: 'active', reason },
        })
      ).user,
    );
  },
  async revokeInvitation(id) {
    await adminRequest(`/users/${encodeURIComponent(id)}/roles`, {
      method: 'PATCH',
      body: { roles: [], reason },
    });
  },
  async listRoles(signal) {
    return (await roles(signal)).map((r) => ({
      ...r,
      adminCount: r.adminCount,
      permissionCount: r.permissionKeys.length,
    }));
  },
  async getRole(id, signal) {
    return (await roles(signal)).find((r) => r.id === id) ?? null;
  },
  async createRole(input) {
    return role(
      (
        await adminRequest<{ role: ApiRole }>('/roles', {
          method: 'POST',
          body: { key: input.key, ...roleInput(input) },
        })
      ).role,
    );
  },
  async updateRole(id, input) {
    return role(
      (
        await adminRequest<{ role: ApiRole }>(`/roles/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: roleInput(input),
        })
      ).role,
    );
  },
  async duplicateRole(id) {
    const source = (await roles()).find((r) => r.id === id);
    if (!source) throw new Error('نقش پیدا نشد.');
    return this.createRole({
      key: `CUSTOM_${crypto.randomUUID().replaceAll('-', '').toUpperCase()}`,
      nameFa: `${source.nameFa} (کپی)`,
      descriptionFa: '',
      permissionKeys: source.permissionKeys,
    });
  },
  deleteRole(id) {
    return adminRequest(`/roles/${encodeURIComponent(id)}`, { method: 'DELETE', body: { reason } });
  },
  async listPermissions(signal) {
    const catalog = await roles(signal);
    const { permissions } = await adminRequest<{ permissions: string[] }>('/permissions', {
      signal,
    });
    return permissions.map((key): PermissionRow => ({
      key,
      group: key.startsWith('blog.')
        ? 'CONTENT'
        : key.startsWith('users.')
          ? 'USERS'
          : key.startsWith('education.')
            ? 'DATA'
            : key.startsWith('roles.')
              ? 'ADMINISTRATION'
              : 'SYSTEM',
      labelFa: key,
      descriptionFa: key,
      roleCount: catalog.filter((r) => r.permissionKeys.includes(key)).length,
    }));
  },
  async getEffectivePermissions(id) {
    const user = await getAccount(id);
    const catalog = (await roles()).filter((r) => user.roleIds.includes(r.id));
    return [...new Set(catalog.flatMap((r) => r.permissionKeys))].map((key) => ({
      key,
      roleIds: catalog.filter((r) => r.permissionKeys.includes(key)).map((r) => r.id),
    }));
  },
  async listAuditEvents(query, signal) {
    const result = await adminRequest<Page<ApiAudit>>(
      `/audit?${params({ actorUserId: query.actor, action: query.action, resourceId: query.search, page: query.page, pageSize: query.pageSize })}`,
      { signal },
    );
    return { ...result.pagination, items: result.items.map(audit) };
  },
  async getAuditEvent(id, signal) {
    const result = await adminRequest<Page<ApiAudit>>(`/audit?${params({ id })}`, { signal });
    return result.items.find((item) => item.id === id)
      ? audit(result.items.find((item) => item.id === id)!)
      : null;
  },
};
