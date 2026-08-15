import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';

import { AuthField, type AuthFieldProps } from '@/components/auth/auth-field';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type PasswordFieldProps = Omit<AuthFieldProps, 'icon' | 'trailing' | 'type'>;

export function PasswordField({ label, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const VisibilityIcon = visible ? EyeOff : Eye;
  const actionLabel = visible ? `پنهان کردن ${label}` : `نمایش ${label}`;

  return (
    <AuthField
      icon={LockKeyhole}
      label={label}
      trailing={
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label={actionLabel}
              aria-pressed={visible}
              className="absolute left-2 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-4 focus-visible:ring-ring/15"
              onClick={() => setVisible((current) => !current)}
              type="button"
            >
              <VisibilityIcon aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{actionLabel}</TooltipContent>
        </Tooltip>
      }
      type={visible ? 'text' : 'password'}
      {...props}
    />
  );
}
