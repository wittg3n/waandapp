export type DashboardPeriod = 'today' | '7d' | '30d';

export type DashboardMetricIcon = 'users' | 'active-users' | 'new-users' | 'profile';

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  icon: DashboardMetricIcon;
  change?: number;
  context?: string;
}

export interface DashboardMetrics {
  items: DashboardMetric[];
}

export type ServiceState = 'healthy' | 'degraded' | 'down';

export interface ServiceHealth {
  id: string;
  name: string;
  state: ServiceState;
  latency?: number;
}

export type DataIssueSeverity = 'low' | 'medium' | 'high';

export interface DataQualityIssue {
  id: string;
  title: string;
  count: number;
  severity: DataIssueSeverity;
}

export type AdminActivityAction =
  | 'USER_SUSPENDED'
  | 'ARTICLE_PUBLISHED'
  | 'ADMIN_ROLE_CHANGED'
  | 'SANJESH_IMPORT_RUN'
  | 'SYSTEM_SETTINGS_CHANGED';

export interface AdminActivity {
  id: string;
  actor: string;
  action: AdminActivityAction;
  target?: string;
  relativeTime: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SystemAlert {
  id: string;
  title: string;
  severity: AlertSeverity;
}

export type OpenTaskState = 'pending' | 'in-progress' | 'review';

export interface OpenTask {
  id: string;
  title: string;
  category: string;
  state: OpenTaskState;
  assignee?: string;
}

export interface UserGrowthPoint {
  label: string;
  newUsers: number;
  activeUsers: number;
}
