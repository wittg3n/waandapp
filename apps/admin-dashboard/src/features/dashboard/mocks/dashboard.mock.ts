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

export const dashboardMetrics: DashboardMetrics = {
  items: [
    {
      id: 'total-users',
      title: 'کاربران کل',
      value: '12,430',
      change: 8.2,
      icon: 'users',
    },
    {
      id: 'active-users',
      title: 'کاربران فعال',
      value: '4,812',
      change: 5.4,
      icon: 'active-users',
    },
    {
      id: 'new-users',
      title: 'کاربران جدید',
      value: '382',
      context: '۷ روز اخیر',
      icon: 'new-users',
    },
    {
      id: 'profile-completion',
      title: 'تکمیل پروفایل',
      value: '71%',
      change: 2.1,
      icon: 'profile',
    },
  ],
};

export const userGrowthByPeriod: Record<DashboardPeriod, UserGrowthPoint[]> = {
  today: [
    { label: '۰۸:۰۰', newUsers: 6, activeUsers: 4080 },
    { label: '۱۰:۰۰', newUsers: 12, activeUsers: 4260 },
    { label: '۱۲:۰۰', newUsers: 18, activeUsers: 4510 },
    { label: '۱۴:۰۰', newUsers: 25, activeUsers: 4720 },
    { label: '۱۶:۰۰', newUsers: 31, activeUsers: 4812 },
    { label: '۱۸:۰۰', newUsers: 38, activeUsers: 4690 },
  ],
  '7d': [
    { label: 'شنبه', newUsers: 42, activeUsers: 4260 },
    { label: 'یکشنبه', newUsers: 51, activeUsers: 4380 },
    { label: 'دوشنبه', newUsers: 49, activeUsers: 4450 },
    { label: 'سه‌شنبه', newUsers: 63, activeUsers: 4590 },
    { label: 'چهارشنبه', newUsers: 55, activeUsers: 4680 },
    { label: 'پنجشنبه', newUsers: 71, activeUsers: 4812 },
    { label: 'جمعه', newUsers: 51, activeUsers: 4740 },
  ],
  '30d': [
    { label: '۱ شهریور', newUsers: 210, activeUsers: 3860 },
    { label: '۴ شهریور', newUsers: 228, activeUsers: 4010 },
    { label: '۷ شهریور', newUsers: 244, activeUsers: 4130 },
    { label: '۱۰ شهریور', newUsers: 269, activeUsers: 4250 },
    { label: '۱۳ شهریور', newUsers: 281, activeUsers: 4390 },
    { label: '۱۶ شهریور', newUsers: 305, activeUsers: 4470 },
    { label: '۱۹ شهریور', newUsers: 319, activeUsers: 4560 },
    { label: '۲۲ شهریور', newUsers: 337, activeUsers: 4630 },
    { label: '۲۵ شهریور', newUsers: 361, activeUsers: 4740 },
    { label: '۳۰ شهریور', newUsers: 382, activeUsers: 4812 },
  ],
};

export const serviceHealth: ServiceHealth[] = [
  { id: 'api', name: 'API', state: 'healthy', latency: 42 },
  { id: 'mongodb', name: 'MongoDB', state: 'healthy', latency: 18 },
  { id: 'redis', name: 'Redis', state: 'healthy', latency: 4 },
  { id: 'email', name: 'Email', state: 'healthy' },
  { id: 'sms', name: 'SMS', state: 'degraded' },
];

export const contentStatus = [
  { id: 'published', label: 'منتشرشده', value: 64 },
  { id: 'draft', label: 'پیش‌نویس', value: 8 },
  { id: 'review', label: 'در انتظار بررسی', value: 3 },
];

export const dataQualityIssues: DataQualityIssue[] = [
  { id: 'unmapped-field', title: 'رشته بدون نگاشت', count: 103, severity: 'high' },
  { id: 'incomplete-location', title: 'موقعیت دانشگاه ناقص', count: 43, severity: 'medium' },
  { id: 'invalid-admission-code', title: 'کد پذیرش نامعتبر', count: 17, severity: 'high' },
  { id: 'duplicate-university', title: 'دانشگاه تکراری', count: 12, severity: 'medium' },
  { id: 'unknown-degree', title: 'نوع مدرک نامشخص', count: 8, severity: 'low' },
];

export const recentAdminActivity: AdminActivity[] = [
  {
    id: 'activity-1',
    actor: 'خشایار مافی',
    action: 'USER_SUSPENDED',
    target: 'علی رضایی',
    relativeTime: '۱۲ دقیقه پیش',
  },
  {
    id: 'activity-2',
    actor: 'مریم احمدی',
    action: 'ARTICLE_PUBLISHED',
    target: 'راهنمای انتخاب رشته',
    relativeTime: '۳۵ دقیقه پیش',
  },
  {
    id: 'activity-3',
    actor: 'خشایار مافی',
    action: 'ADMIN_ROLE_CHANGED',
    target: 'سارا کریمی',
    relativeTime: '۱ ساعت پیش',
  },
  {
    id: 'activity-4',
    actor: 'سامانه',
    action: 'SANJESH_IMPORT_RUN',
    target: 'داده‌های ۱۴۰۴',
    relativeTime: '۲ ساعت پیش',
  },
  {
    id: 'activity-5',
    actor: 'امیر محمدی',
    action: 'SYSTEM_SETTINGS_CHANGED',
    relativeTime: '۴ ساعت پیش',
  },
];

export const systemAlerts: SystemAlert[] = [
  { id: 'sms-degraded', title: 'سرویس SMS با اختلال جزئی مواجه است', severity: 'warning' },
  {
    id: 'invalid-admission-records',
    title: '۱۷ رکورد دارای کد پذیرش نامعتبر هستند',
    severity: 'warning',
  },
];

export const openTasks: OpenTask[] = [
  {
    id: 'review-import',
    title: 'بررسی Import سنجش ۱۴۰۴',
    category: 'داده',
    state: 'review',
    assignee: 'مریم احمدی',
  },
  {
    id: 'approve-posts',
    title: 'تأیید ۳ نوشته در انتظار انتشار',
    category: 'محتوا',
    state: 'pending',
    assignee: 'سارا کریمی',
  },
  {
    id: 'invalid-records',
    title: 'رسیدگی به ۱۷ رکورد نامعتبر',
    category: 'کیفیت داده',
    state: 'in-progress',
  },
];
