import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  busy = false,
  error,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    setReason('');
    onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      dir="rtl"
      className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-xl border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) close();
      }}
    >
      <form
        className="p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (reason.trim()) onConfirm(reason.trim());
        }}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <label className="mt-5 block text-sm font-medium" htmlFor="operation-reason">
          دلیل عملیات
        </label>
        <textarea
          id="operation-reason"
          required
          maxLength={500}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-2 min-h-24 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          placeholder="دلیل را برای ثبت در گزارش ممیزی وارد کنید"
        />
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={close} disabled={busy}>
            انصراف
          </Button>
          <Button
            type="submit"
            variant={destructive ? 'destructive' : 'default'}
            disabled={busy || !reason.trim()}
          >
            {busy ? 'در حال انجام…' : confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
