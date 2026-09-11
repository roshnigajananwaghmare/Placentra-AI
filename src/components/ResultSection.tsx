import {
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Download,
  Share2,
  GraduationCap,
  Target,
  FolderGit2,
  Briefcase,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ProbabilityGauge } from './ProbabilityGauge';
import type { PredictionResult, PlacementStatus, StudentFormValues } from '../types';

interface ResultSectionProps {
  result: PredictionResult;
  onReset: () => void;
}

const statusConfig: Record<
  PlacementStatus,
  {
    tone: 'success' | 'warning' | 'neutral';
    icon: typeof CheckCircle2;
    ring: string;
    label: string;
  }
> = {
  likely: {
    tone: 'success',
    icon: ShieldCheck,
    ring: 'ring-accent-200 bg-accent-50 dark:bg-accent-500/10 dark:ring-accent-500/30',
    label: 'Strong placement potential',
  },
  moderate: {
    tone: 'warning',
    icon: AlertTriangle,
    ring: 'ring-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:ring-amber-500/30',
    label: 'Moderate placement potential',
  },
  unlikely: {
    tone: 'neutral',
    icon: XCircle,
    ring: 'ring-ink-200 bg-ink-50 dark:bg-ink-800 dark:ring-ink-700',
    label: 'Needs significant improvement',
  },
};

interface Signal {
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  weight: string;
}

function getSignals(profile: StudentFormValues): Signal[] {
  const cgpa = Number(profile.cgpa) || 0;
  const apt = Number(profile.aptitudeScore) || 0;
  const proj = Number(profile.projects) || 0;
  const comm = Number(profile.communication) || 0;
  const intern = profile.internship === 'yes' ? 100 : 0;

  return [
    { label: 'Academic (CGPA)', value: cgpa, max: 10, icon: <GraduationCap className="h-4 w-4" />, weight: '25%' },
    { label: 'Aptitude', value: apt, max: 100, icon: <Target className="h-4 w-4" />, weight: '20%' },
    { label: 'Projects', value: Math.min(proj * 20, 100), max: 100, icon: <FolderGit2 className="h-4 w-4" />, weight: '20%' },
    { label: 'Internship', value: intern, max: 100, icon: <Briefcase className="h-4 w-4" />, weight: '15%' },
    { label: 'Communication', value: comm, max: 10, icon: <MessageSquare className="h-4 w-4" />, weight: '20%' },
  ];
}

export function ResultSection({ result, onReset }: ResultSectionProps) {
  const cfg = statusConfig[result.status];
  const StatusIcon = cfg.icon;
  const generated = new Date(result.generatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const signals = getSignals(result.profile);

  return (
    <div className="space-y-5">
      {/* Main result card */}
      <Card className="animate-fade-in-up overflow-hidden">
        <div
          aria-hidden
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #3377ff 0%, #10b981 100%)' }}
        />
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Prediction Result</CardTitle>
              <CardDescription>
                Generated for{' '}
                <span className="font-semibold text-ink-700 dark:text-ink-200">
                  {result.studentName}
                </span>{' '}
                · {generated}
              </CardDescription>
            </div>
            <Badge tone={cfg.tone} dot>
              <StatusIcon className="h-3.5 w-3.5" />
              {result.statusLabel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-10">
            <div className="flex shrink-0 flex-col items-center">
              <ProbabilityGauge value={result.probability} />
              <div
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset ${cfg.ring}`}
              >
                <StatusIcon className="h-4 w-4" />
                {cfg.label}
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <StatTile
                icon={<TrendingUp className="h-4 w-4" />}
                label="Placement Probability"
                value={`${result.probability}%`}
                tone="brand"
              />
              <StatTile
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Status"
                value={result.statusLabel}
                tone="success"
              />
              <StatTile
                icon={<Lightbulb className="h-4 w-4" />}
                label="Suggestions"
                value={`${result.suggestions.length} actions`}
                tone="warning"
              />
              <StatTile
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Confidence"
                value="High"
                tone="neutral"
              />
            </div>
          </div>

          {/* Signal breakdown */}
          <div className="mt-6 border-t border-ink-100 pt-5 dark:border-ink-800">
            <p className="mb-4 text-sm font-semibold text-ink-700 dark:text-ink-300">
              Signal Breakdown
            </p>
            <div className="space-y-3">
              {signals.map((sig, idx) => {
                const pct = Math.min(100, (sig.value / sig.max) * 100);
                const tone =
                  pct >= 75
                    ? 'from-accent-500 to-accent-400'
                    : pct >= 50
                      ? 'from-brand-500 to-brand-400'
                      : 'from-amber-500 to-amber-400';
                return (
                  <div key={sig.label} className="group">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-ink-600 dark:text-ink-400">
                        <span className="text-ink-400 dark:text-ink-500">{sig.icon}</span>
                        {sig.label}
                        <span className="text-ink-300 dark:text-ink-600">· {sig.weight}</span>
                      </span>
                      <span className="font-bold tabular-nums text-ink-700 dark:text-ink-300">
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-1000 ease-out`}
                        style={{ width: `${pct}%`, transitionDelay: `${idx * 100}ms` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
            <Button variant="secondary" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Download report
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Share2 className="h-4 w-4" />}>
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="ml-auto"
            >
              New prediction
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions card */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Personalized Suggestions</CardTitle>
              <CardDescription>
                Recommended actions to improve your placement probability.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="group flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-4 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/40 hover:shadow-sm dark:border-ink-800 dark:bg-ink-800/30 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-ink-700 group-hover:text-ink-900 dark:text-ink-300 dark:group-hover:text-ink-100">
                  {suggestion}
                </span>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-brand-500 dark:text-ink-600" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'brand' | 'success' | 'warning' | 'neutral';
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    success: 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-400',
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3.5 transition-colors hover:border-ink-200 dark:border-ink-800 dark:bg-ink-800/50 dark:hover:border-ink-700">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-400 dark:text-ink-500">{label}</p>
        <p className="truncate text-sm font-bold text-ink-900 dark:text-ink-100">{value}</p>
      </div>
    </div>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
