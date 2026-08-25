import { motion } from 'framer-motion';

import visual from '@/assets/auth/login-illustration.png';

const ease = [0.22, 1, 0.36, 1] as const;

export function AuthIllustration() {
  return (
    <motion.aside
      animate={{ opacity: 1, scale: 1, x: 0 }}
      aria-hidden="true"
      className="relative hidden min-h-0 min-w-0 overflow-hidden lg:block"
      initial={{ opacity: 0, scale: 0.995, x: -8 }}
      transition={{ duration: 0.5, ease }}
    >
      <img alt="" className="absolute inset-0 size-full object-cover object-center" src={visual} />
    </motion.aside>
  );
}
