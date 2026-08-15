import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        {children}
        <Toaster
          closeButton
          dir="rtl"
          position="top-center"
          richColors
          toastOptions={{ className: 'font-[Vazirmatn_Variable]' }}
        />
      </TooltipProvider>
    </MotionConfig>
  );
}
