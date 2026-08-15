import { CircleAlert } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AppError } from '@/errors/app-error';

export type FormErrorProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  error?: AppError | string | null;
};

export function FormError({ className, error, ...props }: FormErrorProps) {
  const message = typeof error === 'string' ? error : error?.userMessage;

  if (!message) return null;

  return (
    <Alert aria-live="polite" className={className} variant="destructive" {...props}>
      <CircleAlert aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
