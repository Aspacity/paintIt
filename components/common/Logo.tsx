"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  /** Size variant: 'sm' (default), 'md', or 'lg' */
  size?: "sm" | "md" | "lg";
  /** Optional custom logo image URL (e.g. '/images/logo.png' or '/logo.svg') */
  logoSrc?: string;
  /** Show optional sub-badge text under the logo mark */
  subtitle?: string;
  /** Disable navigation link wrapper if rendered inside non-link elements */
  noLink?: boolean;
  /** Additional custom classNames for the container */
  className?: string;
  /** Force text color overrides if needed */
  textColor?: string;
}

/**
 * Centralized PaintIT Logo Component.
 * 
 * To switch to a custom image logo when ready:
 * Simply pass the `logoSrc="/images/logo.png"` prop or place a `/public/logo.svg` file!
 */
export default function Logo({
  size = "md",
  logoSrc,
  subtitle,
  noLink = false,
  className = "",
  textColor,
}: LogoProps) {
  const [imageError, setImageError] = useState(false);

  // Size styling maps
  const iconSizeClasses = {
    sm: "w-7 h-7 text-xs font-bold rounded-md",
    md: "w-8 h-8 text-sm font-extrabold rounded-lg",
    lg: "w-10 h-10 text-base font-black rounded-xl",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-xl sm:text-2xl",
  };

  const imageDimensions = {
    sm: { width: 28, height: 28 },
    md: { width: 34, height: 34 },
    lg: { width: 42, height: 42 },
  };

  const activeLogoSrc = logoSrc || undefined;

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Icon Mark or Image Logo */}
      {activeLogoSrc && !imageError ? (
        <div className="relative shrink-0 flex items-center justify-center">
          <Image
            src={activeLogoSrc}
            alt="PaintIT"
            width={imageDimensions[size].width}
            height={imageDimensions[size].height}
            onError={() => setImageError(true)}
            className="object-contain transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className={`${iconSizeClasses[size]} bg-[#FF8C38] text-black flex items-center justify-center tracking-widest transition-transform group-hover:scale-105 shadow-xs shrink-0 font-sans`}>
          P
        </div>
      )}

      {/* Typography Mark */}
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight leading-tight font-sans ${textSizeClasses[size]} ${textColor || "text-current"}`}>
          PaintIT<span className="text-[#FF8C38]">.</span>
        </span>
        {subtitle && (
          <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-400 -mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (noLink) {
    return logoContent;
  }

  return (
    <Link href="/" className="inline-flex items-center">
      {logoContent}
    </Link>
  );
}
