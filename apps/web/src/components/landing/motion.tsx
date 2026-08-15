'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import {
  motion,
  useInView,
  useScroll,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
  type Variants,
} from 'framer-motion';

import { cn } from '@/lib/utils';

const easeOut = [0.22, 1, 0.36, 1] as const;

const revealItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.62,
      ease: easeOut,
    },
  },
};

type StaticDivProps = {
  children: ReactNode;
  className?: string;
};

/* -------------------------------------------------------------------------- */
/*                                   Reveal                                   */
/* -------------------------------------------------------------------------- */

export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.2,
  y = 40,
}: StaticDivProps & {
  delay?: number;
  amount?: number;
  y?: number;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y,
        filter: 'blur(6px)',
      }}
      transition={{
        delay,
        duration: 0.64,
        ease: easeOut,
      }}
      viewport={{
        amount,
        once: true,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Reveal Group                                */
/* -------------------------------------------------------------------------- */

export function RevealGroup({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  amount = 0.2,
}: StaticDivProps & {
  delay?: number;
  stagger?: number;
  amount?: number;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
      viewport={{
        amount,
        once: true,
      }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Reveal Item                                 */
/* -------------------------------------------------------------------------- */

export function RevealItem({ children, className }: StaticDivProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={revealItemVariants}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Motion Link                                 */
/* -------------------------------------------------------------------------- */

type MotionLinkProps = Omit<HTMLMotionProps<'a'>, 'children' | 'className'> & StaticDivProps;

export function MotionLink({ children, className, ...props }: MotionLinkProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.a
      {...props}
      className={className}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 28,
      }}
      whileHover={
        reducedMotion
          ? {}
          : {
              scale: 1.02,
            }
      }
      whileTap={
        reducedMotion
          ? {}
          : {
              scale: 0.97,
            }
      }
    >
      {children}
    </motion.a>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Interactive Card                              */
/* -------------------------------------------------------------------------- */

type InteractiveCardProps = Omit<HTMLMotionProps<'div'>, 'children' | 'className'> & StaticDivProps;

export function InteractiveCard({ children, className, ...props }: InteractiveCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      {...props}
      className={className}
      transition={{
        type: 'spring',
        stiffness: 360,
        damping: 26,
      }}
      whileHover={
        reducedMotion
          ? {}
          : {
              y: -4,
              scale: 1.01,
            }
      }
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Hero Reveal                                 */
/* -------------------------------------------------------------------------- */

const heroRevealDelay = {
  headline: 0.06,
  body: 0.2,
  actions: 0.74,
  support: 0.66,
} as const;

const heroRevealBlur = {
  headline: 'blur(5px)',
  body: 'blur(3px)',
  actions: 'blur(2px)',
  support: 'blur(2px)',
} as const;

export function HeroReveal({
  children,
  className,
  stage,
}: StaticDivProps & {
  stage: keyof typeof heroRevealDelay;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={stage === 'headline' ? 'overflow-hidden' : undefined}>
      <motion.div
        animate={{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
        }}
        className={className}
        initial={{
          opacity: 0,
          y: stage === 'headline' ? 26 : 18,
          filter: heroRevealBlur[stage],
        }}
        transition={{
          delay: heroRevealDelay[stage],
          duration: 0.58,
          ease: easeOut,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Hero Scene                                 */
/* -------------------------------------------------------------------------- */

type HeroSceneValues = {
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const HeroSceneContext = createContext<HeroSceneValues | null>(null);

const desktopPointer = '(hover: hover) and (pointer: fine) and (min-width: 1024px)';

export function HeroScene({ children, className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const reducedMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const x = useSpring(pointerX, {
    stiffness: 95,
    damping: 24,
    mass: 0.55,
  });

  const y = useSpring(pointerY, {
    stiffness: 95,
    damping: 24,
    mass: 0.55,
  });

  const bounds = useRef<DOMRect | null>(null);

  const values = useMemo(
    () => ({
      x,
      y,
    }),
    [x, y],
  );

  useEffect(() => {
    if (reducedMotion) {
      pointerX.jump(0);
      pointerY.jump(0);
    }
  }, [pointerX, pointerY, reducedMotion]);

  return (
    <HeroSceneContext.Provider value={values}>
      <div
        {...props}
        className={className}
        onPointerEnter={(event) => {
          bounds.current = event.currentTarget.getBoundingClientRect();

          props.onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          bounds.current = null;

          pointerX.set(0);
          pointerY.set(0);

          props.onPointerLeave?.(event);
        }}
        onPointerMove={(event) => {
          if (!reducedMotion && window.matchMedia(desktopPointer).matches) {
            const rect = bounds.current ?? event.currentTarget.getBoundingClientRect();

            pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);

            pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
          }

          props.onPointerMove?.(event);
        }}
      >
        {children}
      </div>
    </HeroSceneContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Hero Layer                                 */
/* -------------------------------------------------------------------------- */

export type HeroLayerKind = 'panel' | 'profile' | 'left' | 'right';

const heroLayerInitial: Record<HeroLayerKind, Record<string, number | string>> = {
  panel: {
    opacity: 0,
    y: 90,
    scale: 0.96,
    filter: 'blur(8px)',
  },

  profile: {
    opacity: 0,
    y: 38,
    scale: 0.985,
    filter: 'blur(4px)',
  },

  left: {
    opacity: 0,
    x: -130,
    scale: 0.94,
    rotate: -2,
    filter: 'blur(6px)',
  },

  right: {
    opacity: 0,
    x: 130,
    scale: 0.94,
    rotate: 2,
    filter: 'blur(6px)',
  },
};

const heroLayerDelay: Record<HeroLayerKind, number> = {
  panel: 0.12,
  profile: 0.34,
  left: 0.48,
  right: 0.54,
};

const heroLayerDepth: Record<HeroLayerKind, number> = {
  panel: 3,
  profile: 6,
  left: 11,
  right: 11,
};

export function HeroLayer({
  children,
  kind = 'panel',
  depth,
  delay,
  ambient = kind === 'left' || kind === 'right' ? -3 : false,
  className,
  surfaceClassName,
}: StaticDivProps & {
  kind?: HeroLayerKind;
  depth?: number;
  delay?: number;
  ambient?: boolean | number;
  surfaceClassName?: string;
}) {
  const scene = useContext(HeroSceneContext);

  const reducedMotion = useReducedMotion();

  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);

  const distance = depth ?? heroLayerDepth[kind];

  const x = useTransform(scene?.x ?? fallbackX, (value) => value * distance);

  const y = useTransform(scene?.y ?? fallbackY, (value) => value * distance * 0.65);

  const entranceDelay = delay ?? heroLayerDelay[kind];

  const ambientY = typeof ambient === 'number' ? ambient : ambient ? -3 : 0;

  return (
    <div className={className} data-hero-layer={kind}>
      <motion.div
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          filter: 'blur(0px)',
        }}
        className="h-full w-full"
        initial={reducedMotion ? false : heroLayerInitial[kind]}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 25,
          mass: 0.85,
          delay: entranceDelay,
        }}
      >
        <motion.div
          className="h-full w-full"
          style={{
            x: reducedMotion ? 0 : x,
            y: reducedMotion ? 0 : y,
          }}
        >
          <motion.div
            animate={
              !reducedMotion && ambientY
                ? {
                    y: [0, ambientY, 0],
                  }
                : {}
            }
            className={surfaceClassName}
            transition={{
              delay: entranceDelay + 0.9,
              duration: kind === 'left' ? 5.8 : 6.6,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Hero Analysis Signal                            */
/* -------------------------------------------------------------------------- */

export function HeroAnalysisSignal({
  className,
  delay = 0.86,
}: {
  className?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
        className,
      )}
    >
      <motion.span
        animate={{
          opacity: [0, 0.55, 0],
        }}
        className="absolute inset-0 rounded-[inherit] border border-[#143CFB]"
        initial={{
          opacity: 0,
        }}
        transition={{
          delay,
          duration: 0.88,
          ease: 'easeInOut',
          times: [0, 0.32, 1],
        }}
      />

      <motion.span
        animate={{
          left: '100%',
          opacity: [0, 0.75, 0],
        }}
        className="absolute inset-y-0 left-0 w-px bg-[#143CFB] shadow-[0_0_16px_3px_rgba(20,60,251,0.24)]"
        initial={{
          left: '0%',
          opacity: 0,
        }}
        transition={{
          delay: delay + 0.04,
          duration: 0.72,
          ease: easeOut,
          times: [0, 0.2, 1],
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Process Scene                                 */
/* -------------------------------------------------------------------------- */

type ProcessSceneValues = {
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

const ProcessSceneContext = createContext<ProcessSceneValues | null>(null);

/**
 * Scroll controller for the "How it works" cards.
 *
 * The reference animation is not a timed entrance animation.
 * Card transforms are scrubbed directly by scroll progress.
 *
 * progress = 0
 * Grid is just entering from the bottom of the viewport.
 *
 * progress = 1
 * Grid has reached its settled showcase position.
 */
export function ProcessScene({ children, className }: StaticDivProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,

    /*
     * These values are intentionally based on the reference video.
     *
     * Start:
     * cards are just appearing near the bottom of the viewport.
     *
     * End:
     * cards have moved into their showcase position below the heading.
     */
    offset: ['start 94%', 'start 48%'],
  });

  /*
   * Very light smoothing.
   *
   * This is NOT an entrance spring.
   * It only removes harsh wheel/touchpad stepping while keeping
   * the animation attached to scroll position.
   */
  const progress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 32,
    mass: 0.32,
    restDelta: 0.001,
  });

  const value = useMemo(
    () => ({
      progress,
      reducedMotion: Boolean(reducedMotion),
    }),
    [progress, reducedMotion],
  );

  return (
    <div ref={ref} className={className}>
      <ProcessSceneContext.Provider value={value}>{children}</ProcessSceneContext.Provider>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Process Step                                */
/* -------------------------------------------------------------------------- */

export type ProcessStepMotion = 'lead' | 'middle' | 'tilted';

type ProcessStepMotionPreset = {
  x: [number, number];
  y: [number, number];
  rotate: [number, number];
  origin: string;
};

/**
 * Motion extracted from the first scroll of the reference video.
 *
 * lead:
 *   The dark card swings in from upper-left.
 *
 * middle:
 *   The center card simply rises into position.
 *
 * tilted:
 *   The final card approaches slightly from the right while
 *   losing some of its extra clockwise rotation.
 *
 * IMPORTANT:
 * Final decorative rotation belongs to the ARTICLE itself,
 * not this outer motion layer.
 */
const processStepMotionPresets: Record<ProcessStepMotion, ProcessStepMotionPreset> = {
  lead: {
    x: [-60, 0],
    y: [-76, 0],
    rotate: [-5.2, 0],
    origin: '82% 88%',
  },

  middle: {
    x: [0, 0],
    y: [62, 0],
    rotate: [0, 0],
    origin: '50% 50%',
  },

  tilted: {
    x: [28, 0],
    y: [0, 0],
    rotate: [5, 0],
    origin: '18% 86%',
  },
};

export function ProcessStep({
  children,
  className,
  motionPreset = 'lead',
}: StaticDivProps & {
  motionPreset?: ProcessStepMotion;
}) {
  const scene = useContext(ProcessSceneContext);
  const localReducedMotion = useReducedMotion();

  /*
   * Makes ProcessStep safe even if accidentally used outside ProcessScene.
   * Outside the scene it simply renders in the final state.
   */
  const fallbackProgress = useMotionValue(1);

  const progress = scene?.progress ?? fallbackProgress;

  const reducedMotion = scene?.reducedMotion ?? Boolean(localReducedMotion);

  const preset = processStepMotionPresets[motionPreset];

  const x = useTransform(progress, [0, 1], preset.x, { clamp: true });

  const y = useTransform(progress, [0, 1], preset.y, { clamp: true });

  const rotate = useTransform(progress, [0, 1], preset.rotate, { clamp: true });

  if (reducedMotion) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className="h-full w-full will-change-transform"
        style={{
          x,
          y,
          rotate,
          transformOrigin: preset.origin,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/*                                   Float                                    */
/* -------------------------------------------------------------------------- */

export function Float({ children, className }: StaticDivProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        reducedMotion
          ? {}
          : {
              y: [-4, 4, -4],
            }
      }
      className={cn('will-change-transform', className)}
      transition={{
        duration: 6,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
}
