import {
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessageSquareText,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'sonner';

import { normalizeError } from '@/errors/normalize-error';
import { cn } from '@/lib/utils';

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const mainNavigation: NavigationItem[] = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'پروفایل', href: '/profile', icon: UserRound },
  { label: 'مدارک', href: '/documents', icon: FileText },
  { label: 'پیشنهاد دانشگاه‌ها', href: '/universities', icon: Building2 },
  { label: 'اپلیکیشن‌ها', href: '/applications', icon: BriefcaseBusiness },
  { label: 'ددلاین‌ها', href: '/deadlines', icon: CalendarDays },
  { label: 'پیام‌ها', href: '/messages', icon: MessageSquareText },
];

const secondaryNavigation: NavigationItem[] = [
  { label: 'تنظیمات', href: '/settings', icon: Settings },
  { label: 'راهنما', href: '/help', icon: BookOpenText },
];

function NavigationLink({ item, onNavigate }: { item: NavigationItem; onNavigate?: () => void }) {
  const Icon = item.icon;

  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-bold text-[#626873] outline-none transition-[color,background-color] duration-200 hover:bg-[#f5f6f8] hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/15 lg:min-h-9',
          isActive &&
            'bg-primary/[0.075] text-primary before:absolute before:inset-y-2 before:start-0 before:w-[3px] before:rounded-full before:bg-primary',
        )
      }
      end={item.href === '/dashboard'}
      onClick={onNavigate}
      to={item.href}
    >
      {({ isActive }) => (
        <>
          <Icon
            aria-hidden="true"
            className={cn('size-[19px] shrink-0', !isActive && 'text-[#747a83]')}
            strokeWidth={1.75}
          />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function DashboardNavigation({
  logout,
  onNavigate,
}: {
  logout: () => Promise<void>;
  onNavigate?: () => void;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate?.();
    } catch (cause) {
      toast.error(normalizeError(cause).userMessage);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <nav aria-label="منوی اصلی" className="mt-4">
        <p className="px-3 text-[11px] font-bold text-muted-foreground">منو</p>
        <ul className="mt-2 space-y-1">
          {mainNavigation.map((item) => (
            <li key={item.href}>
              <NavigationLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="my-3 h-px bg-[#eceef2]" />

      <nav aria-label="منوی عمومی">
        <p className="px-3 text-[11px] font-bold text-muted-foreground">عمومی</p>
        <ul className="mt-2 space-y-1">
          {secondaryNavigation.map((item) => (
            <li key={item.href}>
              <NavigationLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
          <li>
            <button
              aria-busy={isLoggingOut}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-bold text-[#626873] outline-none transition-colors hover:bg-destructive/[0.05] hover:text-destructive focus-visible:ring-4 focus-visible:ring-destructive/15 lg:min-h-9"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              type="button"
            >
              {isLoggingOut ? (
                <LoaderCircle aria-hidden="true" className="size-[19px] animate-spin" />
              ) : (
                <LogOut aria-hidden="true" className="size-[19px]" strokeWidth={1.75} />
              )}
              {isLoggingOut ? 'در حال خروج…' : 'خروج'}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
