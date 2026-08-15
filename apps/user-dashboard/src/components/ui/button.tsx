import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-bold outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(20,60,251,0.14)] hover:bg-primary/90 hover:shadow-[0_13px_28px_rgba(20,60,251,0.2)]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-background text-foreground hover:bg-muted',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
      },
      size: {
        default: 'h-11 rounded-xl px-5 text-sm',
        auth: 'h-14 w-full rounded-[14px] px-6 text-base',
        icon: 'size-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = HTMLMotionProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({
  className,
  size,
  type = 'button',
  variant,
  whileHover,
  whileTap,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      className={cn(buttonVariants({ size, variant }), className)}
      data-slot="button"
      type={type}
      whileHover={reduceMotion ? undefined : (whileHover ?? { y: -1 })}
      whileTap={reduceMotion ? undefined : (whileTap ?? { scale: 0.985 })}
      {...props}
    />
  );
}
