import { History, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Badge } from './ui/Badge';
import type { HistoryEntry, PlacementStatus } from '../types';

interface PredictionHistoryProps {
  entries: HistoryEntry[];
  onClear: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusTone: Record<PlacementStatus, 'success' | 'warning' | 'neutral'> = {
  likely: 'success',
  moderate: 'warning',
  unlikely: 'neutral',
};

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

export function PredictionHistory({ entries, onClear }: PredictionHistoryProps) {
  if (entries.length === 0) return null;

  const avg = Math.round(entries.reduce((s, e) => s + e.probability, 0) / entries.length);
  const best = Math.max(...entries.map((e) => e.probability));

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
              <History className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Prediction History</CardTitle>
              <CardDescription>
                Recent predictions across all candidates.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-ink-400 dark:text-ink-500">Avg · Best</p>
              <p className="text-sm font-bold tabular-nums text-ink-900 dark:text-ink-100">
                {avg}% · {best}%
              </p>
            </div>
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-ink-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {entries.map((entry, idx) => {
            const TrendIcon =
              entry.probability >= 75 ? TrendingUp : entry.probability >= 50 ? Minus : TrendingDown;
            const trendColor =
              entry.probability >= 75
                ? 'text-accent-600 dark:text-accent-400'
                : entry.probability >= 50
                  ? 'text-ink-500 dark:text-ink-400'
                  : 'text-red-500 dark:text-red-400';
            return (
              <div
                key={entry.id}
                className="group flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-3.5 transition-all duration-200 hover:border-brand-200 hover:shadow-sm dark:border-ink-800 dark:bg-ink-800/40 dark:hover:border-brand-500/30"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-500 font-display text-xs font-bold text-white">
                  {initials(entry.studentName)}
                </div>

                {/* Name + time */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">
                    {entry.studentName}
                  </p>
                  <p className="text-xs text-ink-400 dark:text-ink-500">
                    {timeAgo(entry.generatedAt)}
                  </p>
                </div>

                {/* Status badge */}
                <Badge tone={statusTone[entry.status]} dot className="hidden sm:inline-flex">
                  {entry.statusLabel}
                </Badge>

                {/* Probability */}
                <div className="flex items-center gap-2">
                  <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                  <span className="font-display text-lg font-bold tabular-nums text-ink-900 dark:text-ink-50">
                    {entry.probability}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
