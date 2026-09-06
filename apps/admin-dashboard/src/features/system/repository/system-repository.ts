import { localSystemRepository } from './local-system-repository';
import type {
  AdminSession,
  BackgroundJob,
  BlockedIp,
  BlockIpInput,
  FeatureFlag,
  FeatureFlagInput,
  JobListQuery,
  LoginAttempt,
  LoginAttemptQuery,
  PageResult,
  SecurityEvent,
  SecurityEventQuery,
  ServiceHealth,
  SettingsSection,
  SystemDashboardSummary,
  SystemSettings,
} from '../types/system.types';

export interface SystemRepository {
  getHealth(signal?: AbortSignal): Promise<ServiceHealth[]>;
  getDashboardSummary(signal?: AbortSignal): Promise<SystemDashboardSummary>;
  listJobs(query: JobListQuery, signal?: AbortSignal): Promise<PageResult<BackgroundJob>>;
  getJob(id: string, signal?: AbortSignal): Promise<BackgroundJob | null>;
  retryJob(id: string, actorAdminId?: string): Promise<BackgroundJob>;
  cancelJob(id: string, actorAdminId?: string): Promise<BackgroundJob>;
  listAdminSessions(signal?: AbortSignal): Promise<AdminSession[]>;
  revokeSession(id: string, actorAdminId?: string, confirmCurrent?: boolean): Promise<AdminSession>;
  revokeAllSessions(
    adminId: string,
    actorAdminId?: string,
    includeCurrent?: boolean,
  ): Promise<number>;
  listLoginAttempts(query: LoginAttemptQuery, signal?: AbortSignal): Promise<LoginAttempt[]>;
  listSecurityEvents(query: SecurityEventQuery, signal?: AbortSignal): Promise<SecurityEvent[]>;
  acknowledgeSecurityEvent(id: string, actorAdminId?: string): Promise<SecurityEvent>;
  resolveSecurityEvent(id: string, actorAdminId?: string): Promise<SecurityEvent>;
  listBlockedIps(signal?: AbortSignal): Promise<BlockedIp[]>;
  blockIp(input: BlockIpInput, actorAdminId?: string): Promise<BlockedIp>;
  unblockIp(id: string, actorAdminId?: string): Promise<BlockedIp>;
  listFeatureFlags(signal?: AbortSignal): Promise<FeatureFlag[]>;
  createFeatureFlag(
    input: FeatureFlagInput,
    actorAdminId?: string,
    confirmAll?: boolean,
  ): Promise<FeatureFlag>;
  updateFeatureFlag(
    id: string,
    input: Omit<FeatureFlagInput, 'key'>,
    actorAdminId?: string,
    confirmAll?: boolean,
  ): Promise<FeatureFlag>;
  getSettings(signal?: AbortSignal): Promise<SystemSettings>;
  updateSettings<K extends SettingsSection>(
    section: K,
    input: SystemSettings[K],
    actorAdminId?: string,
    confirmMaintenance?: boolean,
  ): Promise<SystemSettings[K]>;
}

export const systemRepository: SystemRepository = localSystemRepository;
