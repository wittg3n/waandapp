import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MediaAsset } from '../shared/content.types';

export function MediaPicker({
  media,
  title = 'انتخاب تصویر',
  onSelect,
  onClose,
}: {
  media: MediaAsset[];
  title?: string;
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase('fa-IR');
    return media.filter((asset) =>
      !value || [asset.filename, asset.alt, asset.caption].join(' ').toLocaleLowerCase('fa-IR').includes(value),
    );
  }, [media, search]);

  return (
    <dialog open dir="rtl" className="fixed inset-0 z-[70] m-auto max-h-[calc(100%-2rem)] w-[min(62rem,calc(100%-2rem))] overflow-hidden border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">یک تصویر از کتابخانه رسانه انتخاب کنید.</p>
        </div>
        <Button size="icon-sm" variant="ghost" onClick={onClose} aria-label="بستن">
          <XIcon />
        </Button>
      </header>
      <div className="border-b p-4">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} className="ps-8" placeholder="جست‌وجوی نام فایل، متن جایگزین یا توضیح" autoFocus />
        </div>
      </div>
      <div className="max-h-[68vh] overflow-y-auto p-4">
        {filtered.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((asset) => (
              <button key={asset.id} type="button" onClick={() => onSelect(asset)} className="group overflow-hidden border bg-background text-start outline-none hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring">
                <img src={asset.url} alt={asset.alt} className="aspect-square w-full object-cover" />
                <span className="block truncate px-2 py-2 text-xs group-hover:bg-muted">{asset.filename}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">تصویری پیدا نشد.</p>
        )}
      </div>
    </dialog>
  );
}
