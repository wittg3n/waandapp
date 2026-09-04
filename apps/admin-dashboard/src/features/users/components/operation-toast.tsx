import { CheckCircleIcon, XIcon } from '@phosphor-icons/react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export function OperationToast({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 start-4 z-50 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm shadow-lg"
    >
      <CheckCircleIcon className="shrink-0 text-success" weight="fill" />
      <span>{message}</span>
      <Button variant="ghost" size="icon-xs" onClick={onDismiss} aria-label="بستن پیام">
        <XIcon />
      </Button>
    </div>
  );
}
