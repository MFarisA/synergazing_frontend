"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode, useEffect, useState } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

// Hook to detect mobile devices and performance capability
const useDeviceCapability = () => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if it's a mobile device
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Simple performance check - measure how long it takes to do some calculations
    const start = performance.now();
    for (let i = 0; i < 100000; i++) {
      Math.random() * Math.random();
    }
    const end = performance.now();
    
    // If it takes more than 10ms for simple calculations, consider it low-end
    // Also check for hardware concurrency (CPU cores) and memory if available
    const isSlowCPU = (end - start) > 10;
    const hasLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2;
    
    setIsLowEndDevice(isSlowCPU || hasLowCores || hasLowMemory || checkMobile);
  }, []);

  return { isLowEndDevice, isMobile };
};

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  const { isLowEndDevice, isMobile } = useDeviceCapability();

  // Simplified gradient for low-end devices
  const getSimplifiedStyles = () => {
    if (isLowEndDevice) {
      return {
        "--simple-gradient": "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
      } as React.CSSProperties;
    }
    
    return {
      "--aurora":
        "repeating-linear-gradient(100deg,#3b82f6_10%,#a5b4fc_15%,#93c5fd_20%,#ddd6fe_25%,#60a5fa_30%)",
      "--dark-gradient":
        "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
      "--white-gradient":
        "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",
      "--blue-300": "#93c5fd",
      "--blue-400": "#60a5fa",
      "--blue-500": "#3b82f6",
      "--indigo-300": "#a5b4fc",
      "--violet-200": "#ddd6fe",
      "--black": "#000",
      "--white": "#fff",
      "--transparent": "transparent",
    } as React.CSSProperties;
  };

  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-zinc-50 text-slate-950 dark:bg-zinc-900",
          className,
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={getSimplifiedStyles()}
        >
          {isLowEndDevice ? (
            // Simplified version for low-end devices - no blur, no complex animations
            <div
              className={cn(
                "pointer-events-none absolute inset-0 opacity-30",
                "bg-gradient-to-br from-blue-500/20 via-indigo-300/20 to-violet-200/20",
                isMobile && "transform-gpu", // Use GPU acceleration on mobile
              )}
              style={{
                background: "var(--simple-gradient)",
                opacity: 0.3,
              }}
            />
          ) : (
            // Full aurora effect for high-end devices
            <div
              className={cn(
                `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-50 blur-[10px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
                showRadialGradient &&
                  `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
              )}
            />
          )}
        </div>
        {children}
      </div>
    </main>
  );
};
