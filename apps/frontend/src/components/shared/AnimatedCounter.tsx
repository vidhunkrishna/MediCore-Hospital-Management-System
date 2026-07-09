import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, duration = 1200, suffix = '', prefix = '', decimals = 0 }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const startValRef = useRef(0);

  useEffect(() => {
    let frameId = 0;
    let startTime: number | null = null;

    // Read the current display value before the animation starts
    setDisplay((current) => {
      startValRef.current = current;
      return current;
    });

    const animate = (ts: number) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startValRef.current + (value - startValRef.current) * eased);
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <>{prefix}{formatted}{suffix}</>;
}
