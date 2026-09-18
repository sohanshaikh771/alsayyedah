"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface PremiumButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
}

const variantStyles: Record<"primary" | "outline" | "ghost", string> = {
  primary: "bg-taupe text-cream hover:bg-gold",
  outline: "border-2 border-taupe text-taupe hover:bg-taupe hover:text-cream",
  ghost: "text-taupe hover:bg-beige",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3",
  lg: "px-8 py-4 text-lg",
};

export default function PremiumButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  target,
  rel,
}: PremiumButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-medium tracking-wide rounded-md transition-all duration-300 cursor-pointer select-none text-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  const motionProps = disabled
    ? {}
    : {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      };

  if (href) {
    const isExternal = href.startsWith("http") || target === "_blank";

    if (isExternal) {
      return (
        <motion.a
          href={href}
          target={target}
          rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
          className={combinedClasses}
          {...motionProps}
        >
          {children}
        </motion.a>
      );
    }

    return (
      <Link href={href} legacyBehavior passHref>
        <motion.a
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
          className={combinedClasses}
          {...motionProps}
        >
          {children}
        </motion.a>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      className={combinedClasses}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
