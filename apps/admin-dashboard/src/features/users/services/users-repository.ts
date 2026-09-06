import {
  localAdminSessionRepository,
  mockUsersRepository,
} from '@/features/users/mocks/users-mock';
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

export const usersRepository: UsersRepository = mockUsersRepository;
export const adminSessionRepository: AdminSessionRepository = localAdminSessionRepository;
