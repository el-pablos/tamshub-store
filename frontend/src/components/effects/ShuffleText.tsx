'use client';

import { useEffect, useRef, useState } from 'react';

interface ShuffleTextProps {
  text: string;
  className?: string;
  duration?: number;
}

// React Bits Shuffle Text Effect
export default function ShuffleText({ text, className = '', duration = 2000 }: ShuffleTextProps) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const totalChars = text.length;
    const iterationsPerChar = Math.max(1, Math.floor(duration / (totalChars * 30)));

    intervalRef.current = setInterval(() => {
      const revealed = Math.floor(iteration / iterationsPerChar);
      const result = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < revealed) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      setDisplayText(result);
      iteration++;

      if (revealed >= totalChars) {
        setDisplayText(text);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, duration]);

  return (
    <span className={`font-bold ${className}`}>
      {displayText}
    </span>
  );
}
