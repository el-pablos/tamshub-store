'use client';

import { useEffect, useRef } from 'react';

// React Bits Laser Flow Effect - for hero section
export default function LaserFlow({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Draw laser beams
      for (let i = 0; i < 5; i++) {
        const y = canvas.height * 0.2 + (canvas.height * 0.6 * i / 5);
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
        gradient.addColorStop(0.3 + Math.sin(time + i) * 0.2, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
        gradient.addColorStop(0.7 + Math.cos(time + i) * 0.2, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.moveTo(0, y);

        for (let x = 0; x < canvas.width; x += 5) {
          const wave = Math.sin(x * 0.01 + time * 2 + i) * 20;
          ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none opacity-60 ${className}`}
    />
  );
}
