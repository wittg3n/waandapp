import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

import { AuthIllustration } from '@/components/auth/auth-illustration';

const ease = [0.22, 1, 0.36, 1] as const;

export function AuthLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const variant = location.pathname === '/signup' ? 'signup' : 'login';

  useEffect(() => {
    document.title = variant === 'login' ? 'واند | ورود' : 'واند | ثبت‌نام';
  }, [variant]);

  return (
    <main className="auth-main min-h-dvh bg-[#f6f7f9] p-2 sm:p-3 lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:px-5 lg:py-4">
      <div
        className="auth-shell-grid mx-auto grid min-h-[calc(100dvh-1rem)] w-full max-w-[1680px] grid-cols-1 overflow-hidden  bg-background shadow-[0_18px_60px_rgba(15,23,42,0.07)] sm:min-h-[calc(100dvh-1.5rem)] sm:rounded-[28px] lg:h-full lg:min-h-0 lg:grid-cols-none"
        dir="ltr"
      >
        <AuthIllustration variant={variant} />

        <section
          aria-label={variant === 'login' ? 'ورود به واند' : 'ساخت حساب واند'}
          className="flex min-h-0 min-w-0 items-start justify-center bg-background px-5 py-7 sm:px-9 sm:py-9 lg:h-full lg:items-center lg:overflow-hidden lg:px-9 lg:py-4 xl:px-[clamp(36px,5vw,88px)]"
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
