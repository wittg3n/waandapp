import { Outlet } from 'react-router-dom';

import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Topbar } from '@/components/layout/topbar';

export function DashboardShell() {
  return (
    <div className="h-dvh min-h-0 bg-[#f4f6f9] " dir="rtl" lang="fa">
      <div className="flex h-full min-h-0 w-full overflow-hidden bg-[#fafbfc] ">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main
            className="waand-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5 [scrollbar-gutter:stable]"
            id="dashboard-content"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
