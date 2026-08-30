'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
  NavItems,
} from '@/components/ui/resizable-navbar';
import { WaandLogo } from '@/components/ui/waand-logo';
import {
  DASHBOARD_LOGIN_URL,
  DASHBOARD_SIGNUP_URL,
  LANDING_NAVIGATION,
  PUBLIC_NAVIGATION,
} from '@/lib/public-routes';

export function PublicNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigationItems = pathname === '/' ? LANDING_NAVIGATION : PUBLIC_NAVIGATION;
  const navigation = navigationItems.map((item) => ({
    ...item,
    active: !item.href.startsWith('#') && pathname === item.href,
    link: item.href,
    name: item.label,
  }));
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo href="/" label="وآند — صفحه اصلی">
          <WaandLogo />
        </NavbarLogo>
        <NavItems ariaLabel="ناوبری اصلی" items={navigation} />
        <div className="relative z-20 flex items-center gap-1">
          <NavbarButton href={DASHBOARD_LOGIN_URL} variant="secondary">
            ورود
          </NavbarButton>
          <NavbarButton href={DASHBOARD_SIGNUP_URL} variant="dark">
            شروع رایگان
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href="/" label="وآند — صفحه اصلی">
            <WaandLogo />
          </NavbarLogo>
          <MobileNavToggle
            closeLabel="بستن منوی اصلی"
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            openLabel="باز کردن منوی اصلی"
          />
        </MobileNavHeader>

        <MobileNavMenu
          ariaLabel="ناوبری موبایل"
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        >
          {navigation.map((item) => (
            <a
              aria-current={item.active ? 'page' : undefined}
              className={
                item.active
                  ? 'w-full rounded-xl bg-[#f3f5ff] px-4 py-3 text-sm font-bold text-[#143CFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143CFB]'
                  : 'w-full rounded-xl px-4 py-3 text-sm font-medium text-[#343438] transition-colors hover:bg-[#f5f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143CFB]'
              }
              href={item.link}
              key={item.link}
              onClick={closeMobileMenu}
            >
              {item.name}
            </a>
          ))}
          <div className="mt-2 grid w-full grid-cols-2 gap-2">
            <NavbarButton
              className="w-full"
              href={DASHBOARD_LOGIN_URL}
              onClick={closeMobileMenu}
              variant="secondary"
            >
              ورود
            </NavbarButton>
            <NavbarButton
              className="w-full"
              href={DASHBOARD_SIGNUP_URL}
              onClick={closeMobileMenu}
              variant="dark"
            >
              شروع رایگان
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
