"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLDivElement | null>;
  customVariants?: any;
  className?: string;
  children?: React.ReactNode;
  as?: string;
  [key: string]: unknown;
}

export function TimelineContent({
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  as: Tag = "div",
  ...props
}: TimelineContentProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = timelineRef || localRef;
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = customVariants || {
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
    hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  };

  const MotionDiv = motion.div;

  return (
    <MotionDiv
      ref={ref as any}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}
