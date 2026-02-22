'use client';

import { useEffect, useRef } from 'react';

interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  speed?: number;
}

export default function ElectricBorder({
  children,
  className = '',
  color = '#6366f1',
  speed = 3,
}: ElectricBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    let angle = 0;
    let animationId: number;

    const animate = () => {
      angle = (angle + speed) % 360;
      el.style.setProperty('--border-angle', `${angle}deg`);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl p-[1px] ${className}`}
      style={{
        background: `conic-gradient(from var(--border-angle, 0deg), transparent 40%, ${color}, transparent 60%)`,
      }}
    >
      <div className="rounded-xl bg-gray-900/95 backdrop-blur-sm h-full w-full">
        {children}
      </div>
    </div>
  );
}
