import { WaandLogo } from '@/components/ui/waand-logo';
import { siteUrl } from '@/lib/site';

const groups = [
  {
    title: 'محصول',
    links: [
      { href: siteUrl(), label: 'خانه' },
      { href: siteUrl('/how-it-works'), label: 'نحوه کار' },
      { href: '/', label: 'وبلاگ' },
    ],
  },
  {
    title: 'وآند',
    links: [
      { href: siteUrl('/about'), label: 'درباره ما' },
      { href: siteUrl('/contact'), label: 'تماس با ما' },
      { href: siteUrl('/faq'), label: 'سوالات متداول' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/[0.04] py-14 sm:py-20">
      <div className="site-shell grid grid-cols-2 gap-9 lg:grid-cols-[1.55fr_.75fr_.75fr] lg:gap-12">
        <div className="col-span-2 lg:col-span-1">
          <a
            aria-label="وآند — صفحه اصلی"
            className="focus-ring inline-flex rounded-md"
            href={siteUrl()}
          >
            <WaandLogo />
          </a>
          <p className="mt-4 max-w-[290px] text-xs leading-6 text-[#69696f]">
            راهنماهای کاربردی برای تصمیم‌گیری دقیق‌تر در مسیر اپلای دانشگاه
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <strong className="text-[13px] font-extrabold text-[#252527]">{group.title}</strong>
            <ul className="mt-4 grid gap-2.5 text-xs text-[#74747a]">
              {group.links.map((link) => (
                <li key={link.href}>
                  <a
                    className="focus-ring rounded transition-colors hover:text-[#143CFB]"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="site-shell mt-9 border-t border-[#ededed] pt-5 text-center text-[11px] text-[#808087]">
        © ۱۴۰۵ وآند. تمامی حقوق محفوظ است.
      </p>
    </footer>
  );
}
