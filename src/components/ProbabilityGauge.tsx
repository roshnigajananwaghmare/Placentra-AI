import { useEffect, useState } from 'react';

interface ProbabilityGaugeProps {
  value: number;
  size?: number;
  stroke?: number;
}

export function ProbabilityGauge({ value, size = 180, stroke = 14 }: ProbabilityGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  useEffect(() => {
    setAnimated(0);
    const id = requestAnimationFrame(() => {
      const start = performance.now();
      const duration = 1100;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setAnimated(clamped * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  const offset = circumference - (animated / 100) * circumference;
  const display = Math.round(animated);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-ink-100 dark:text-ink-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3377ff" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-extrabold tabular-nums text-ink-900 dark:text-ink-50">
          {display}
          <span className="text-2xl">%</span>
        </span>
        <span className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">
          Probability
        </span>
      </div>
    </div>
  );
}
