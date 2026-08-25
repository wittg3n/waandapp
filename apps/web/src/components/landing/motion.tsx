'use client';

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import {
  motion,
  useAnimationFrame,
  useScroll,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
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

type MotionLinkProps = Omit<HTMLMotionProps<'a'>, 'children' | 'className'> &
  StaticDivProps & {
    hoverScale?: number;
    tapScale?: number;
  };

export function MotionLink({
  children,
  className,
  hoverScale = 1.02,
  tapScale = 0.97,
  ...props
}: MotionLinkProps) {
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
              scale: hoverScale,
            }
      }
      whileTap={
        reducedMotion
          ? {}
          : {
              scale: tapScale,
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
    const pointerMedia = window.matchMedia(journeyDesktopPointer);
    const resetUnavailablePointer = () => {
      if (reducedMotion || !pointerMedia.matches) {
        pointerX.jump(0);
        pointerY.jump(0);
      }
    };

    resetUnavailablePointer();
    pointerMedia.addEventListener('change', resetUnavailablePointer);

    return () => pointerMedia.removeEventListener('change', resetUnavailablePointer);
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
    x: [60, 0],
    y: [76, 0],
    rotate: [5.2, 0],
    origin: '100% 100%',
  },

  middle: {
    x: [0, 0],
    y: [62, 0],
    rotate: [0, 0],
    origin: '50% 50%',
  },

  tilted: {
    x: [-28, 0],
    y: [0, 0],
    rotate: [-20, 0],
    origin: '2% 86%',
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
/*                              App Promo Scene                               */
/* -------------------------------------------------------------------------- */

type AppPromoSceneValues = {
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

const AppPromoSceneContext = createContext<AppPromoSceneValues | null>(null);

export function AppPromoScene({ children, className }: StaticDivProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,

    /*
     * Reference behaviour:
     *
     * 0:
     * promo card has just started entering from the bottom
     *
     * 1:
     * promo is almost centered in the viewport and
     * all internal transforms have settled.
     */
    offset: ['start 96%', 'start 43%'],
  });

  /*
   * Only subtle wheel/trackpad smoothing.
   * This is still a scrubbed animation.
   */
  const progress = useSpring(scrollYProgress, {
    stiffness: 165,
    damping: 30,
    mass: 0.3,
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
      <AppPromoSceneContext.Provider value={value}>{children}</AppPromoSceneContext.Provider>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             App Promo Visual                               */
/* -------------------------------------------------------------------------- */

export function AppPromoVisual({ children, className }: StaticDivProps) {
  const scene = useContext(AppPromoSceneContext);
  const localReducedMotion = useReducedMotion();

  const fallbackProgress = useMotionValue(1);
  const progress = scene?.progress ?? fallbackProgress;

  const reducedMotion = scene?.reducedMotion ?? Boolean(localReducedMotion);

  /*
   * Equivalent of the oversized phone entering from the
   * lower edge in the reference.
   *
   * Because Waand is a web app, the complete browser/dashboard
   * composition behaves like the phone object.
   */
  const x = useTransform(progress, [0, 0.18, 0.72, 1], [58, 42, 6, 0], { clamp: true });

  const y = useTransform(progress, [0, 0.18, 0.72, 1], [108, 88, 12, 0], { clamp: true });

  const scale = useTransform(progress, [0, 0.18, 0.72, 1], [1.24, 1.2, 1.025, 1], { clamp: true });

  const rotate = useTransform(progress, [0, 0.22, 0.75, 1], [3.6, 3.1, 0.4, 0], { clamp: true });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('h-full w-full will-change-transform', className)}
      style={{
        x,
        y,
        scale,
        rotate,
        transformOrigin: '52% 88%',
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              App Promo Copy                                */
/* -------------------------------------------------------------------------- */

type AppPromoCopyStage = 'title' | 'body' | 'features';

export function AppPromoCopy({
  children,
  className,
  stage,
}: StaticDivProps & {
  stage: AppPromoCopyStage;
}) {
  const scene = useContext(AppPromoSceneContext);
  const localReducedMotion = useReducedMotion();

  const fallbackProgress = useMotionValue(1);
  const progress = scene?.progress ?? fallbackProgress;

  const reducedMotion = scene?.reducedMotion ?? Boolean(localReducedMotion);

  /*
   * The title exists very early in the reference but starts
   * with extremely low contrast.
   *
   * Body and secondary content enter progressively later.
   */
  const ranges: Record<
    AppPromoCopyStage,
    {
      input: number[];
      opacity: number[];
      y: number[];
    }
  > = {
    title: {
      input: [0, 0.12, 0.52, 0.82],
      opacity: [0.08, 0.18, 0.82, 1],
      y: [24, 20, 4, 0],
    },

    body: {
      input: [0, 0.34, 0.68, 0.9],
      opacity: [0, 0, 0.72, 1],
      y: [18, 18, 5, 0],
    },

    features: {
      input: [0, 0.48, 0.77, 1],
      opacity: [0, 0, 0.68, 1],
      y: [22, 22, 7, 0],
    },
  };

  const range = ranges[stage];

  const opacity = useTransform(progress, range.input, range.opacity, { clamp: true });

  const y = useTransform(progress, range.input, range.y, { clamp: true });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{
        opacity,
        y,
      }}
    >
      {children}
    </motion.div>
  );
}
/* -------------------------------------------------------------------------- */
/*                              Why Waand Scene                               */
/* -------------------------------------------------------------------------- */

type WhyWaandSceneValues = {
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

const WhyWaandSceneContext = createContext<WhyWaandSceneValues | null>(null);

export function WhyWaandScene({ children, className }: StaticDivProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,

    /*
     * Start:
     * section has just entered the lower viewport.
     *
     * End:
     * section is approaching its intended showcase position.
     */
    offset: ['start 96%', 'start 45%'],
  });

  /*
   * Light smoothing only.
   * The motion is still directly controlled by scroll.
   */
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 31,
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
      <WhyWaandSceneContext.Provider value={value}>{children}</WhyWaandSceneContext.Provider>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Why Waand Mountain                               */
/* -------------------------------------------------------------------------- */

export function WhyWaandMountain({ children, className }: StaticDivProps) {
  const scene = useContext(WhyWaandSceneContext);
  const localReducedMotion = useReducedMotion();

  const fallbackProgress = useMotionValue(1);
  const progress = scene?.progress ?? fallbackProgress;

  const reducedMotion = scene?.reducedMotion ?? Boolean(localReducedMotion);

  /*
   * The mountain behaves like one large physical illustration
   * rising into the composition.
   *
   * There is a very small overscale near the end, but no bounce.
   */
  const x = useTransform(progress, [0, 0.22, 0.72, 1], [-76, -48, -7, 0], { clamp: true });

  const y = useTransform(progress, [0, 0.22, 0.72, 1], [180, 118, 16, 0], { clamp: true });

  const rotate = useTransform(progress, [0, 0.25, 0.75, 1], [-5.8, -3.1, -0.35, 0], {
    clamp: true,
  });

  const scale = useTransform(progress, [0, 0.25, 0.74, 1], [0.87, 0.93, 1.015, 1], { clamp: true });

  const opacity = useTransform(progress, [0, 0.1, 0.34], [0, 0.58, 1], { clamp: true });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('h-full w-full will-change-transform', className)}
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        transformOrigin: '45% 88%',
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Why Waand Copy                                 */
/* -------------------------------------------------------------------------- */

export type WhyWaandCopyStage = 'eyebrow' | 'title' | 'body' | 'features' | 'action' | 'caption';

type WhyWaandCopyRange = {
  input: number[];
  opacity: number[];
  x: number[];
  y: number[];
};

const whyWaandCopyRanges: Record<WhyWaandCopyStage, WhyWaandCopyRange> = {
  eyebrow: {
    input: [0, 0.1, 0.38, 0.58],
    opacity: [0, 0.12, 0.78, 1],
    x: [24, 20, 4, 0],
    y: [18, 15, 3, 0],
  },

  title: {
    input: [0, 0.12, 0.46, 0.66],
    opacity: [0.04, 0.14, 0.82, 1],
    x: [46, 36, 6, 0],
    y: [34, 28, 5, 0],
  },

  body: {
    input: [0, 0.28, 0.58, 0.76],
    opacity: [0, 0, 0.72, 1],
    x: [30, 30, 5, 0],
    y: [24, 24, 5, 0],
  },

  features: {
    input: [0, 0.42, 0.7, 0.87],
    opacity: [0, 0, 0.68, 1],
    x: [22, 22, 4, 0],
    y: [20, 20, 4, 0],
  },

  action: {
    input: [0, 0.56, 0.78, 0.96],
    opacity: [0, 0, 0.72, 1],
    x: [18, 18, 3, 0],
    y: [18, 18, 3, 0],
  },

  caption: {
    input: [0, 0.58, 0.8, 1],
    opacity: [0, 0, 0.7, 1],
    x: [0, 0, 0, 0],
    y: [12, 12, 3, 0],
  },
};

export function WhyWaandCopy({
  children,
  className,
  stage,
}: StaticDivProps & {
  stage: WhyWaandCopyStage;
}) {
  const scene = useContext(WhyWaandSceneContext);
  const localReducedMotion = useReducedMotion();

  const fallbackProgress = useMotionValue(1);
  const progress = scene?.progress ?? fallbackProgress;

  const reducedMotion = scene?.reducedMotion ?? Boolean(localReducedMotion);

  const range = whyWaandCopyRanges[stage];

  const opacity = useTransform(progress, range.input, range.opacity, { clamp: true });

  const x = useTransform(progress, range.input, range.x, { clamp: true });

  const y = useTransform(progress, range.input, range.y, { clamp: true });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{
        opacity,
        x,
        y,
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Why Waand Aura                                 */
/* -------------------------------------------------------------------------- */

export function WhyWaandAura({ className }: { className?: string }) {
  const scene = useContext(WhyWaandSceneContext);
  const localReducedMotion = useReducedMotion();

  const fallbackProgress = useMotionValue(1);
  const progress = scene?.progress ?? fallbackProgress;

  const reducedMotion = scene?.reducedMotion ?? Boolean(localReducedMotion);

  const opacity = useTransform(progress, [0, 0.28, 0.72, 1], [0, 0.18, 0.72, 1], { clamp: true });

  const scale = useTransform(progress, [0, 0.5, 1], [0.72, 0.9, 1], { clamp: true });

  if (reducedMotion) {
    return <div aria-hidden="true" className={className} />;
  }

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      style={{
        opacity,
        scale,
      }}
    />
  );
}
/* -------------------------------------------------------------------------- */
/*                           Testimonials Scene                               */
/* -------------------------------------------------------------------------- */

type TestimonialsSceneValues = {
  progress: MotionValue<number>;
  scrollVelocity: MotionValue<number>;
  reducedMotion: boolean;
};

const TestimonialsSceneContext = createContext<TestimonialsSceneValues | null>(null);

/**
 * Global controller for the testimonial marquee.
 *
 * There are two independent signals:
 *
 * progress
 *   Controls the entrance choreography of the testimonial lanes.
 *
 * scrollVelocity
 *   Measures real page scroll velocity and is used to physically
 *   accelerate / distort the marquee while the user scrolls.
 */
export function TestimonialsScene({ children, className }: StaticDivProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  /*
   * Section-local scroll progress.
   *
   * We only use this for the entrance choreography.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 92%', 'start 42%'],
  });

  /*
   * Global page scroll velocity.
   *
   * Unlike scrollYProgress, this tells us how aggressively
   * the user is currently scrolling.
   */
  const { scrollY } = useScroll();

  const rawScrollVelocity = useVelocity(scrollY);

  /*
   * The velocity itself gets inertia.
   *
   * When the wheel / trackpad stops, the marquee does not
   * instantly lose its extra momentum.
   */
  const scrollVelocity = useSpring(rawScrollVelocity, {
    stiffness: 125,
    damping: 26,
    mass: 0.48,
    restDelta: 0.5,
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.34,
    restDelta: 0.001,
  });

  const value = useMemo(
    () => ({
      progress,
      scrollVelocity,
      reducedMotion: Boolean(reducedMotion),
    }),
    [progress, reducedMotion, scrollVelocity],
  );

  return (
    <div ref={ref} className={className}>
      <TestimonialsSceneContext.Provider value={value}>
        {children}
      </TestimonialsSceneContext.Provider>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Testimonial Marquee                               */
/* -------------------------------------------------------------------------- */

type TestimonialMarqueeDirection = 'left' | 'right';

function wrapMarquee(value: number, width: number) {
  if (!width) return value;

  return -width + ((((value + width) % width) + width) % width);
}

export function TestimonialMarquee({
  children,
  className,
  direction = 'left',
  baseVelocity = 30,
  lane = 0,
}: StaticDivProps & {
  direction?: TestimonialMarqueeDirection;
  baseVelocity?: number;
  lane?: number;
}) {
  const scene = useContext(TestimonialsSceneContext);
  const localReducedMotion = useReducedMotion();

  const reducedMotion = scene?.reducedMotion ?? Boolean(localReducedMotion);

  const viewportRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const cycleWidth = useRef(0);
  const initialized = useRef(false);
  const [copiesPerSet, setCopiesPerSet] = useState(1);

  /*
   * Actual horizontal position of the infinite track.
   */
  const x = useMotionValue(0);

  /*
   * Hovering should not hard-stop a marquee.
   *
   * Instead it smoothly falls to ~18% of normal speed.
   */
  const hoverTarget = useMotionValue(1);

  const hoverFactor = useSpring(hoverTarget, {
    stiffness: 150,
    damping: 24,
    mass: 0.42,
  });

  /*
   * Measure one complete cycle group and grow it until it covers the lane.
   *
   * Its exact width, including every trailing gap, is the seamless wrap distance.
   */
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const element = firstSetRef.current;

    if (!viewport || !element) return;

    const updateWidth = () => {
      const width = element.getBoundingClientRect().width;

      if (!width) return;

      const singleCopyWidth = width / copiesPerSet;
      const requiredCopies = Math.max(1, Math.ceil(viewport.clientWidth / singleCopyWidth));

      if (requiredCopies > copiesPerSet) {
        setCopiesPerSet(requiredCopies);
        return;
      }

      cycleWidth.current = width;

      if (!initialized.current) {
        /*
         * A right-moving lane starts one complete copy
         * to the left so it can move naturally toward x = 0.
         */
        x.set(direction === 'right' ? -width : 0);

        initialized.current = true;
      } else {
        x.set(wrapMarquee(x.get(), width));
      }
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);

    observer.observe(viewport);
    observer.observe(element);

    return () => observer.disconnect();
  }, [copiesPerSet, direction, x]);

  /*
   * The marquee is deliberately frame-driven rather than
   * transition-driven.
   *
   * This lets ambient velocity + scroll velocity + hover
   * velocity all combine into one physical movement.
   */
  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;

    const width = cycleWidth.current;

    if (!width) return;

    const rawVelocity = scene?.scrollVelocity.get() ?? 0;

    /*
     * User scrolling adds a temporary speed burst.
     *
     * We use the absolute magnitude here:
     * scrolling in either vertical direction injects energy,
     * while each lane keeps its own horizontal direction.
     */
    const scrollBoost = Math.min(Math.abs(rawVelocity) * 0.055, 170);

    const speed = (baseVelocity + scrollBoost) * hoverFactor.get();

    const directionMultiplier = direction === 'left' ? -1 : 1;

    const movement = directionMultiplier * speed * (delta / 1000);

    const next = x.get() + movement;

    x.set(wrapMarquee(next, width));
  });

  /*
   * Rows enter at slightly different moments.
   */
  const fallbackProgress = useMotionValue(1);
  const progress = scene?.progress ?? fallbackProgress;

  const input = lane === 0 ? [0, 0.12, 0.56] : [0, 0.2, 0.67];

  const opacity = useTransform(progress, input, [0, 0.28, 1], {
    clamp: true,
  });

  const y = useTransform(progress, input, [lane === 0 ? 48 : 58, 24, 0], {
    clamp: true,
  });

  const scale = useTransform(progress, input, [0.975, 0.988, 1], {
    clamp: true,
  });

  /*
   * Reduced-motion version stays completely usable.
   *
   * It becomes a horizontal overflow row instead
   * of an automatically moving marquee.
   */
  if (reducedMotion) {
    return <div className={cn('flex gap-5 overflow-x-auto px-5 pb-3', className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={viewportRef}
      className={cn('relative overflow-hidden py-2', className)}
      dir="ltr"
      onPointerEnter={() => hoverTarget.set(0.18)}
      onPointerLeave={() => hoverTarget.set(1)}
      style={{
        opacity,
        y,
        scale,
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
      }}
    >
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        {/*
         * First cycle group.
         *
         * Each content copy includes pr-5, so card and copy gaps are
         * inside the measured wrap distance.
         */}
        <div ref={firstSetRef} className="flex shrink-0">
          {Array.from({ length: copiesPerSet }, (_, index) => (
            <div
              aria-hidden={index === 0 ? undefined : true}
              className="flex shrink-0 gap-5 pr-5"
              key={index}
            >
              {children}
            </div>
          ))}
        </div>

        {/*
         * Exact duplicate cycle group.
         *
         * Hidden from assistive technology because the first content
         * copy already contains the semantic content.
         */}
        <div aria-hidden="true" className="flex shrink-0">
          {Array.from({ length: copiesPerSet }, (_, index) => (
            <div className="flex shrink-0 gap-5 pr-5" key={index}>
              {children}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Testimonial Physical Card                           */
/* -------------------------------------------------------------------------- */

export function TestimonialMotionCard({
  children,
  className,
  index = 0,
}: StaticDivProps & {
  index?: number;
}) {
  const scene = useContext(TestimonialsSceneContext);
  const localReducedMotion = useReducedMotion();

  const reducedMotion = scene?.reducedMotion ?? Boolean(localReducedMotion);

  const fallbackVelocity = useMotionValue(0);

  const velocity = scene?.scrollVelocity ?? fallbackVelocity;

  /*
   * Alternate the card lean very slightly.
   *
   * This prevents the whole marquee from behaving like one
   * perfectly rigid flat strip.
   */
  const direction = index % 2 === 0 ? 1 : -1;

  const rawRotate = useTransform(velocity, (value) => {
    const normalized = Math.max(-1, Math.min(1, value / 1800));

    return normalized * 1.75 * direction;
  });

  const rawY = useTransform(velocity, (value) => {
    const amount = Math.min(Math.abs(value) / 350, 5);

    return -amount;
  });

  const rawScale = useTransform(velocity, (value) => {
    const amount = Math.min(Math.abs(value) / 100000, 0.014);

    return 1 + amount;
  });

  const rotate = useSpring(rawRotate, {
    stiffness: 125,
    damping: 24,
    mass: 0.4,
  });

  const y = useSpring(rawY, {
    stiffness: 145,
    damping: 25,
    mass: 0.38,
  });

  const scale = useSpring(rawScale, {
    stiffness: 140,
    damping: 24,
    mass: 0.38,
  });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('shrink-0 will-change-transform', className)}
      style={{
        rotate,
        scale,
        y,
      }}
    >
      <motion.div
        className="h-full"
        transition={{
          type: 'spring',
          stiffness: 360,
          damping: 26,
        }}
        whileHover={{
          y: -8,
          scale: 1.018,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Final Journey                                 */
/* -------------------------------------------------------------------------- */

const journeyPathDelay = 0.55;
const journeyPathDuration = 2.7;
const journeyMilestoneProgress = [0.16, 0.37, 0.58, 0.78] as const;
export const journeyPortalOutlineDelay = journeyPathDelay + journeyPathDuration * 0.88;
const journeyPortalDelay = journeyPortalOutlineDelay;

type JourneySceneValues = {
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const JourneySceneContext = createContext<JourneySceneValues | null>(null);
const journeyDesktopPointer = '(hover: hover) and (pointer: fine) and (min-width: 1024px)';

function useJourneyParallax(depthX: number, depthY = depthX * 0.72) {
  const scene = useContext(JourneySceneContext);
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const sourceX = scene?.x ?? fallbackX;
  const sourceY = scene?.y ?? fallbackY;

  return {
    x: useTransform(sourceX, (value) => value * depthX),
    y: useTransform(sourceY, (value) => value * depthY),
  };
}

export function JourneyScene({
  'aria-label': ariaLabel,
  children,
  className,
  dir,
}: StaticDivProps & {
  'aria-label': string;
  dir: 'ltr' | 'rtl';
}) {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 92, damping: 24, mass: 0.52 });
  const y = useSpring(pointerY, { stiffness: 92, damping: 24, mass: 0.52 });
  const bounds = useRef<DOMRect | null>(null);
  const values = useMemo(() => ({ x, y }), [x, y]);

  useEffect(() => {
    if (reducedMotion) {
      pointerX.jump(0);
      pointerY.jump(0);
    }
  }, [pointerX, pointerY, reducedMotion]);

  if (reducedMotion) {
    return (
      <JourneySceneContext.Provider value={values}>
        <div aria-label={ariaLabel} className={className} dir={dir} role="group">
          {children}
        </div>
      </JourneySceneContext.Provider>
    );
  }

  return (
    <JourneySceneContext.Provider value={values}>
      <motion.div
        aria-label={ariaLabel}
        className={className}
        dir={dir}
        initial="hidden"
        onPointerEnter={(event) => {
          bounds.current = event.currentTarget.getBoundingClientRect();
        }}
        onPointerLeave={() => {
          bounds.current = null;
          pointerX.set(0);
          pointerY.set(0);
        }}
        onPointerMove={(event) => {
          if (window.matchMedia(journeyDesktopPointer).matches) {
            const rect = bounds.current ?? event.currentTarget.getBoundingClientRect();
            pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
            pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
          } else {
            pointerX.set(0);
            pointerY.set(0);
          }
        }}
        role="group"
        viewport={{ amount: 0.28, once: true }}
        whileInView="visible"
      >
        {children}
      </motion.div>
    </JourneySceneContext.Provider>
  );
}

export function JourneyAmbientMotion({ children, className }: StaticDivProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.62, ease: easeOut } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function JourneyCopyMotion({ children, className }: StaticDivProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { filter: 'blur(3px)', opacity: 0, y: 10 },
        visible: {
          filter: 'blur(0px)',
          opacity: 1,
          y: 0,
          transition: { delay: 0.04, duration: 0.58, ease: easeOut },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function JourneyStartMotion({ children, className }: StaticDivProps) {
  const reducedMotion = useReducedMotion();
  const parallax = useJourneyParallax(4, 3);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div style={parallax}>
      <motion.div
        className={className}
        variants={{
          hidden: { opacity: 0, scale: 0.985, x: -14, y: 6 },
          visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            transition: { delay: 0.2, duration: 0.62, ease: easeOut },
          },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function JourneyPathMotion({
  className,
  d,
  delay = journeyPathDelay,
  duration = journeyPathDuration,
  filter,
  opacity = 1,
  stroke = 'currentColor',
  strokeWidth = 4,
}: {
  className?: string;
  d: string;
  delay?: number;
  duration?: number;
  filter?: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <path
        className={className}
        d={d}
        fill="none"
        filter={filter}
        opacity={opacity}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <motion.path
      className={className}
      d={d}
      fill="none"
      filter={filter}
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      variants={{
        hidden: { opacity: 0, pathLength: 0 },
        visible: {
          opacity,
          pathLength: 1,
          transition: { delay, duration, ease: 'linear' },
        },
      }}
    />
  );
}

export function JourneyMilestoneMotion({
  accent = false,
  bubbleX,
  bubbleY,
  children,
  className,
  filter,
  index,
  radius = 33,
  x,
  y,
}: StaticDivProps & {
  accent?: boolean;
  bubbleX: number;
  bubbleY: number;
  filter?: string;
  index: number;
  radius?: number;
  x: number;
  y: number;
}) {
  const reducedMotion = useReducedMotion();
  const parallax = useJourneyParallax(2.5, 2);
  const dx = x - bubbleX;
  const dy = y - bubbleY;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const connectorX = bubbleX + (dx / distance) * (radius + 4);
  const connectorY = bubbleY + (dy / distance) * (radius + 4);
  const connectorPath = `M ${x} ${y} L ${connectorX} ${connectorY}`;
  const badgeX = bubbleX + radius * 0.68;
  const badgeY = bubbleY + radius * 0.68;
  const arrival = journeyPathDelay + journeyPathDuration * journeyMilestoneProgress[index]!;
  const badgeFill = accent ? '#F4C379' : '#143CFB';

  const bubble = (
    <>
      <circle
        cx={bubbleX}
        cy={bubbleY}
        fill="#FFFFFF"
        fillOpacity="0.54"
        filter={filter}
        r={radius + 2}
      />
      <circle
        cx={bubbleX}
        cy={bubbleY}
        fill="#FFFFFF"
        fillOpacity="0.98"
        r={radius}
        stroke="#E6EAF5"
        strokeOpacity="0.86"
        strokeWidth="1"
      />
      {children}
    </>
  );

  const badge = (
    <>
      <circle cx={badgeX} cy={badgeY} fill="#FFFFFF" r="8.6" />
      <circle cx={badgeX} cy={badgeY} fill={badgeFill} r="7" />
      <path
        d={`M ${badgeX - 2.7} ${badgeY + 0.1} l 1.85 2 3.5 -3.95`}
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.55"
      />
    </>
  );

  if (reducedMotion) {
    return (
      <g className={className}>
        <circle cx={x} cy={y} fill="#143CFB" fillOpacity="0.1" r="8.5" />
        <circle cx={x} cy={y} fill="#143CFB" r="4.7" />
        <path
          d={connectorPath}
          fill="none"
          stroke="#AAB9EE"
          strokeDasharray="2 5.5"
          strokeLinecap="round"
          strokeWidth="1"
        />
        {bubble}
        {badge}
      </g>
    );
  }

  return (
    <g className={className}>
      <motion.circle
        cx={x}
        cy={y}
        fill="#143CFB"
        fillOpacity="0.1"
        r="8.5"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { delay: arrival, duration: 0.34, ease: easeOut },
          },
        }}
      />
      <motion.circle
        cx={x}
        cy={y}
        fill="#143CFB"
        r="4.7"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { delay: arrival, duration: 0.34, ease: easeOut },
          },
        }}
      />
      <motion.path
        d={connectorPath}
        fill="none"
        stroke="#AAB9EE"
        strokeDasharray="2 5.5"
        strokeLinecap="round"
        strokeWidth="1"
        variants={{
          hidden: { opacity: 0, pathLength: 0 },
          visible: {
            opacity: 0.58,
            pathLength: 1,
            transition: { delay: arrival + 0.07, duration: 0.3, ease: easeOut },
          },
        }}
      />
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        variants={{
          hidden: { filter: 'blur(4px)', opacity: 0, scale: 0.94, y: 10 },
          visible: {
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { delay: arrival + 0.22, duration: 0.5, ease: easeOut },
          },
        }}
      >
        <motion.g style={parallax}>
          {bubble}
          <motion.g
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            variants={{
              hidden: { opacity: 0, scale: 0.6 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { delay: arrival + 0.6, duration: 0.3, ease: easeOut },
              },
            }}
          >
            {badge}
          </motion.g>
        </motion.g>
      </motion.g>
    </g>
  );
}

type PortalStage = 'beam' | 'endpoint' | 'glow' | 'outline' | 'pulse' | 'sparkles';

const portalStageVariants: Record<PortalStage, Variants> = {
  outline: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: journeyPortalDelay, duration: 0.5, ease: easeOut },
    },
  },
  glow: {
    hidden: { opacity: 0, scale: 0.985 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: journeyPortalDelay + 0.18, duration: 0.82, ease: easeOut },
    },
  },
  beam: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: journeyPortalDelay + 0.36, duration: 0.9, ease: easeOut },
    },
  },
  endpoint: {
    hidden: { opacity: 0, scale: 0.72 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: journeyPathDelay + journeyPathDuration - 0.04, duration: 0.45 },
    },
  },
  pulse: {
    hidden: { opacity: 0, scale: 1 },
    visible: {
      opacity: [0, 0.55, 0],
      scale: [1, 1.5, 1],
      transition: {
        delay: journeyPathDelay + journeyPathDuration,
        duration: 0.65,
        ease: easeOut,
      },
    },
  },
  sparkles: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: journeyPortalDelay + 0.62, duration: 0.55, ease: easeOut },
    },
  },
};

export function FuturePortalMotion({
  children,
  className,
  stage = 'outline',
}: StaticDivProps & { stage?: PortalStage }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return stage === 'pulse' ? null : <g className={className}>{children}</g>;
  }

  return (
    <motion.g
      className={className}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      variants={portalStageVariants[stage]}
    >
      <g>{children}</g>
    </motion.g>
  );
}

export function JourneyDecorationMotion({
  children,
  className,
  depth = 3,
  index = 0,
}: StaticDivProps & { depth?: number; index?: number }) {
  const reducedMotion = useReducedMotion();
  const parallax = useJourneyParallax(depth);

  if (reducedMotion) {
    return <g className={className}>{children}</g>;
  }

  return (
    <motion.g
      className={className}
      style={parallax}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delay: journeyPathDelay + journeyPathDuration + 0.28 + index * 0.08,
            duration: 0.58,
            ease: easeOut,
          },
        },
      }}
    >
      {children}
    </motion.g>
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
