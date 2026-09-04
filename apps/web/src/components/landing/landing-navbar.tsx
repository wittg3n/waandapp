'use client';

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
import { BLOG_URL } from '@/lib/public-routes';

const dashboardBaseUrl = process.env.NEXT_PUBLIC_USER_DASHBOARD_URL;

if (!dashboardBaseUrl) {
  throw new Error('NEXT_PUBLIC_USER_DASHBOARD_URL is not defined.');
}

const dashboardLoginUrl = new URL('/login', dashboardBaseUrl).toString();

const navigation = [
  {
    link: '#how-it-works',
    name: 'ویژگی‌ها',
  },
  {
    link: '#why-waand',
    name: 'دانشگاه‌ها',
  },
  { link: BLOG_URL, name: 'وبلاگ' },
  {
    link: '/about',
    name: 'درباره ما',
  },
] as const;

export function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Navbar>
      {/* Desktop */}
      <NavBody>
        <NavbarLogo href="/" label="وآند — صفحه اصلی">
          <WaandLogo />
        </NavbarLogo>

        <NavItems ariaLabel="ناوبری اصلی" items={navigation} />

        <NavbarButton href={dashboardLoginUrl} variant="dark">
          ورود / ثبت‌نام
        </NavbarButton>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href="/" label="وآند — صفحه اصلی">
            <WaandLogo />
          </NavbarLogo>

          <MobileNavToggle
            closeLabel="بستن منوی اصلی"
            isOpen={isMobileMenuOpen}
            onClick={() => {
              setIsMobileMenuOpen((open) => !open);
            }}
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
              className={`
                w-full rounded-xl px-4 py-3
                text-sm font-medium text-[#343438]
                transition-colors
                hover:bg-[#f5f5f7]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#143CFB]
              `}
              href={item.link}
              key={item.link}
              onClick={closeMobileMenu}
            >
              {item.name}
            </a>
          ))}

          <NavbarButton
            className="mt-2 w-full"
            href={dashboardLoginUrl}
            onClick={closeMobileMenu}
            variant="dark"
          >
            ورود / ثبت‌نام
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
