'use client';

import { useReducedMotion } from 'motion/react';
import { useSyncExternalStore } from 'react';

const subscribe = (onStoreChange: () => void) => {
  const frame = window.requestAnimationFrame(onStoreChange);
  return () => window.cancelAnimationFrame(frame);
};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const isHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return isHydrated && Boolean(prefersReducedMotion);
}
