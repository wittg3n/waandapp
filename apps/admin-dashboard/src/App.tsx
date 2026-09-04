import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
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
import { ADMIN_MOCK_MODE } from '@/features/users/services/users-api';
import { SuspendedUsersPage } from '@/features/users/pages/suspended-users-page';
import { UserDetailPage } from '@/features/users/pages/user-detail-page';
import { UserReportsPage } from '@/features/users/pages/user-reports-page';
import { UsersPage } from '@/features/users/pages/users-page';

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
  const title = pathname.startsWith('/data/')
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
            {ADMIN_MOCK_MODE && (
              <span className="rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                حالت آزمایشی
              </span>
            )}
          </div>
        </header>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  );
}
