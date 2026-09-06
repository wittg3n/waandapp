import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { CategoriesPage } from '@/features/content/categories/categories-page';
import { CommentsPage } from '@/features/content/comments/comments-page';
import { MediaPage } from '@/features/content/media/media-page';
import { ContentOverviewPage } from '@/features/content/overview/content-overview-page';
import { PostEditorPage } from '@/features/content/posts/pages/post-editor-page';
import { PostsPage } from '@/features/content/posts/pages/posts-page';
import { TagsPage } from '@/features/content/tags/tags-page';
import { AdmissionDetailPage } from '@/features/data/admissions/pages/admission-detail-page';
import { AdmissionsPage } from '@/features/data/admissions/pages/admissions-page';
import { ImportDetailPage } from '@/features/data/imports/pages/import-detail-page';
import { ImportsPage } from '@/features/data/imports/pages/imports-page';
import { MajorDetailPage } from '@/features/data/majors/pages/major-detail-page';
import { MajorsPage } from '@/features/data/majors/pages/majors-page';
import { ProgramDetailPage } from '@/features/data/programs/pages/program-detail-page';
import { ProgramsPage } from '@/features/data/programs/pages/programs-page';
import { DataQualityPage } from '@/features/data/quality/pages/data-quality-page';
import { SourceDetailPage } from '@/features/data/sources/pages/source-detail-page';
import { SourcesPage } from '@/features/data/sources/pages/sources-page';
import { UniversityDetailPage } from '@/features/data/universities/pages/university-detail-page';
import { UniversitiesPage } from '@/features/data/universities/pages/universities-page';
import { SuspendedUsersPage } from '@/features/users/pages/suspended-users-page';
import { UserDetailPage } from '@/features/users/pages/user-detail-page';
import { UserReportsPage } from '@/features/users/pages/user-reports-page';
import { UsersPage } from '@/features/users/pages/users-page';
import { AdminDetailPage } from '@/features/administration/admins/pages/admin-detail-page';
import { AdminsPage } from '@/features/administration/admins/pages/admins-page';
import { AuditPage } from '@/features/administration/audit/pages/audit-page';
import { PermissionsPage } from '@/features/administration/permissions/pages/permissions-page';
import { RoleDetailPage } from '@/features/administration/roles/pages/role-detail-page';
import { RolesPage } from '@/features/administration/roles/pages/roles-page';
import { FeatureFlagsPage } from '@/features/system/feature-flags/pages/feature-flags-page';
import { HealthPage } from '@/features/system/health/pages/health-page';
import { JobDetailPage } from '@/features/system/jobs/pages/job-detail-page';
import { JobsPage } from '@/features/system/jobs/pages/jobs-page';
import { SecurityPage } from '@/features/system/security/pages/security-page';
import { SettingsPage } from '@/features/system/settings/pages/settings-page';

