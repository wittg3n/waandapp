import { AuthLogo } from '@/components/auth/auth-logo';
import { DashboardNavigation } from '@/components/layout/dashboard-navigation';
import { useAuth } from '@/features/auth/auth-context';

export function DashboardSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="hidden h-full w-[216px] shrink-0 flex-col border-l border-[#e7e9ee] bg-white px-3.5 py-4 lg:flex xl:w-[236px]">
      <div className="flex min-h-11 items-center px-3">
        <AuthLogo />
      </div>

      <div className="waand-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1">
        <DashboardNavigation logout={logout} />
      </div>
    </aside>
  );
}
