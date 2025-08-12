'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LoadingAnimationProps {
  className?: string;
  loadingText?: string;
}

/**
 * A full-page loading animation with a "thunderstruck" zap effect.
 * It features a central pulsing lightning bolt and an expanding shockwave.
 */
export function LoadingAnimation({ className, loadingText = "Loading..." }: LoadingAnimationProps) {
  return (
    <>
      {/* We inject the CSS animations directly into the JSX for self-containment */}
      <style jsx global>{`
        @keyframes zap-flash {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        @keyframes shockwave {
          0% {
            transform: scale(0);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
      <div
        className={cn(
          "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
          className
        )}
      >
        <div className="relative flex items-center justify-center w-48 h-48">
          {/* Shockwave effect circles */}
          <div
            className="absolute w-full h-full rounded-full bg-primary/50"
            style={{ animation: 'shockwave 1.5s ease-out infinite' }}
          />
          <div
            className="absolute w-full h-full rounded-full bg-primary/30"
            style={{ animation: 'shockwave 1.5s ease-out infinite', animationDelay: '0.5s' }}
          />
          
          {/* Central Zap Icon */}
          <div
            className="relative flex items-center justify-center w-24 h-24 bg-primary/20 rounded-full"
            style={{ animation: 'zap-flash 2s ease-in-out infinite' }}
          >
            <div className="w-8 h-8 flex items-center justify-center">
                        <Image 
                          src="/synergazing.svg" 
                          alt="Synergazing Logo" 
                          width={20} 
                          height={20} 
                          className="text-white" 
                        />
                      </div>
          </div>
        </div>
        
        {/* Loading Text */}
        {loadingText && (
            <p className="mt-4 text-lg font-medium text-foreground animate-pulse">
                {loadingText}
            </p>
        )}
      </div>
    </>
  );
}

// Default export for Next.js loading page
export default function Loading() {
  return <LoadingAnimation />;
}
