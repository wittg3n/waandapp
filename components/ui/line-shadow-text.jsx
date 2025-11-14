"use client";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function LineShadowText({
  children,
  shadowColor = "black",
  className,
  ...props
}) {
  if (typeof children !== "string") {
    throw new Error("LineShadowText only accepts string content");
  }

  return (
    <motion.span
      style={{
        "--shadow-color": shadowColor,
      }}
      className={cn(
        "relative z-0 inline-flex",
        "after:absolute after:top-[0.08em] after:left-[0.08em] after:content-[attr(data-text)]",
        "after:bg-[linear-gradient(45deg,transparent_45%,var(--color-blue)_45%,var(--shadow-color)_55%,transparent_0)]",
        "after:-z-10 after:bg-[length:0.08em_0.06em] after:bg-clip-text after:text-transparent",
        "after:animate-line-shadow",
        className
      )}
      data-text={children}
      {...props}
    >
      {children}
    </motion.span>
  );
}
