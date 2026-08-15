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

const navigation = [
  { link: '#how-it-works', name: 'ویژگی‌ها' },
  { link: '#why-waand', name: 'دانشگاه‌ها' },
  { link: '/pricing', name: 'قیمت‌گذاری' },
  { link: '/resources', name: 'منابع' },
  { link: '/about', name: 'درباره ما' },
] as const;

export function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo href="#top" label="وآند — صفحه اصلی">
          <WaandLogo className="" />
        </NavbarLogo>
        <NavItems ariaLabel="ناوبری اصلی" items={navigation} />
        <NavbarButton href="/login" variant="dark">
          ورود / ثبت‌نام
        </NavbarButton>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href="#top" label="وآند — صفحه اصلی">
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
              className="w-full rounded-xl px-4 py-3 text-sm font-medium text-[#343438] hover:bg-[#f5f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143CFB]"
              href={item.link}
              key={item.link}
              onClick={closeMobileMenu}
            >
              {item.name}
            </a>
          ))}
          <NavbarButton
            className="mt-2 w-full"
            href="/login"
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
