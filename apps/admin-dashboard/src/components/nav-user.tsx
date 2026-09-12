import { useState } from 'react';
import { logoutAdmin } from '@/features/authentication/admin-api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    initials: string;
  };
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    setError('');
    try {
      await logoutAdmin();
    } catch {
      setError('خروج انجام نشد. دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" render={<div />}>
          <Avatar>
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-start text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span dir="ltr" className="truncate text-end text-xs">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <button
          className="w-full px-4 py-2 text-start text-sm"
          disabled={busy}
          onClick={() => void logout()}
        >
          خروج از حساب
        </button>
        {error && (
          <p role="alert" className="px-4 text-xs text-destructive">
            {error}
          </p>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
