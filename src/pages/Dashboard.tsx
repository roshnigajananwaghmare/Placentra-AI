import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  Lightbulb,
  Loader2,
  LogOut,
  Target,
  UserRound,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

const API_URL = "http://127.0.0.1:5000";

interface Profile {
  full_name?: string | null;
  email?: string | null;
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  year?: string | number | null;
  target_role?: string | null;
  phone?: string | null;
  cgpa?: string | number | null;
}

interface Summary {
  projects: number;
  skills: number;
  internships: number;
  certifications: number;
  profile_completion: number;
}

interface Placement {
  score: number;
  details?: {
    aptitude_score?: number;
    communication_score?: number;
  };
  improvements: string[];
}

interface Career {
  career?: string;
  confidence?: number;
  reason?: string[];
  recommended_skills?: string[];
}

interface SkillGap {
  career?: string;
  skill_match?: number;
  matched_skills?: string[];
  missing_skills?: string[];
}

interface DashboardData {
  profile: Profile;
  summary: Summary;
  placement: Placement | null;
  career: Career | null;
  skillGap: SkillGap | null;
  atsScore: number | null;
}

const EMPTY_SUMMARY: Summary = {
  projects: 0,
  skills: 0,
  internships: 0,
  certifications: 0,
  profile_completion: 0,
};

function parseUser(): { id?: number; full_name?: string; fullName?: string; email?: string } {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") as {
      id?: number;
      full_name?: string;
      fullName?: string;
      email?: string;
    };
  } catch {
    return {};
  }
}

function formatValue(value: string | number | null | undefined): string {
  return value !== null && value !== undefined && String(value).trim()
    ? String(value)
    : "Not available";
}

function statusForScore(score: number, labels: [string, string, string]) {
  if (score >= 80) return labels[0];
  if (score >= 60) return labels[1];
  return labels[2];
}

function Stat({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: "brand" | "success" | "warning" | "neutral";
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
    success: "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    neutral: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
  };

  return (
    <Card>
      <CardContent>
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          {icon}
        </div>
        <p className="text-sm text-ink-500 dark:text-ink-400">{label}</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-ink-900 dark:text-ink-50">{value}</p>
        <p className="mt-1 text-xs font-medium text-ink-400 dark:text-ink-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

function SectionLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
      {children}
    </Link>
  );
}

function Checklist({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300">
      {complete ? (
        <CheckCircle2 className="h-4 w-4 text-accent-500" />
      ) : (
        <span className="h-4 w-4 rounded-full border-2 border-ink-300 dark:border-ink-600" />
      )}
      {label}
    </div>
  );
}

