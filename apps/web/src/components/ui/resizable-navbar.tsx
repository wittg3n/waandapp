'use client';

import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import type { ComponentPropsWithoutRef, ElementType, ReactElement, ReactNode } from 'react';
import { Children, cloneElement, isValidElement, useState } from 'react';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import { cn } from '@/lib/utils';

interface NavbarProps {
  children: ReactNode;
  className?: string;
}

interface NavBodyProps extends NavbarProps {
  visible?: boolean;
}

interface NavItemsProps {
  items: ReadonlyArray<{
    name: string;
    link: string;
    active?: boolean;
  }>;
  ariaLabel?: string;
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps extends NavbarProps {
  visible?: boolean;
}

interface MobileNavMenuProps extends NavbarProps {
  ariaLabel?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Navbar({ children, className }: NavbarProps) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > 100);
  });

  return (
    <motion.header className={cn('sticky inset-x-0 top-0 z-40 w-full', className)}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return child;
        }

        return cloneElement(child as ReactElement<{ visible?: boolean }>, { visible });
      })}
    </motion.header>
  );
}

export function NavBody({ children, className, visible = false }: NavBodyProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        width: visible ? 'calc(100% - 3rem)' : 'calc(100% - 2rem)',

        maxWidth: visible ? '900px' : '1280px',

        y: visible ? 16 : 0,

        borderRadius: visible ? '20px' : '0px',

        backdropFilter: visible ? 'blur(16px)' : 'blur(0px)',

        boxShadow: visible
          ? [
              '0 1px 2px rgba(0,0,0,0.03)',
              '0 8px 28px rgba(15,23,42,0.07)',
              '0 18px 60px rgba(15,23,42,0.08)',
              '0 0 0 1px rgba(15,23,42,0.05)',
            ].join(', ')
          : '0 0 0 rgba(0,0,0,0)',
      }}
      className={cn(
        `
      relative
      z-[60]
      mx-auto
      hidden
      min-h-[82px]
      w-[calc(100%-2rem)]
      max-w-[1280px]
      flex-row
      items-center
      justify-between
      bg-white
      px-5
      py-2
      lg:flex
    `,
        visible && 'bg-white/88',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function NavItems({ ariaLabel, className, items, onItemClick }: NavItemsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const reducedMotion = useHydratedReducedMotion();

  return (
    <motion.nav
      aria-label={ariaLabel}
      className={cn(
        'absolute inset-0 hidden flex-1 flex-row items-center justify-center gap-1 text-sm font-medium lg:flex',
        className,
      )}
      onMouseLeave={() => setHovered(null)}
    >
      {items.map((item, index) => {
        const isActive = item.active === true;

        // اگر hover داریم، hover اولویت دارد.
        // اگر hover نداریم، pill روی active item می‌ماند.
        const isHighlighted = hovered === index || (hovered === null && isActive);

        return (
          <a
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative rounded-full px-3 py-2 transition-colors',
              'focus-visible:outline-none',
              'focus-visible:ring-2',
              'focus-visible:ring-[#143CFB]',
              'xl:px-4',
              isActive ? 'font-semibold text-[#143CFB]' : 'text-[#45454a] hover:text-[#143CFB]',
            )}
            href={item.link}
            key={item.link}
            onClick={onItemClick}
            onMouseEnter={() => setHovered(index)}
          >
            {isHighlighted && (
              <motion.span
                className="absolute inset-0 rounded-full bg-[#f3f4f8]"
                {...(reducedMotion
                  ? {}
                  : {
                      layoutId: 'navbar-highlight',
                    })}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 32,
                  mass: 0.7,
                }}
              />
            )}

            <span className="relative z-20">{item.name}</span>
          </a>
        );
      })}
    </motion.nav>
  );
}
export function MobileNav({ children, className, visible = false }: MobileNavProps) {
  const reducedMotion = useHydratedReducedMotion();

  return (
    <motion.div
      animate={{
        width: visible ? 'calc(100% - 2rem)' : '100%',

        y: visible ? 10 : 0,

        borderRadius: visible ? '16px' : '0px',

        backdropFilter: visible ? 'blur(16px)' : 'blur(0px)',

        boxShadow: visible
          ? [
              '0 1px 2px rgba(0,0,0,0.03)',
              '0 10px 32px rgba(15,23,42,0.08)',
              '0 0 0 1px rgba(15,23,42,0.05)',
            ].join(', ')
          : '0 0 0 rgba(0,0,0,0)',
      }}
      className={cn(
        'relative z-50 mx-auto flex min-h-[72px] flex-col items-center justify-between px-5 py-2 lg:hidden',
        visible ? 'bg-white/88' : 'bg-white',
        className,
      )}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              type: 'spring',
              stiffness: 260,
              damping: 32,
              mass: 0.8,
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function MobileNavHeader({ children, className }: NavbarProps) {
  return (
    <div className={cn('flex w-full items-center justify-between rounded-4xl', className)}>
      {children}
    </div>
  );
}

export function MobileNavMenu({
  ariaLabel,
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) {
  const reducedMotion = useHydratedReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          aria-label={ariaLabel}
          className={cn(
            'absolute inset-x-0 top-[76px] z-50',
            'flex w-full flex-col items-start gap-2',
            'rounded-2xl border border-[#e8e8e8]',
            'bg-white px-4 py-5',
            'shadow-[0_18px_45px_rgba(0,0,0,0.12)]',
            className,
          )}
          exit={
            reducedMotion
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }
              : {
                  opacity: 0,
                  y: -8,
                  scale: 0.98,
                }
          }
          id="mobile-navigation"
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  y: -8,
                  scale: 0.98,
                }
          }
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onClose();

              document
                .querySelector<HTMLButtonElement>('[aria-controls="mobile-navigation"]')
                ?.focus();
            }
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  duration: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
        >
          {children}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export function MobileNavToggle({
  closeLabel = 'Close navigation',
  isOpen,
  onClick,
  openLabel = 'Open navigation',
}: {
  closeLabel?: string;
  isOpen: boolean;
  onClick: () => void;
  openLabel?: string;
}) {
  const Icon = isOpen ? X : Menu;

  return (
    <button
      aria-controls="mobile-navigation"
      aria-expanded={isOpen}
      aria-label={isOpen ? closeLabel : openLabel}
      className={cn(
        'group/toggle grid size-11 cursor-pointer place-items-center',
        'rounded-xl border border-[#e7e7e7]',
        'bg-white text-[#222]',
        'transition duration-200',
        'hover:border-[#d9d9d9] hover:bg-[#f8f8f8]',
        'motion-safe:active:scale-[0.97]',
        'motion-reduce:transition-none',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-[#143CFB]',
      )}
      onClick={onClick}
      type="button"
    >
      <Icon
        aria-hidden="true"
        className={cn(
          'size-5 transition-transform duration-200',
          'motion-safe:group-hover/toggle:scale-110',
          'motion-reduce:transition-none',
        )}
      />
    </button>
  );
}

export function NavbarLogo({
  children,
  className,
  href = '#',
  label,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  label?: string;
}) {
  return (
    <a
      aria-label={label}
      className={cn(
        'relative z-20 flex items-center rounded-md px-2 py-1',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-[#143CFB]',
        'focus-visible:ring-offset-2',
        className,
      )}
      href={href}
    >
      {children}
    </a>
  );
}

type NavbarButtonProps = ComponentPropsWithoutRef<'a'> & {
  as?: ElementType;
  variant?: 'primary' | 'secondary' | 'dark' | 'gradient';
};

export function NavbarButton({
  as: Tag = 'a',
  children,
  className,
  href,
  variant = 'primary',
  ...props
}: NavbarButtonProps) {
  const variantStyles = {
    primary: 'bg-white text-[#171717] shadow-[0_5px_16px_rgba(0,0,0,0.08)]',

    secondary: 'bg-transparent text-[#383838] shadow-none hover:bg-black/[0.04]',

    dark: 'bg-[#171717] text-white shadow-[0_8px_22px_rgba(0,0,0,0.12)] hover:bg-[#292929]',

    gradient:
      'bg-gradient-to-b from-[#3157ff] to-[#143CFB] text-white shadow-[0_2px_0_rgba(255,255,255,0.3)_inset]',
  };

  return (
    <Tag
      className={cn(
        'relative inline-flex min-h-10 cursor-pointer items-center justify-center',
        'rounded-xl px-5 py-2',
        'text-center text-sm font-semibold',
        'transition duration-200',
        'motion-safe:hover:-translate-y-0.5',
        'motion-safe:active:translate-y-0',
        'motion-safe:active:scale-[0.98]',
        'motion-reduce:transition-none',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-[#143CFB]',
        'focus-visible:ring-offset-2',
        variantStyles[variant],
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </Tag>
  );
}
