import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  FileText,
  Loader2,
  RefreshCw,
  Target,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { OnboardingProgress, ContinueStep, PreviousStep, markOnboardingStep } from "../components/OnboardingProgress";

const API_URL = "http://127.0.0.1:5000";
type TaskStatus = "Not Started" | "In Progress" | "Completed";

interface Profile {
  full_name?: string | null;
  target_role?: string | null;
  degree?: string | null;
  branch?: string | null;
  year?: string | number | null;
}
interface Summary {
  projects: number;
  skills: number;
  internships: number;
  certifications: number;
  profile_completion: number;
}
interface Skill {
  skill_name?: string | null;
}
interface Project {
  project_name?: string | null;
  technologies?: string | null;
}
interface Internship {
  role?: string | null;
  company_name?: string | null;
}
interface Certification {
  certificate_name?: string | null;
  organization?: string | null;
}
interface SkillGap {
  career?: string;
  missing_skills?: string[];
  matched_skills?: string[];
  skill_match?: number;
}
interface Placement {
  score?: number;
  improvements?: string[];
}
interface PlanData {
  profile: Profile;
  summary: Summary;
  skills: Skill[];
  projects: Project[];
  internships: Internship[];
  certifications: Certification[];
  gap: SkillGap | null;
  placement: Placement | null;
  career: { career?: string; confidence?: number } | null;
  atsScore: number | null;
}
interface Priority {
  id: string;
  title: string;
  reason: string;
  action: string;
  link: string;
  linkLabel: string;
  tone: "brand" | "warning" | "neutral";
}

const EMPTY_SUMMARY: Summary = { projects: 0, skills: 0, internships: 0, certifications: 0, profile_completion: 0 };

function getUserId(): number | undefined {
  try {
    return (JSON.parse(localStorage.getItem("user") || "{}") as { id?: number }).id;
  } catch {
    return undefined;
  }
}

function display(value: string | number | null | undefined) {
  return value !== null && value !== undefined && String(value).trim() ? String(value) : "Not available";
}

function score(value: number | null | undefined) {
  return value === null || value === undefined || Number.isNaN(value) ? "Not available" : `${value}%`;
}

function statusTone(status: TaskStatus) {
  return status === "Completed" ? "success" : status === "In Progress" ? "brand" : "neutral";
}

