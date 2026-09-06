import { localAdministrationRepository } from './local-administration-repository';
import type {
  AdminAccount,
  AdminListQuery,
  AdminRole,
  AdminRow,
  AuditEvent,
  AuditListQuery,
  CanonicalPermissionKey,
  InviteAdminInput,
  PageResult,
  PermissionRow,
  RoleInput,
  RoleRow,
  UpdateAdminInput,
} from '../types/administration.types';

export interface AdministrationRepository {
  listAdmins(query: AdminListQuery, signal?: AbortSignal): Promise<PageResult<AdminRow>>;
  getAdmin(id: string, signal?: AbortSignal): Promise<AdminAccount | null>;
  inviteAdmin(input: InviteAdminInput, actorAdminId?: string): Promise<AdminAccount>;
  updateAdmin(id: string, input: UpdateAdminInput, actorAdminId?: string): Promise<AdminAccount>;
  suspendAdmin(id: string, actorAdminId?: string): Promise<AdminAccount>;
  reactivateAdmin(id: string, actorAdminId?: string): Promise<AdminAccount>;
  revokeInvitation(id: string, actorAdminId?: string): Promise<void>;
  listRoles(signal?: AbortSignal): Promise<RoleRow[]>;
  getRole(id: string, signal?: AbortSignal): Promise<AdminRole | null>;
  createRole(input: RoleInput, actorAdminId?: string): Promise<AdminRole>;
  updateRole(id: string, input: Omit<RoleInput, 'key'>, actorAdminId?: string): Promise<AdminRole>;
  duplicateRole(id: string, actorAdminId?: string): Promise<AdminRole>;
  deleteRole(id: string, actorAdminId?: string): Promise<void>;
  listPermissions(signal?: AbortSignal): Promise<PermissionRow[]>;
  getEffectivePermissions(
    adminId: string,
  ): Promise<Array<{ key: CanonicalPermissionKey; roleIds: string[] }>>;
  listAuditEvents(query: AuditListQuery, signal?: AbortSignal): Promise<PageResult<AuditEvent>>;
  getAuditEvent(id: string, signal?: AbortSignal): Promise<AuditEvent | null>;
}

export const administrationRepository: AdministrationRepository = localAdministrationRepository;
