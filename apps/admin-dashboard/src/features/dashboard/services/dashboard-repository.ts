import { mockDashboardRepository } from '@/features/dashboard/mocks/dashboard.mock';
import type {
  AdminActivity,
  DashboardMetrics,
  DashboardPeriod,
  DataQualityIssue,
  OpenTask,
  ServiceHealth,
  SystemAlert,
  UserGrowthPoint,
} from '@/features/dashboard/types/dashboard.types';

export interface DashboardSnapshot {
  metrics: DashboardMetrics;
  growthByPeriod: Record<DashboardPeriod, UserGrowthPoint[]>;
  serviceHealth: ServiceHealth[];
  contentStatus: { id: string; label: string; value: number }[];
  dataQualityIssues: DataQualityIssue[];
  recentAdminActivity: AdminActivity[];
  systemAlerts: SystemAlert[];
  openTasks: OpenTask[];
}

export interface DashboardRepository {
  get(signal?: AbortSignal): Promise<DashboardSnapshot>;
}

export const dashboardRepository: DashboardRepository = mockDashboardRepository;
