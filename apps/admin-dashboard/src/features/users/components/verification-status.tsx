import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';

export function VerificationStatus({ verified, label }: { verified: boolean; label: string }) {
  return (
    <span
      className={
        verified
          ? 'inline-flex items-center gap-1 text-xs text-success'
          : 'inline-flex items-center gap-1 text-xs text-muted-foreground'
      }
    >
      {verified ? <CheckCircleIcon weight="fill" /> : <XCircleIcon />}
      {label}
    </span>
  );
}
