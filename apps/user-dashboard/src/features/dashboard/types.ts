export type NextAction = {
  id: string;
  kind: 'deadline' | 'resume' | 'language';
  priority: 'urgent' | 'high' | 'normal';
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  meta?: string;
};

export type DashboardPhase = 'new-user' | 'analyzed' | 'applications-started' | 'submitted';

export type ApplicationSummary = {
  intake: string;
  readiness: number;
  recommendedPrograms: number;
  shortlistedUniversities: number;
  preparingApplications: number;
  submittedApplications: number;
};

export type ApplicationStage = {
  id: 'recommended' | 'shortlisted' | 'preparing' | 'submitted' | 'decision';
  label: string;
  count: number;
  href: string;
};

export type ProgramRecommendation = {
  id: string;
  university: string;
  program: string;
  country: string;
  matchScore: number;
  deadlineDays: number;
  reasons: readonly string[];
  warning?: string;
  href: string;
};

export type AIInsight = {
  id: string;
  kind: 'strength' | 'risk' | 'opportunity';
  label: string;
  title: string;
  description: string;
};

export type Deadline = {
  id: string;
  university: string;
  program: string;
  daysRemaining: number;
  dateLabel: string;
  href: string;
};

export type DocumentHealth = {
  ready: number;
  needsReview: number;
  incomplete: number;
  issue: string;
  href: string;
};

export type ActivityItem = {
  id: string;
  kind: 'analysis' | 'recommendation' | 'requirement' | 'application';
  title: string;
  occurredAt: string;
  href?: string;
};

export type DashboardViewModel = {
  phase: DashboardPhase;
  summary: ApplicationSummary;
  nextActions: readonly NextAction[];
  pipeline: readonly ApplicationStage[];
  recommendations: readonly ProgramRecommendation[];
  insights: readonly AIInsight[];
  deadlines: readonly Deadline[];
  documentHealth: DocumentHealth;
  recentActivity: readonly ActivityItem[];
};
