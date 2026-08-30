import { Menu, X } from 'lucide-react';

import { WaandLogo } from '@/components/ui/waand-logo';
import { DASHBOARD_LOGIN_URL, DASHBOARD_SIGNUP_URL, siteUrl } from '@/lib/site';

const navigation = [
  { href: siteUrl(), label: 'خانه', current: false },
  { href: '/', label: 'وبلاگ', current: true },
  { href: '/#categories', label: 'موضوع‌ها', current: false },
  { href: '/search', label: 'جست‌وجو', current: false },
  { href: siteUrl('/about'), label: 'درباره ما', current: false },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky inset-x-0 top-0 z-40 border-b border-black/[0.04] bg-white/95 backdrop-blur-xl">
      <div className="site-shell hidden min-h-[82px] items-center justify-between lg:flex">
        <a
          aria-label="وآند — صفحه اصلی"
          className="focus-ring relative z-10 rounded-md"
          href={siteUrl()}
        >
          <WaandLogo />
        </a>
        <nav
          aria-label="ناوبری اصلی"
          className="absolute inset-x-0 flex justify-center gap-1 text-sm font-medium"
        >
          {navigation.map((item) => (
            <a
              aria-current={item.current ? 'page' : undefined}
              className={cnNavItem(item.current)}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="relative z-10 flex items-center gap-1">
          <a
            className="focus-ring rounded-xl px-4 py-2 text-sm font-semibold text-[#383838] hover:bg-black/[0.04]"
            href={DASHBOARD_LOGIN_URL}
          >
            ورود
          </a>
          <a
            className="focus-ring rounded-xl bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(0,0,0,0.12)] transition hover:bg-[#292929]"
            href={DASHBOARD_SIGNUP_URL}
          >
            شروع رایگان
          </a>
        </div>
      </div>

      <div className="site-shell flex min-h-[72px] items-center justify-between lg:hidden">
        <a aria-label="وآند — صفحه اصلی" className="focus-ring rounded-md" href={siteUrl()}>
          <WaandLogo />
        </a>
        <details className="mobile-menu group relative">
          <summary className="focus-ring grid size-11 cursor-pointer list-none place-items-center rounded-xl border border-[#e7e7e7] bg-white text-[#222]">
            <span className="sr-only group-open:hidden">باز کردن منوی اصلی</span>
            <span className="hidden group-open:block group-open:sr-only">بستن منوی اصلی</span>
            <Menu aria-hidden="true" className="size-5 group-open:hidden" />
            <X aria-hidden="true" className="hidden size-5 group-open:block" />
          </summary>
          <nav
            aria-label="ناوبری موبایل"
            className="absolute left-0 top-[54px] flex w-[min(88vw,340px)] flex-col gap-1 rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.12)]"
          >
            {navigation.map((item) => (
              <a
                aria-current={item.current ? 'page' : undefined}
                className={cnNavItem(item.current, true)}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#ededed] pt-3">
              <a
                className="focus-ring rounded-xl bg-[#f5f5f7] px-3 py-2.5 text-center text-sm font-semibold"
                href={DASHBOARD_LOGIN_URL}
              >
                ورود
              </a>
              <a
                className="focus-ring rounded-xl bg-[#171717] px-3 py-2.5 text-center text-sm font-semibold text-white"
                href={DASHBOARD_SIGNUP_URL}
              >
                شروع رایگان
              </a>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}

function cnNavItem(current = false, mobile = false) {
  return [
    'focus-ring rounded-full transition-colors',
    mobile ? 'w-full px-4 py-3 text-sm' : 'px-4 py-2',
    current
      ? 'bg-[#f3f4f8] font-bold text-[#143CFB]'
      : 'text-[#45454a] hover:bg-[#f5f5f7] hover:text-[#143CFB]',
  ].join(' ');
}