function PageTitle() {
  const { pathname } = useLocation();
  const dataTitles: Record<string, string> = {
    universities: 'دانشگاه‌ها',
    programs: 'برنامه‌های دانشگاهی',
    majors: 'رشته‌ها',
    admissions: 'پذیرش‌ها',
    sources: 'منابع',
    imports: 'ورودی‌ها',
    quality: 'کیفیت داده‌ها',
  };
  const dataSection = pathname.split('/')[2];
  const contentTitles: Record<string, string> = {
    posts: pathname === '/content/posts/new' ? 'نوشته جدید' : pathname.split('/').length > 3 ? 'ویرایش نوشته' : 'نوشته‌ها',
    categories: 'دسته‌بندی‌ها',
    tags: 'برچسب‌ها',
    media: 'رسانه',
    comments: 'نظرات',
  };
  const contentSection = pathname.split('/')[2];
  const administrationTitles: Record<string,string> = { admins: pathname.split('/').length > 3 ? 'جزئیات ادمین' : 'ادمین‌ها', roles: pathname.split('/').length > 3 ? 'جزئیات نقش' : 'نقش‌ها', permissions: 'دسترسی‌ها', audit: 'لاگ ممیزی' };
  const systemTitles: Record<string,string> = { health:'سلامت سرویس', jobs:pathname.split('/').length>3?'جزئیات جاب':'جاب‌ها', security:'امنیت', 'feature-flags':'فلگ‌های ویژگی', settings:'تنظیمات' };
  const title = pathname === '/content'
    ? 'محتوا'
    : pathname.startsWith('/content/')
      ? (contentTitles[contentSection] ?? 'محتوا')
      : pathname.startsWith('/administration/')
        ? (administrationTitles[pathname.split('/')[2]] ?? 'مدیریت')
        : pathname.startsWith('/system/')
          ? (systemTitles[pathname.split('/')[2]] ?? 'سیستم')
      : pathname.startsWith('/data/')
    ? (dataTitles[dataSection] ?? 'داده‌ها')
    : pathname === '/users/suspended'
      ? 'تعلیق‌شده‌ها'
      : pathname === '/users/reports'
        ? 'گزارش‌ها'
        : pathname.startsWith('/users/')
          ? 'جزئیات کاربر'
          : pathname === '/users'
            ? 'همه کاربران'
            : 'داشبورد';

  return <span className="text-sm font-medium">{title}</span>;
}

export default function Page() {
  const location = useLocation();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
            <span className="text-sm text-muted-foreground">پنل مدیریت</span>
            <span className="text-muted-foreground/50">/</span>
            <PageTitle />
          </div>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="flex min-h-0 min-w-0 flex-1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/content" element={<ContentOverviewPage />} />
              <Route path="/content/posts" element={<PostsPage />} />
              <Route path="/content/posts/new" element={<PostEditorPage />} />
              <Route path="/content/posts/:postId" element={<PostEditorPage />} />
              <Route path="/content/categories" element={<CategoriesPage />} />
              <Route path="/content/tags" element={<TagsPage />} />
              <Route path="/content/media" element={<MediaPage />} />
              <Route path="/content/comments" element={<CommentsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/suspended" element={<SuspendedUsersPage />} />
              <Route path="/users/reports" element={<UserReportsPage />} />
              <Route path="/users/:userId" element={<UserDetailPage />} />
              <Route path="/data/universities" element={<UniversitiesPage />} />
              <Route path="/data/universities/:universityId" element={<UniversityDetailPage />} />
              <Route path="/data/programs" element={<ProgramsPage />} />
              <Route path="/data/programs/:programId" element={<ProgramDetailPage />} />
              <Route path="/data/majors" element={<MajorsPage />} />
              <Route path="/data/majors/:majorId" element={<MajorDetailPage />} />
              <Route path="/data/admissions" element={<AdmissionsPage />} />
              <Route path="/data/admissions/:admissionId" element={<AdmissionDetailPage />} />
              <Route path="/data/sources" element={<SourcesPage />} />
              <Route path="/data/sources/:sourceId" element={<SourceDetailPage />} />
              <Route path="/data/imports" element={<ImportsPage />} />
              <Route path="/data/imports/:importId" element={<ImportDetailPage />} />
              <Route path="/data/quality" element={<DataQualityPage />} />
              <Route path="/administration/admins" element={<AdminsPage />} />
              <Route path="/administration/admins/:adminId" element={<AdminDetailPage />} />
              <Route path="/administration/roles" element={<RolesPage />} />
              <Route path="/administration/roles/:roleId" element={<RoleDetailPage />} />
              <Route path="/administration/permissions" element={<PermissionsPage />} />
              <Route path="/administration/audit" element={<AuditPage />} />
              <Route path="/system/health" element={<HealthPage />} />
              <Route path="/system/jobs" element={<JobsPage />} />
              <Route path="/system/jobs/:jobId" element={<JobDetailPage />} />
              <Route path="/system/security" element={<SecurityPage />} />
              <Route path="/system/feature-flags" element={<FeatureFlagsPage />} />
              <Route path="/system/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </SidebarInset>
    </SidebarProvider>
  );
}