function StatusControl({ status, onChange }: { status: TaskStatus; onChange: (status: TaskStatus) => void }) {
  const next: TaskStatus = status === "Not Started" ? "In Progress" : status === "In Progress" ? "Completed" : "Not Started";
  return (
    <button onClick={() => onChange(next)} className="flex items-center gap-2 text-left" title="Click to update status">
      {status === "Completed" ? <CheckCircle2 className="h-5 w-5 text-accent-500" /> : <span className="h-5 w-5 rounded-full border-2 border-ink-300 dark:border-ink-600" />}
      <Badge tone={statusTone(status)}>{status}</Badge>
    </button>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <Card><CardContent><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{icon}</div><p className="text-sm text-ink-500">{label}</p><p className="mt-1 font-display text-2xl font-extrabold text-ink-900 dark:text-ink-50">{value}</p></CardContent></Card>;
}

export default function ImprovementPlan() {
  const userId = useMemo(getUserId, []);
  const [data, setData] = useState<PlanData>({ profile: {}, summary: EMPTY_SUMMARY, skills: [], projects: [], internships: [], certifications: [], gap: null, placement: null, career: null, atsScore: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({});

  const loadPlan = useCallback(async (refresh = false) => {
    if (!userId) {
      setError("Your user session could not be found. Please log in again.");
      setLoading(false);
      return;
    }
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const paths = [
        `/profile/${userId}`, `/dashboard/${userId}`, `/skills/${userId}`, `/projects/${userId}`,
        `/internships/${userId}`, `/certifications/${userId}`, `/skill-gap/${userId}`,
        `/placement-score/${userId}`, `/career/${userId}`, `/ats-score/${userId}`,
      ];
      const fetchPayload = async (path: string): Promise<Record<string, unknown> | null> => {
        try {
          const response = await fetch(`${API_URL}${path}`);
          const payload = (await response.json()) as Record<string, unknown>;
          if (!response.ok || payload.success === false) return null;
          return payload;
        } catch {
          return null;
        }
      };
      const payloads = await Promise.all(paths.map(fetchPayload));
      if (payloads.some((payload) => payload === null)) {
        setError("Some placement information is unavailable. Available sections are still shown.");
      }
      const profilePayload = payloads[0] || {};
      const summaryPayload = payloads[1] || {};
      const skillsPayload = payloads[2] || {};
      const projectsPayload = payloads[3] || {};
      const internshipsPayload = payloads[4] || {};
      const certificationsPayload = payloads[5] || {};
      const gapPayload = payloads[6] || {};
      const placementPayload = payloads[7] || {};
      const careerPayload = payloads[8] || {};
      const atsPayload = payloads[9] || {};
      setData({
        profile: (profilePayload.profile as Profile | undefined) || {},
        summary: (summaryPayload.summary as Summary | undefined) || EMPTY_SUMMARY,
        skills: Array.isArray(skillsPayload.skills) ? skillsPayload.skills as Skill[] : [],
        projects: Array.isArray(projectsPayload.projects) ? projectsPayload.projects as Project[] : [],
        internships: Array.isArray(internshipsPayload.internships) ? internshipsPayload.internships as Internship[] : [],
        certifications: Array.isArray(certificationsPayload.certifications) ? certificationsPayload.certifications as Certification[] : [],
        gap: (gapPayload.data as SkillGap | undefined) || null,
        placement: typeof placementPayload.score === "number" ? { score: placementPayload.score, improvements: Array.isArray(placementPayload.improvements) ? placementPayload.improvements as string[] : [] } : null,
        career: (careerPayload.recommendation as { career?: string; confidence?: number } | undefined) || null,
        atsScore: typeof atsPayload.score === "number" ? atsPayload.score : null,
      });
      markOnboardingStep("Plan");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your improvement plan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadPlan();
    if (userId) {
      try {
        setTaskStatuses(JSON.parse(localStorage.getItem(`improvement-plan-status-${userId}`) || "{}") as Record<string, TaskStatus>);
      } catch {
        setTaskStatuses({});
      }
    }
  }, [loadPlan, userId]);

  const updateStatus = (id: string, status: TaskStatus) => {
    const next = { ...taskStatuses, [id]: status };
    setTaskStatuses(next);
    if (userId) localStorage.setItem(`improvement-plan-status-${userId}`, JSON.stringify(next));
  };

  const role = data.gap?.career || data.career?.career || data.profile.target_role;
  const missingSkills = data.gap?.missing_skills || [];
  const priorities: Priority[] = [];
  if (missingSkills[0]) priorities.push({ id: "skill", title: `Improve ${missingSkills[0]} skills`, reason: `${missingSkills[0]} is missing from your profile and is required by your selected career path.`, action: `Build ${missingSkills[0]} fundamentals through guided practice and add evidence to your profile.`, link: "/skills", linkLabel: "Add Skill", tone: "warning" });
  if (!data.summary.projects) priorities.push({ id: "project", title: "Add a relevant project", reason: `You currently have ${data.summary.projects} projects, so your profile has limited practical evidence for ${display(role)}.`, action: "Build and add a practical project using one or more of your missing career skills.", link: "/projects", linkLabel: "Add Project", tone: "brand" });
  if (!data.summary.internships) priorities.push({ id: "internship", title: "Build experience evidence", reason: "Your profile currently has no internship experience.", action: "Add a relevant internship, virtual internship, or practical industry experience when you have one.", link: "/internships", linkLabel: "Add Internship", tone: "neutral" });
  if (!data.summary.certifications) priorities.push({ id: "certification", title: "Add career-relevant certification evidence", reason: `No certifications are currently listed for your ${display(role)} goal.`, action: "Add a certification you have completed that supports your target role.", link: "/certifications", linkLabel: "Add Certification", tone: "neutral" });
  if (data.summary.profile_completion < 80) priorities.push({ id: "profile", title: "Complete your profile", reason: `Your profile is ${data.summary.profile_completion}% complete, so some information is unavailable to Placentra AI.`, action: "Complete the missing profile fields so recommendations can use current information.", link: "/profile", linkLabel: "Complete Profile", tone: "brand" });
  if (data.atsScore !== null && data.atsScore < 70) priorities.push({ id: "resume", title: "Improve your resume", reason: `Your current ATS score is ${data.atsScore}, indicating that your resume can be strengthened.`, action: "Improve technical keywords, project descriptions, and section completeness using your actual experience.", link: "/resume", linkLabel: "Improve Resume", tone: "warning" });
  if (data.placement?.improvements?.length) priorities.push({ id: "placement", title: "Address placement-model feedback", reason: data.placement.improvements[0], action: "Review the placement predictor and address the feedback supported by your profile data.", link: "/placement-predictor", linkLabel: "Review Prediction", tone: "neutral" });
  const visiblePriorities = priorities.slice(0, 5);
  const roadmap = missingSkills.length ? [
    { title: "Phase 1 — Priority skills", items: missingSkills.slice(0, 3) },
    { title: "Phase 2 — Demonstrate the skills", items: data.summary.projects ? ["Strengthen an existing project with a missing skill"] : ["Build and add a project using the priority skills"] },
    { title: "Phase 3 — Career evidence", items: data.summary.internships ? ["Continue documenting relevant experience"] : ["Add relevant experience when available"] },
  ] : [{ title: "Phase 1 — Maintain your foundation", items: ["Review your matched career skills"] }, { title: "Phase 2 — Strengthen evidence", items: ["Keep projects and resume tailored to your target role"] }];
  const weeklyPlan = [
    { week: "Week 1", items: missingSkills.length ? [`Start with ${missingSkills.slice(0, 2).join(" and ")}`, data.summary.profile_completion < 80 ? "Complete profile gaps" : "Review your current career goal"] : ["Review your current career skill match"] },
    { week: "Week 2", items: [data.summary.projects ? "Improve an existing project" : "Add a practical project", "Practice the priority technical skills"] },
    { week: "Week 3", items: [data.atsScore !== null && data.atsScore < 70 ? "Improve resume sections and keywords" : "Tailor your resume to your target role", data.summary.certifications ? "Review certification evidence" : "Add completed certification evidence if available"] },
    { week: "Week 4", items: ["Recheck your skill gap", "Recheck ATS score and placement prediction"] },
  ];

  if (loading) return <PageShell><div className="flex min-h-64 items-center justify-center text-ink-500"><Loader2 className="mr-3 h-5 w-5 animate-spin" />Building your improvement plan...</div></PageShell>;

  return <PageShell>
    <OnboardingProgress current="Plan" />
    <PreviousStep to="/skill-gap-analysis" />
    <header className="mb-6 flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div><p className="text-sm font-semibold text-brand-600">Career development</p><h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 sm:text-4xl">Your Personalized Improvement Plan</h1><p className="mt-3 max-w-3xl text-ink-500 dark:text-ink-400">Based on your current profile, skills, projects, resume, career goal, and placement prediction, here are the areas to focus on next.</p><p className="mt-3 text-sm font-semibold text-ink-700 dark:text-ink-200">Target role: <span className="text-brand-600">{display(role)}</span></p></div>
      <Button onClick={() => void loadPlan(true)} loading={refreshing} variant="secondary" leftIcon={!refreshing ? <RefreshCw className="h-4 w-4" /> : undefined}>Recalculate My Plan</Button>
    </header>
    {error && <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"><AlertCircle className="h-5 w-5 shrink-0" /><div><p>{error}</p><button className="mt-2 font-semibold underline" onClick={() => void loadPlan(true)}>Retry</button></div></div>}
    {!data.summary.skills && !data.summary.projects && !data.profile.target_role ? <Card className="mb-6"><CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Let's build your placement plan</CardTitle><p className="mt-2 text-sm text-ink-500">Complete your profile first so Placentra AI can generate personalized recommendations.</p></div><div className="flex flex-wrap gap-2"><Link to="/profile"><Button size="sm">Complete Profile</Button></Link><Link to="/skills"><Button size="sm" variant="secondary">Add Skills</Button></Link></div></CardContent></Card> : null}
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Placement Probability" value={score(data.placement?.score)} icon={<Target className="h-5 w-5" />} /><Metric label="Skill Match" value={score(data.gap?.skill_match)} icon={<Code2 className="h-5 w-5" />} /><Metric label="ATS Score" value={data.atsScore === null ? "Not available" : String(data.atsScore)} icon={<FileText className="h-5 w-5" />} /><Metric label="Profile Completion" value={`${data.summary.profile_completion}%`} icon={<UserRound className="h-5 w-5" />} /></div>
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>Priority Improvements</CardTitle><CardDescription>Prioritized from the missing or incomplete areas in your actual profile.</CardDescription></CardHeader><CardContent>{visiblePriorities.length ? <div className="space-y-4">{visiblePriorities.map((priority, index) => <div key={priority.id} className="rounded-xl border border-ink-200 p-4 dark:border-ink-700"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{index + 1}</span><div><h3 className="font-bold text-ink-900 dark:text-ink-50">{priority.title}</h3><p className="mt-2 text-sm text-ink-500">{priority.reason}</p><p className="mt-2 text-sm text-ink-700 dark:text-ink-300"><strong>Action:</strong> {priority.action}</p></div></div><Link to={priority.link} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">{priority.linkLabel}<ArrowRight className="h-4 w-4" /></Link></div><div className="mt-3"><StatusControl status={taskStatuses[priority.id] || "Not Started"} onChange={(status) => updateStatus(priority.id, status)} /></div></div>)}</div> : <p className="text-sm text-ink-500">No additional priority was identified from the available profile data. Continue tailoring your preparation to your target role.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Skills To Improve</CardTitle><CardDescription>Only skills returned by the existing Skill Gap Analysis are shown.</CardDescription></CardHeader><CardContent>{missingSkills.length ? <div className="grid gap-3 sm:grid-cols-2">{missingSkills.map((skill, index) => <div key={skill} className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"><div className="flex items-start justify-between gap-2"><p className="font-bold text-ink-900 dark:text-ink-50">{skill}</p><Badge tone={index < 2 ? "warning" : "neutral"}>{index < 2 ? "High" : "Medium"}</Badge></div><p className="mt-2 text-sm text-ink-600 dark:text-ink-300">Current status: Missing</p><p className="mt-2 text-sm text-ink-500">Recommended action: learn the fundamentals, practice with a role-relevant task, and add evidence through a project.</p></div>)}</div> : <p className="text-sm text-ink-500">No missing skills were returned for your current career analysis.</p>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Suggested Learning Roadmap</CardTitle><CardDescription>Roadmap stages are based on your recommended career and current missing skills.</CardDescription></CardHeader><CardContent><div className="space-y-4">{roadmap.map((phase, index) => <div key={phase.title} className="flex gap-4"><div className="flex flex-col items-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{index + 1}</span>{index < roadmap.length - 1 && <span className="mt-2 h-full w-px bg-brand-200 dark:bg-brand-800" />}</div><div className="pb-4"><h3 className="font-bold text-ink-900 dark:text-ink-50">{phase.title}</h3>{phase.items.map((item) => <p key={item} className="mt-2 flex gap-2 text-sm text-ink-600 dark:text-ink-300"><BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{item}</p>)}</div></div>)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>4-Week Placement Plan</CardTitle><CardDescription>This is guidance, not a guarantee of placement.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{weeklyPlan.map((week) => <div key={week.week} className="rounded-xl bg-ink-50 p-4 dark:bg-ink-800/50"><h3 className="font-bold text-ink-900 dark:text-ink-50">{week.week}</h3>{week.items.map((item) => <p key={item} className="mt-2 text-sm text-ink-600 dark:text-ink-300">• {item}</p>)}</div>)}</CardContent></Card>
      </div>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>Project Development</CardTitle><CardDescription>Strengthen your portfolio without duplicating the projects you already list.</CardDescription></CardHeader><CardContent><p className="text-sm text-ink-600 dark:text-ink-300">{data.summary.projects ? `You currently have ${data.summary.projects} project${data.summary.projects === 1 ? "" : "s"}. ${missingSkills.length ? `Consider improving an existing project or adding one that demonstrates ${missingSkills.slice(0, 2).join(" and ")}.` : "Keep adding role-relevant evidence to your portfolio."}` : `You currently have no projects. Add a practical project that demonstrates ${missingSkills.length ? missingSkills.slice(0, 2).join(" and ") : display(role)} skills.`}</p><Link to="/projects" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">Add Project <ArrowRight className="h-4 w-4" /></Link></CardContent></Card>
        <Card><CardHeader><CardTitle>Experience Improvement</CardTitle><CardDescription>Based only on your saved internship records.</CardDescription></CardHeader><CardContent>{data.internships.length ? <><p className="flex gap-2 text-sm font-semibold text-accent-600"><CheckCircle2 className="h-5 w-5" />Internship experience added</p><div className="mt-4 space-y-2">{data.internships.map((item, index) => <p key={`${item.role}-${index}`} className="text-sm text-ink-600 dark:text-ink-300">{display(item.role)}{item.company_name ? ` — ${item.company_name}` : ""}</p>)}</div></> : <><p className="text-sm text-ink-600 dark:text-ink-300">Your profile currently has no internship experience.</p><Link to="/internships" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">Add relevant experience <ArrowRight className="h-4 w-4" /></Link></>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Certification Progress</CardTitle><CardDescription>Only certifications in your profile are listed.</CardDescription></CardHeader><CardContent>{data.certifications.length ? <div className="space-y-3">{data.certifications.map((item, index) => <p key={`${item.certificate_name}-${index}`} className="flex gap-2 text-sm text-ink-600 dark:text-ink-300"><Award className="h-4 w-4 shrink-0 text-brand-500" />{display(item.certificate_name)}{item.organization ? ` — ${item.organization}` : ""}</p>)}</div> : <><p className="text-sm text-ink-600 dark:text-ink-300">No certifications are currently listed. Add certifications relevant to your target career when completed.</p><Link to="/certifications" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">Add Certification <ArrowRight className="h-4 w-4" /></Link></>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Resume Improvement</CardTitle><CardDescription>Uses the existing ATS score calculation.</CardDescription></CardHeader><CardContent>{data.atsScore === null ? <p className="text-sm text-ink-500">ATS score not available.</p> : data.atsScore >= 70 ? <p className="text-sm text-ink-600 dark:text-ink-300">Your resume is in good shape. Continue tailoring it for each target job.</p> : <div className="space-y-2 text-sm text-ink-600 dark:text-ink-300"><p>Current ATS score: <strong>{data.atsScore}</strong></p><p>Improve technical keywords, project descriptions, and section completeness using your actual experience.</p></div>}<Link to="/resume" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">Edit Resume <ArrowRight className="h-4 w-4" /></Link></CardContent></Card>
        <Card><CardHeader><CardTitle>Profile Completion</CardTitle><CardDescription>Complete the information used by your placement tools.</CardDescription></CardHeader><CardContent><div className="mb-4 flex items-center justify-between"><span className="font-display text-3xl font-extrabold text-ink-900 dark:text-ink-50">{data.summary.profile_completion}%</span><Link to="/profile" className="text-sm font-semibold text-brand-600">Complete Profile</Link></div><div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800"><div className="h-full rounded-full bg-brand-600" style={{ width: `${data.summary.profile_completion}%` }} /></div><div className="mt-4 grid gap-2 text-sm"><ProfileCheck label="Education" complete={Boolean(data.profile.degree && data.profile.branch && data.profile.year)} /><ProfileCheck label="Target Role" complete={Boolean(data.profile.target_role)} /><ProfileCheck label="Skills" complete={data.summary.skills > 0} /><ProfileCheck label="Projects" complete={data.summary.projects > 0} /><ProfileCheck label="Internship" complete={data.summary.internships > 0} /><ProfileCheck label="Certifications" complete={data.summary.certifications > 0} /></div></CardContent></Card>
      </div>
    </div>
    <ContinueStep to="/dashboard" label="Continue to Student Dashboard" showPrevious={false} />
  </PageShell>;
}

function ProfileCheck({ label, complete }: { label: string; complete: boolean }) {
  return <p className="flex items-center gap-2 text-ink-600 dark:text-ink-300">{complete ? <CheckCircle2 className="h-4 w-4 text-accent-500" /> : <span className="h-4 w-4 rounded-full border-2 border-ink-300 dark:border-ink-600" />}{label}</p>;
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink-50 px-5 py-8 dark:bg-ink-950 sm:px-8"><main className="mx-auto max-w-7xl">{children}</main></div>;
}
