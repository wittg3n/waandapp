import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { AuthLogo } from '@/components/auth/auth-logo';
import { DashboardNavigation } from '@/components/layout/dashboard-navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/auth-context';

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  function handleLogout() {
    setOpen(false);
    logout();
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label="باز کردن منو"
          className="size-11 rounded-xl lg:hidden"
          size="icon"
          variant="ghost"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[min(88vw,20rem)] px-3.5 py-4" dir="rtl">
        <SheetHeader className="items-start p-0 px-3">
          <SheetTitle className="sr-only">منوی وآند</SheetTitle>
          <SheetDescription className="sr-only">دسترسی به بخش‌های حساب کاربری</SheetDescription>
          <AuthLogo />
        </SheetHeader>
        <SheetClose>
          <X aria-hidden="true" className="size-5" />
        </SheetClose>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DashboardNavigation logout={handleLogout} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
