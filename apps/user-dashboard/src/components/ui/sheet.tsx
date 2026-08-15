import * as SheetPrimitive from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Sheet(props: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetContent({
  children,
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        className="fixed inset-0 z-50 bg-foreground/25 data-[state=open]:motion-safe:animate-[waand-sheet-overlay_180ms_ease-out]"
        data-slot="sheet-overlay"
      />
      <SheetPrimitive.Content
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(88vw,22rem)] flex-col overflow-y-auto border-l border-border bg-card text-card-foreground shadow-[-24px_0_60px_rgba(15,23,42,0.14)] outline-none data-[state=open]:motion-safe:animate-[waand-sheet-panel_240ms_ease-out]',
          className,
        )}
        data-slot="sheet-content"
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 p-5 pe-16 text-start', className)}
      data-slot="sheet-header"
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn('text-lg font-bold text-foreground', className)}
      data-slot="sheet-title"
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn('text-sm leading-6 text-muted-foreground', className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

export function SheetClose({
  'aria-label': ariaLabel = 'بستن',
  className,
  type = 'button',
  ...props
}: ComponentProps<typeof SheetPrimitive.Close>) {
  return (
    <SheetPrimitive.Close
      aria-label={ariaLabel}
      className={cn(
        'absolute end-4 top-4 inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      data-slot="sheet-close"
      type={type}
      {...props}
    />
  );
}
