'use client';

import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="site-shell py-20 text-center sm:py-28" id="main-content">
      <p className="text-xs font-black tracking-[0.12em] text-[#143CFB]">خطای موقت</p>
      <h1 className="mt-4 text-2xl font-black text-[#171717] sm:text-3xl">دریافت مطالب ممکن نشد</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#707076]">
        ارتباط با سرویس وبلاگ برقرار نشد. چند لحظه دیگر دوباره تلاش کنید.
      </p>
      <button
        className="focus-ring mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-bold text-white"
        onClick={reset}
        type="button"
      >
        <RefreshCw aria-hidden="true" className="size-4" />
        تلاش دوباره
      </button>
    </main>
  );
}
