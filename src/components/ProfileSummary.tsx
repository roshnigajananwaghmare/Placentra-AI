import {
  User,
  GraduationCap,
  Target,
  FolderGit2,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Badge } from './ui/Badge';
import type { StudentFormValues } from '../types';

interface ProfileSummaryProps {
  profile: StudentFormValues;
}

interface SkillBarProps {
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  suffix?: string;
  delay?: number;
}

function SkillBar({ label, value, max, icon, suffix = '', delay = 0 }: SkillBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const tone =
    pct >= 75
      ? 'from-accent-500 to-accent-400'
      : pct >= 50
        ? 'from-brand-500 to-brand-400'
        : 'from-amber-500 to-amber-400';

  return (
    <div className="group" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-ink-600 dark:text-ink-300">
          <span className="text-ink-400 dark:text-ink-500">{icon}</span>
          {label}
        </span>
        <span className="text-sm font-bold tabular-nums text-ink-900 dark:text-ink-100">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const cgpa = Number(profile.cgpa) || 0;
  const apt = Number(profile.aptitudeScore) || 0;
  const proj = Number(profile.projects) || 0;
  const comm = Number(profile.communication) || 0;
  const hasInternship = profile.internship === 'yes';

  const initials = profile.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

  return (
    <Card className="animate-fade-in-up overflow-hidden">
      <div
        aria-hidden
        className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #3377ff 0%, #10b981 100%)' }}
      />
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Recruiter-ready snapshot of the candidate.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Identity row */}
        <div className="flex items-center gap-4 rounded-xl border border-ink-100 bg-ink-50/50 p-4 dark:border-ink-800 dark:bg-ink-800/30">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-500 font-display text-lg font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-ink-900 dark:text-ink-50">
              {profile.fullName || 'Unknown Candidate'}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={hasInternship ? 'success' : 'neutral'} dot>
                {hasInternship ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Internship
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" /> No internship
                  </>
                )}
              </Badge>
              <Badge tone="brand">
                <FolderGit2 className="h-3 w-3" />
                {proj} {proj === 1 ? 'project' : 'projects'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Skill bars */}
        <div className="mt-5 space-y-4">
          <SkillBar
            label="CGPA"
            value={cgpa}
            max={10}
            suffix=" / 10"
            icon={<GraduationCap className="h-4 w-4" />}
            delay={100}
          />
          <SkillBar
            label="Aptitude Score"
            value={apt}
            max={100}
            suffix=" / 100"
            icon={<Target className="h-4 w-4" />}
            delay={200}
          />
          <SkillBar
            label="Communication Skills"
            value={comm}
            max={10}
            suffix=" / 10"
            icon={<MessageSquare className="h-4 w-4" />}
            delay={300}
          />
        </div>

        {/* Quick facts */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
          <div className="flex items-center gap-2.5 rounded-lg bg-ink-50 px-3 py-2.5 dark:bg-ink-800/50">
            <Briefcase className="h-4 w-4 text-ink-400 dark:text-ink-500" />
            <div>
              <p className="text-xs text-ink-400 dark:text-ink-500">Experience</p>
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                {hasInternship ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg bg-ink-50 px-3 py-2.5 dark:bg-ink-800/50">
            <FolderGit2 className="h-4 w-4 text-ink-400 dark:text-ink-500" />
            <div>
              <p className="text-xs text-ink-400 dark:text-ink-500">Projects</p>
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{proj}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
