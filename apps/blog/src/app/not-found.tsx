import { EmptyState } from '@/components/status/empty-state';

export default function NotFound() {
  return (
    <main className="site-shell py-20 sm:py-28" id="main-content">
      <p className="text-center text-xs font-black tracking-[0.12em] text-[#143CFB]">خطای ۴۰۴</p>
      <div className="mx-auto mt-5 max-w-3xl">
        <EmptyState
          description="نشانی این مطلب یا صفحه تغییر کرده است، یا دیگر در وبلاگ وآند وجود ندارد."
          title="صفحه موردنظر پیدا نشد"
        />
      </div>
    </main>
  );
}
