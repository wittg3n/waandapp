import { adminRequest, getAdminSnapshot } from '@/features/authentication/admin-api';
import type {
  AdminSession,
  ManagedUser,
  UserAuditResult,
  UserDetail,
  UserStatusAction,
  UsersResult,
} from '@/features/users/types/users.types';

export interface UsersRepository {
  list(params: URLSearchParams, signal?: AbortSignal): Promise<UsersResult>;
  get(userId: string, signal?: AbortSignal): Promise<UserDetail>;
  update(
    userId: string,
    input: { firstName?: string; lastName?: string; reason: string },
  ): Promise<ManagedUser>;
  changeStatus(userId: string, status: UserStatusAction, reason: string): Promise<ManagedUser>;
  resetVerification(
    userId: string,
    channel: 'email' | 'phone',
    reason: string,
  ): Promise<ManagedUser>;
  revokeAllSessions(userId: string, reason: string): Promise<void>;
  audit(userId: string, signal?: AbortSignal): Promise<UserAuditResult>;
}

export interface AdminSessionRepository {
  get(signal?: AbortSignal): Promise<AdminSession>;
}

export const usersRepository: UsersRepository = {
  list(params, signal) {
    params.set('adminRole', 'USER');
    return adminRequest(`/users?${params}`, { signal });
  },
  async get(id, signal) {
    return (
      await adminRequest<{ user: UserDetail }>(`/users/${encodeURIComponent(id)}`, { signal })
    ).user;
  },
  async update(id, input) {
    return (
      await adminRequest<{ user: ManagedUser }>(`/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: input,
      })
    ).user;
  },
  async changeStatus(id, status, reason) {
    return (
      await adminRequest<{ user: ManagedUser }>(`/users/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status, reason },
      })
    ).user;
  },
  async resetVerification(id, channel, reason) {
    return (
      await adminRequest<{ user: ManagedUser }>(
        `/users/${encodeURIComponent(id)}/verification/${channel}/reset`,
        { method: 'POST', body: { reason } },
      )
    ).user;
  },
  revokeAllSessions(id, reason) {
    return adminRequest(`/users/${encodeURIComponent(id)}/sessions/revoke`, {
      method: 'POST',
      body: { reason },
    });
  },
  audit(id, signal) {
    return adminRequest(`/audit?resourceId=${encodeURIComponent(id)}`, { signal });
  },
};
export const adminSessionRepository: AdminSessionRepository = { get: () => getAdminSnapshot() };
