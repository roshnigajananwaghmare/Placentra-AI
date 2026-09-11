import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { cn } from '../utils/cn';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  accent: 'brand' | 'success' | 'warning' | 'neutral';
  delay?: number;
  decimals?: number;
}

const accentMap = {
  brand: {
    icon: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    bar: 'from-brand-500 to-brand-400',
    glow: 'group-hover:shadow-glow',
  },
  success: {
    icon: 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
    bar: 'from-accent-500 to-accent-400',
    glow: 'group-hover:shadow-glow',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    bar: 'from-amber-500 to-amber-400',
    glow: 'group-hover:shadow-glow',
  },
  neutral: {
    icon: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-400',
    bar: 'from-ink-500 to-ink-400',
    glow: '',
  },
} as const;

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(target * eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, display: value.toFixed(decimals) };
}

export function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  icon,
  trend,
  trendLabel,
  accent,
  delay = 0,
  decimals = 0,
}: StatCardProps) {
  const { ref, display } = useCountUp(value, 1200, decimals);
  const cfg = accentMap[accent];

  const TrendIcon = trend === undefined ? Minus : trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor =
    trend === undefined
      ? 'text-ink-400 dark:text-ink-500'
      : trend >= 0
        ? 'text-accent-600 dark:text-accent-400'
        : 'text-red-500 dark:text-red-400';

  return (
    <Card
      hover
      ref={ref}
      className={cn('group relative overflow-hidden animate-fade-in-up', cfg.glow)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Accent bar */}
      <div
        className={cn('absolute left-0 top-0 h-full w-1 bg-gradient-to-b', cfg.bar)}
        aria-hidden
      />
      <CardContent className="pl-7">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
              cfg.icon,
            )}
          >
            {icon}
          </div>
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs font-semibold', trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trend >= 0 ? '+' : ''}
              {trend}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-ink-500 dark:text-ink-400">{label}</p>
          <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-ink-900 dark:text-ink-50">
            {prefix}
            {display}
            {suffix}
          </p>
          {trendLabel && (
            <p className={cn('mt-1 text-xs font-medium', trendColor)}>{trendLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}
