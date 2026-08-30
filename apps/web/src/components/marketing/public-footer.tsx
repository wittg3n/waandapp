import { FaGithub, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import { WaandLogo } from '@/components/ui/waand-logo';
import { BLOG_URL } from '@/lib/public-routes';

const productLinks = [
  { href: '/', label: 'خانه' },
  { href: '/how-it-works', label: 'نحوه کار' },
  { href: '/#pricing', label: 'قیمت‌گذاری' },
  { href: BLOG_URL, label: 'وبلاگ' },
] as const;

const waandLinks = [
  { href: '/about', label: 'درباره ما' },
  { href: '/contact', label: 'تماس با ما' },
  { href: '/faq', label: 'سوالات متداول' },
] as const;

const socialLinks = [
  { href: 'https://x.com/waandapp', icon: FaXTwitter, label: 'وآند در X' },
  { href: 'https://instagram.com/waandapp', icon: FaInstagram, label: 'وآند در اینستاگرام' },
  { href: 'https://github.com/waandapp', icon: FaGithub, label: 'وآند در گیت‌هاب' },
  { href: 'https://youtube.com/@waandapp', icon: FaYoutube, label: 'وآند در یوتیوب' },
  { href: 'https://t.me/waandapp', icon: FaTelegramPlane, label: 'وآند در تلگرام' },
] as const;

function FooterGroup({
  links,
  title,
}: {
  links: ReadonlyArray<{ href: string; label: string }>;
  title: string;
}) {
  return (
    <div>
      <strong className="footer-title">{title}</strong>
      <ul className="footer-list">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="landing-footer border-t border-black/[0.04]" id="footer">
      <div className="section-shell grid grid-cols-2 gap-8 lg:grid-cols-[1.55fr_.75fr_.75fr] lg:gap-12">
        <div className="col-span-2 lg:col-span-1">
          <WaandLogo />
          <p className="mt-4 max-w-[270px] text-[12px] leading-6 text-[#69696f]">
            پلتفرم هوشمند برنامه‌ریزی و مدیریت اپلای دانشگاه
          </p>
          <div
            aria-label="شبکه‌های اجتماعی وآند"
            className="mt-5 flex items-center gap-4 text-[#38383b]"
          >
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                aria-label={label}
                className="rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143CFB] focus-visible:ring-offset-2"
                href={href}
                key={href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon aria-hidden="true" className="size-5" />
              </a>
            ))}
          </div>
        </div>

        <FooterGroup links={productLinks} title="محصول" />
        <FooterGroup links={waandLinks} title="وآند" />
      </div>
      <p className="section-shell mt-8 border-t border-[#ededed] pt-4 text-center text-[11px] text-[#808087]">
        © ۱۴۰۵ وآند. تمامی حقوق محفوظ است.
      </p>
    </footer>
  );
}
