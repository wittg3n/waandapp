import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

import { AuthIllustration } from '@/components/auth/auth-illustration';

const ease = [0.22, 1, 0.36, 1] as const;

export function AuthLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  const variant = location.pathname === '/signup' ? 'signup' : 'login';
  const pageTitle =
    {
      '/forgot-password': 'بازیابی رمز عبور',
      '/login': 'ورود',
      '/reset-password': 'رمز عبور جدید',
      '/signup': 'ثبت‌نام',
      '/verify': 'تأیید هویت',
    }[location.pathname] ?? 'احراز هویت';

  useEffect(() => {
    document.title = `وآند | ${pageTitle}`;
  }, [pageTitle]);

  return (
    <main className="auth-main min-h-dvh w-full bg-background lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div
        className="
          auth-shell-grid
          grid
          min-h-dvh
          w-full
          grid-cols-1
          overflow-hidden
          bg-background
          lg:h-full
          lg:min-h-0
          lg:grid-cols-none
        "
        dir="ltr"
      >
        <AuthIllustration variant={variant} />

        <section
          aria-label={pageTitle}
          className="
            flex
            min-h-0
            min-w-0
            items-start
            justify-center
            bg-background
            px-5
            py-7
            sm:px-9
            sm:py-9
            lg:h-full
            lg:items-center
            lg:overflow-y-auto
            lg:px-9
            lg:py-4
            xl:px-[clamp(36px,5vw,88px)]
          "
          dir="rtl"
        >
          <div className="auth-form-content my-auto flex w-full max-w-[500px] justify-center">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="w-full"
                exit={{ opacity: 0, x: -8 }}
                initial={{ opacity: 0, x: 12 }}
                key={location.pathname}
                transition={{ duration: 0.28, ease }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}
