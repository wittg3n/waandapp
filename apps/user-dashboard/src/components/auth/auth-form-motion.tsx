import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

const formVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.04, staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease } },
};

export function AuthFormMotion({ className, ...props }: HTMLMotionProps<'form'>) {
  return (
    <motion.form
      animate="visible"
      className={cn('w-full', className)}
      initial="hidden"
      variants={formVariants}
      {...props}
    />
  );
}

export function AuthMotionItem({ className, ...props }: HTMLMotionProps<'div'>) {
  return <motion.div className={className} variants={itemVariants} {...props} />;
}
