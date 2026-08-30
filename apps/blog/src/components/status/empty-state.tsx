import { BookOpenText, ArrowLeft } from 'lucide-react';

export function EmptyState({
  actionHref = '/',
  actionLabel = 'بازگشت به وبلاگ',
  description,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[#d9d9de] bg-[#fafafa] px-6 py-14 text-center">
      <BookOpenText aria-hidden="true" className="mx-auto size-8 text-[#143CFB]" />
      <h2 className="mt-4 text-xl font-black text-[#222226]">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[#727278]">{description}</p>
      <a
        className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white"
        href={actionHref}
      >
        {actionLabel}
        <ArrowLeft aria-hidden="true" className="size-4" />
      </a>
    </div>
  );
}
