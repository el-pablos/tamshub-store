'use client';

import { useEffect, useRef } from 'react';

interface ClickSparkProps {
  children: React.ReactNode;
}

// React Bits Click Spark Effect
export default function ClickSpark({ children }: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const handleClick = (e: MouseEvent) => {
      const sparkCount = 8;
      for (let i = 0; i < sparkCount; i++) {
        createSpark(e.clientX, e.clientY);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const createSpark = (x: number, y: number) => {
    const spark = document.createElement('div');
    const angle = Math.random() * 360;
    const distance = Math.random() * 60 + 20;
    const size = Math.random() * 4 + 2;

    spark.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: sparkFly 0.6s ease-out forwards;
    `;

    const dx = Math.cos(angle * Math.PI / 180) * distance;
    const dy = Math.sin(angle * Math.PI / 180) * distance;

    spark.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 },
    ], {
      duration: 600,
      easing: 'ease-out',
    }).onfinish = () => spark.remove();

    document.body.appendChild(spark);
  };

  return <div ref={containerRef}>{children}</div>;
}
