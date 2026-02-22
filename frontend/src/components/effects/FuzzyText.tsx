'use client';

import { useState, useEffect } from 'react';

interface FuzzyTextProps {
  text: string;
  className?: string;
  intensity?: number;
}

// React Bits Fuzzy Text Effect - for error pages
export default function FuzzyText({ text, className = '', intensity = 0.3 }: FuzzyTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const interval = setInterval(() => {
      const result = text
        .split('')
        .map((char) => {
          if (char === ' ') return ' ';
          if (Math.random() < intensity) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
          return char;
        })
        .join('');
      setDisplayText(result);
    }, 80);

    return () => clearInterval(interval);
  }, [text, intensity]);

  return (
    <span className={`font-mono ${className}`}>
      {displayText}
    </span>
  );
}
