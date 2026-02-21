import React from "react";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  showRadialGradient?: boolean;
}

/**
 * Aurora animated background (no content by default).
 * Wrap any page/section with this component to get moving “aurora” lights.
 */
export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-background text-foreground",
        className,
      )}
      {...props}
    >
      {/* Animated aurora layer */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-70",
          "animate-aurora",
          "[background-size:200%_200%,200%_200%]",
          "[background-image:radial-gradient(closest-side_at_20%_10%,hsl(var(--primary)/0.22),transparent_60%),radial-gradient(closest-side_at_85%_20%,hsl(var(--success)/0.16),transparent_62%)]",
        )}
      />

      {/* Optional vignette/radial focus */}
      {showRadialGradient ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(900px_520px_at_50%_0%,hsl(var(--foreground)/0.06),transparent_60%)]"
        />
      ) : null}

      <div className="relative">{children}</div>
    </div>
  );
}
