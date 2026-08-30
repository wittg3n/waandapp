import { ArrowLeft, ArrowRight } from 'lucide-react';

import type { Pagination as PaginationData } from '@/lib/blog-api';

export function Pagination({
  basePath,
  pagination,
  query,
}: {
  basePath: string;
  pagination: PaginationData;
  query?: string;
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const href = (page: number) => {
    const parameters = new URLSearchParams();
    if (query) parameters.set('q', query);
    if (page > 1) parameters.set('page', `${page}`);
    const suffix = parameters.toString();
    return suffix ? `${basePath}?${suffix}` : basePath;
  };

  return (
    <nav
      aria-label="صفحه‌بندی مقاله‌ها"
      className="mt-10 flex items-center justify-between gap-4 border-t border-[#e8e8e8] pt-6"
    >
      {pagination.hasPreviousPage ? (
        <a
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#e2e2e4] bg-white px-4 text-sm font-bold text-[#2b2b2f] hover:bg-[#f7f7f8]"
          href={href(pagination.page - 1)}
        >
          <ArrowRight aria-hidden="true" className="size-4" />
          صفحه قبل
        </a>
      ) : (
        <span />
      )}
      <span className="text-xs text-[#77777d]">
        صفحه {pagination.page.toLocaleString('fa-IR')} از{' '}
        {pagination.totalPages.toLocaleString('fa-IR')}
      </span>
      {pagination.hasNextPage ? (
        <a
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#e2e2e4] bg-white px-4 text-sm font-bold text-[#2b2b2f] hover:bg-[#f7f7f8]"
          href={href(pagination.page + 1)}
        >
          صفحه بعد
          <ArrowLeft aria-hidden="true" className="size-4" />
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}