export default function Dashboard() {
  const user = useMemo(parseUser, []);
  const [data, setData] = useState<DashboardData>({
    profile: {},
    summary: EMPTY_SUMMARY,
    placement: null,
    career: null,
    skillGap: null,
    atsScore: null,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!user.id) {
      setErrors(["Your user session could not be found. Please log in again."]);
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      const nextErrors: string[] = [];
      const result = { ...data, summary: EMPTY_SUMMARY };

      const load = async <T,>(
        path: string,
        read: (payload: T) => void,
        errorMessage: string,
      ) => {
        try {
          const response = await fetch(`${API_URL}${path}`);
          const payload = (await response.json()) as T & { success?: boolean; message?: string };
          if (!response.ok || payload.success === false) {
            throw new Error(payload.message || errorMessage);
          }
          read(payload);
        } catch {
          nextErrors.push(errorMessage);
        }
      };

      await Promise.all([
        load<{ success: boolean; profile: Profile }>("/profile/" + user.id, (payload) => {
          result.profile = payload.profile || {};
        }, "Profile information unavailable."),
        load<{ success: boolean; summary: Summary }>("/dashboard/" + user.id, (payload) => {
          result.summary = payload.summary || EMPTY_SUMMARY;
        }, "Profile summary unavailable."),
        load<{ success: boolean; score: number; details?: Placement["details"]; improvements?: string[] }>(
          "/placement-score/" + user.id,
          (payload) => {
            result.placement = {
              score: Number(payload.score),
              details: payload.details,
              improvements: payload.improvements || [],
            };
          },
          "Placement prediction unavailable.",
        ),
        load<{ success: boolean; recommendation: Career }>("/career/" + user.id, (payload) => {
          result.career = payload.recommendation || null;
        }, "Career recommendation unavailable."),
        load<{ success: boolean; data: SkillGap }>("/skill-gap/" + user.id, (payload) => {
          result.skillGap = payload.data || null;
        }, "Skill gap analysis unavailable."),
        load<{ success: boolean; score: number }>("/ats-score/" + user.id, (payload) => {
          result.atsScore = Number(payload.score);
        }, "ATS score unavailable."),
      ]);

      setData(result);
      setErrors(nextErrors);
      setLoading(false);
    };

    void loadDashboard();
  }, [retryToken, user.id]);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const firstName = (data.profile.full_name || user.full_name || user.fullName || "").trim().split(/\s+/)[0];
  const placementStatus = data.placement
    ? statusForScore(data.placement.score, ["High", "Moderate", "Low"])
    : "Not available";
  const skillStatus = data.skillGap
    ? statusForScore(data.skillGap.skill_match || 0, ["Strong match", "Good foundation", "Needs improvement"])
    : "Not available";
  const atsStatus = data.atsScore === null
    ? "Not available"
    : statusForScore(data.atsScore, ["Strong", "Good", "Needs improvement"]);
  const missingSkills = data.skillGap?.missing_skills || [];
  const actions = [
    ...(missingSkills.length ? [`Improve ${missingSkills.slice(0, 2).join(" and ")} skills`] : []),
    ...(data.summary.projects === 0 ? ["Add a practical project to your profile"] : []),
    ...(data.summary.internships === 0 ? ["Add relevant internship experience"] : []),
    ...(data.summary.certifications === 0 ? ["Complete a relevant certification"] : []),
    ...(data.atsScore !== null && data.atsScore < 70 ? ["Improve your resume keywords and descriptions"] : []),
    ...(data.summary.profile_completion < 80 ? ["Complete your profile information"] : []),
  ].slice(0, 5);
  const nextAction = actions[0] || "Continue tailoring your preparation to your target role";

  return (
    <div className="min-h-screen bg-ink-50 px-5 py-8 dark:bg-ink-950 sm:px-8">
      <main className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-semibold text-brand-600">Placentra AI overview</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 sm:text-4xl">
              Welcome back{firstName ? `, ${firstName}` : ""} 👋
            </h1>
            <p className="mt-2 text-ink-500 dark:text-ink-400">Your personalized placement readiness overview.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => { window.location.href = "/profile"; }} leftIcon={<UserRound className="h-4 w-4" />}>
              View Profile
            </Button>
            <Button variant="ghost" onClick={logout} leftIcon={<LogOut className="h-4 w-4" />}>
              Logout
            </Button>
          </div>
        </header>

        {errors.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p>{errors.join(" ")}</p>
                <button className="mt-2 font-semibold underline" onClick={() => setRetryToken((token) => token + 1)}>Retry</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center gap-3 text-ink-500"><Loader2 className="h-5 w-5 animate-spin" />Loading your placement dashboard...</div>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div><h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Placement Readiness</h2><p className="mt-1 text-sm text-ink-500">Live signals from your Placentra AI profile.</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Placement Probability" value={data.placement ? `${data.placement.score}%` : "Not available"} detail={placementStatus} icon={<Target className="h-5 w-5" />} tone="brand" />
                <Stat label="Skill Match" value={data.skillGap ? `${data.skillGap.skill_match ?? 0}%` : "Not available"} detail={skillStatus} icon={<Code2 className="h-5 w-5" />} tone="success" />
                <Stat label="ATS Score" value={data.atsScore !== null ? String(data.atsScore) : "Not available"} detail={atsStatus} icon={<FileText className="h-5 w-5" />} tone="warning" />
                <Stat label="Profile Completion" value={`${data.summary.profile_completion}%`} detail={data.summary.profile_completion >= 80 ? "Complete" : "Needs attention"} icon={<UserRound className="h-5 w-5" />} tone="neutral" />
              </div>
            </section>

            <Card className="mb-8 border-brand-200 bg-brand-50/60 dark:border-brand-900/50 dark:bg-brand-950/20">
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-600">Your Next Best Action</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-ink-900 dark:text-ink-50">{nextAction}</h2>
                  <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">Turn your latest Placentra AI analysis into a focused next step.</p>
                </div>
                <Link to="/improvement-plan"><Button leftIcon={<Target className="h-4 w-4" />}>View Improvement Plan</Button></Link>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
              <div className="space-y-6">
                <Card>
                  <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Placement Prediction</CardTitle><SectionLink to="/placement-predictor">View Prediction</SectionLink></div><CardDescription>Prediction returned by the existing placement model.</CardDescription></CardHeader>
                  <CardContent>
                    {data.placement ? <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-display text-6xl font-extrabold text-ink-900 dark:text-ink-50">{data.placement.score}%</p><p className="mt-2 text-sm text-ink-500">Placement probability</p></div><Badge tone={data.placement.score >= 80 ? "success" : data.placement.score >= 60 ? "warning" : "neutral"}>{placementStatus}</Badge></div> : <EmptyState text="Run the Placement Predictor to generate your model-backed probability." to="/placement-predictor" label="Open Predictor" />}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Recommended Career</CardTitle><SectionLink to="/career-recommendation">Find My Career</SectionLink></div><CardDescription>Recommendation based on your target role, skills, academics, aptitude, and communication.</CardDescription></CardHeader>
                  <CardContent>
                    {data.career ? <><div className="flex items-end justify-between gap-4"><div><p className="font-display text-3xl font-extrabold text-ink-900 dark:text-ink-50">{data.career.career || "Not available"}</p><p className="mt-2 text-sm text-ink-500">Confidence: {data.career.confidence ?? "Not available"}%</p></div><Lightbulb className="h-9 w-9 text-amber-500" /></div><div className="mt-5 space-y-2">{(data.career.reason || []).slice(0, 3).map((reason) => <p key={reason} className="flex gap-2 text-sm text-ink-600 dark:text-ink-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />{reason}</p>)}</div></> : <EmptyState text="Career recommendation unavailable." to="/career-recommendation" label="Retry in Career Workspace" />}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Your Skill Gap</CardTitle><SectionLink to="/skill-gap-analysis">Analyze Skill Gap</SectionLink></div><CardDescription>Relevant required skills from your selected career.</CardDescription></CardHeader>
                  <CardContent>
                    {data.skillGap ? <><div className="mb-5 flex items-center justify-between"><div><p className="text-sm text-ink-500">Target role</p><p className="mt-1 text-lg font-bold text-ink-900 dark:text-ink-50">{data.skillGap.career || "Not available"}</p></div><p className="font-display text-3xl font-extrabold text-brand-600">{data.skillGap.skill_match ?? 0}%</p></div><div className="flex flex-wrap gap-2">{(data.skillGap.matched_skills || []).map((skill) => <Badge key={skill} tone="success"><CheckCircle2 className="h-3 w-3" />{skill}</Badge>)}{missingSkills.slice(0, 5).map((skill) => <Badge key={skill} tone="warning">{skill}</Badge>)}</div></> : <EmptyState text="Skill gap analysis unavailable." to="/skill-gap-analysis" label="Open Skill Gap" />}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader><div className="flex items-center justify-between"><CardTitle>Profile Strength</CardTitle><SectionLink to="/profile">Complete Profile</SectionLink></div><CardDescription>Completion calculated from your saved profile data.</CardDescription></CardHeader>
                  <CardContent><div className="flex items-end justify-between"><p className="font-display text-4xl font-extrabold text-ink-900 dark:text-ink-50">{data.summary.profile_completion}%</p><GraduationCap className="h-8 w-8 text-brand-600" /></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800"><div className="h-full rounded-full bg-brand-600" style={{ width: `${data.summary.profile_completion}%` }} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Checklist label="Basic information" complete={Boolean(data.profile.full_name && data.profile.email)} /><Checklist label="Education" complete={Boolean(data.profile.degree && data.profile.branch && data.profile.year)} /><Checklist label="Skills" complete={data.summary.skills > 0} /><Checklist label="Projects" complete={data.summary.projects > 0} /><Checklist label="Internship" complete={data.summary.internships > 0} /><Checklist label="Certifications" complete={data.summary.certifications > 0} /></div></CardContent>
                </Card>

                <Card>
                  <CardHeader><div className="flex items-center justify-between"><CardTitle>Resume Readiness</CardTitle><SectionLink to="/resume">View Resume</SectionLink></div><CardDescription>ATS score from the existing resume calculation.</CardDescription></CardHeader>
                  <CardContent>{data.atsScore !== null ? <div className="flex items-center justify-between"><div><p className="font-display text-5xl font-extrabold text-ink-900 dark:text-ink-50">{data.atsScore}</p><p className="mt-1 text-sm text-ink-500">{atsStatus}</p></div><FileText className="h-10 w-10 text-brand-600" /></div> : <EmptyState text="Create or review your resume to see ATS readiness." to="/resume" label="Edit Resume" />}</CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>What You Should Do Next</CardTitle><CardDescription>Prioritized from your actual missing or incomplete areas.</CardDescription></CardHeader>
                  <CardContent>{actions.length ? <ol className="space-y-3">{actions.map((action, index) => <li key={action} className="flex items-start gap-3 text-sm text-ink-700 dark:text-ink-300"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{index + 1}</span>{action}</li>)}</ol> : <p className="text-sm text-ink-500">Your profile is well covered. Continue preparing for interviews.</p>}</CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-2"><Action to="/placement-predictor" icon={<Target className="h-4 w-4" />} label="Predict Placement" /><Action to="/career-recommendation" icon={<Lightbulb className="h-4 w-4" />} label="Find My Career" /><Action to="/skill-gap-analysis" icon={<Code2 className="h-4 w-4" />} label="Analyze Skill Gap" /><Action to="/resume" icon={<FileText className="h-4 w-4" />} label="Build Resume" /><Action to="/profile" icon={<UserRound className="h-4 w-4" />} label="Improve Profile" /><Action to="/projects" icon={<Briefcase className="h-4 w-4" />} label="View Projects" /></CardContent>
                </Card>
              </div>
            </div>

            <Card className="mt-6">
              <CardHeader><CardTitle>Your Placement Roadmap</CardTitle><CardDescription>Progress through the placement journey using your actual profile signals.</CardDescription></CardHeader>
              <CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
                ["Profile", data.summary.profile_completion >= 80],
                ["Skills", data.summary.skills > 0],
                ["Projects", data.summary.projects > 0],
                ["Resume", data.atsScore !== null],
                ["Placement Ready", Boolean(data.placement && data.placement.score >= 80)],
              ].map(([label, complete]) => <div key={String(label)} className="flex items-center gap-2 rounded-xl bg-ink-50 p-3 text-sm dark:bg-ink-800/50"><CheckCircle2 className={`h-4 w-4 ${complete ? "text-accent-500" : "text-ink-300 dark:text-ink-600"}`} /><span className={complete ? "font-semibold text-ink-800 dark:text-ink-100" : "text-ink-500"}>{String(label)}</span></div>)}</div></CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader><CardTitle>Profile Snapshot</CardTitle><CardDescription>Recent information used across your placement tools.</CardDescription></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Snapshot label="Education" value={`${formatValue(data.profile.degree)} / ${formatValue(data.profile.branch)}`} icon={<GraduationCap className="h-4 w-4" />} /><Snapshot label="Target Role" value={formatValue(data.profile.target_role)} icon={<Target className="h-4 w-4" />} /><Snapshot label="Projects / Skills" value={`${data.summary.projects} / ${data.summary.skills}`} icon={<BarChart3 className="h-4 w-4" />} /><Snapshot label="Internships / Certifications" value={`${data.summary.internships} / ${data.summary.certifications}`} icon={<Award className="h-4 w-4" />} /></CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ text, to, label }: { text: string; to: string; label: string }) {
  return <div className="rounded-xl border border-dashed border-ink-200 p-5 dark:border-ink-700"><p className="text-sm text-ink-500">{text}</p><Link to={to} className="mt-3 inline-block text-sm font-semibold text-brand-600">{label} →</Link></div>;
}

function Action({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return <Link to={to} className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-300 hover:bg-brand-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-brand-500/10">{icon}{label}</Link>;
}

function Snapshot({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-3 dark:border-ink-800 dark:bg-ink-800/40"><div className="flex items-center gap-2 text-ink-400"><span>{icon}</span><span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div><p className="mt-2 text-sm font-semibold text-ink-800 dark:text-ink-100">{value}</p></div>;
}
