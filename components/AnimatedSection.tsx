"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedSectionProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  once = true,
  amount = 0.2,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}
