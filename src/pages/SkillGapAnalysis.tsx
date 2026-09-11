import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  Lightbulb,
  Loader2,
  Target,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { OnboardingProgress, ContinueStep, PreviousStep, markOnboardingStep } from "../components/OnboardingProgress";

const API_URL = "http://127.0.0.1:5000";

interface Skill {
  skill_name?: string | null;
  skill_type?: string | null;
  proficiency?: string | null;
}

interface Project {
  project_name?: string | null;
  technologies?: string | null;
}

interface Profile {
  target_role?: string | null;
  degree?: string | null;
  branch?: string | null;
}

interface SkillGap {
  career?: string;
  required_skills?: string[];
  matched_skills?: string[];
  missing_skills?: string[];
  skill_match?: number;
  your_skills?: string[];
}

interface Recommendation {
  career?: string;
}

function SkillChip({ name, matched }: { name: string; matched: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
      matched
        ? "bg-accent-50 text-accent-700 ring-1 ring-accent-200 dark:bg-accent-500/10 dark:text-accent-300 dark:ring-accent-500/30"
        : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30"
    }`}>
      {matched ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
      {name}
    </span>
  );
}

function ActionLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10"
    >
      <span className="flex items-center gap-2">{icon}{label}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export default function SkillGapAnalysis() {
  const [profile, setProfile] = useState<Profile>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [gap, setGap] = useState<SkillGap | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const userId = useMemo(() => {
    try {
      return (JSON.parse(localStorage.getItem("user") || "{}") as { id?: number }).id;
    } catch {
      return undefined;
    }
  }, []);

  const analyze = async () => {
    if (!userId) {
      setError("Your user session could not be found. Please log in again.");
      return;
    }
    try {
      setAnalyzing(true);
      setError("");
      const [gapResponse, careerResponse] = await Promise.all([
        fetch(`${API_URL}/skill-gap/${userId}`),
        fetch(`${API_URL}/career/${userId}`),
      ]);
      const gapData = await gapResponse.json();
      const careerData = await careerResponse.json();
      if (!gapResponse.ok || !gapData.success) {
        throw new Error(gapData.message || "Unable to analyze your skill gap.");
      }
      if (!careerResponse.ok || !careerData.success) {
        throw new Error(careerData.message || "Unable to load your target career.");
      }
      setGap(gapData.data || {});
      setRecommendation(careerData.recommendation || {});
      markOnboardingStep("Skill Gap");
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "We couldn't analyze your skills right now.");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("Your user session could not be found. Please log in again.");
      setLoading(false);
      return;
    }
    const loadProfile = async () => {
      try {
        const [profileResponse, skillsResponse, projectsResponse] = await Promise.all([
          fetch(`${API_URL}/profile/${userId}`),
          fetch(`${API_URL}/skills/${userId}`),
          fetch(`${API_URL}/projects/${userId}`),
        ]);
        const [profileData, skillsData, projectsData] = await Promise.all(
          [profileResponse, skillsResponse, projectsResponse].map((response) => response.json()),
        );
        if (!profileResponse.ok || !profileData.success) throw new Error(profileData.message || "Unable to load your profile.");
        if (!skillsResponse.ok || !skillsData.success) throw new Error(skillsData.message || "Unable to load your skills.");
        if (!projectsResponse.ok || !projectsData.success) throw new Error(projectsData.message || "Unable to load your projects.");
        setProfile(profileData.profile || {});
        setSkills(Array.isArray(skillsData.skills) ? skillsData.skills : []);
        setProjects(Array.isArray(projectsData.projects) ? projectsData.projects : []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [userId]);

  const matched = gap?.matched_skills || [];
  const missing = gap?.missing_skills || [];
  const required = gap?.required_skills || [];
  const match = typeof gap?.skill_match === "number" ? gap.skill_match : 0;
  const career = recommendation?.career || gap?.career || profile.target_role || "Not provided";
  const technicalSkills = skills.filter((skill) => skill.skill_type?.toLowerCase() !== "soft skill");

  return (
    <div className="min-h-screen bg-ink-50 px-5 py-8 dark:bg-ink-950 sm:px-8">
      <main className="mx-auto max-w-7xl">
        <OnboardingProgress current="Skill Gap" />
        <PreviousStep to="/career-recommendation" />
        <header className="mb-8 flex flex-col gap-6 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Target className="h-4 w-4" /> Career development
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 sm:text-4xl">
              Skill Gap Analysis
            </h1>
            <p className="mt-3 max-w-2xl text-ink-500 dark:text-ink-400">
              Understand which skills you already have, which skills you are missing, and what you should learn next for your target career.
            </p>
          </div>
          <Button size="lg" onClick={analyze} loading={analyzing} disabled={loading} leftIcon={!analyzing ? <Target className="h-5 w-5" /> : undefined}>
            {analyzing ? "Analyzing..." : "Analyze My Skill Gap"}
          </Button>
        </header>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" /> <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
            <Loader2 className="h-5 w-5 animate-spin text-ink-500" />
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <SummaryCard label="Matched Skills" value={gap ? matched.length : "—"} tone="success" />
              <SummaryCard label="Missing Skills" value={gap ? missing.length : "—"} tone="warning" />
              <SummaryCard label="Skill Match" value={gap ? `${match}%` : "—"} tone="brand" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Skill Breakdown</CardTitle>
                    <CardDescription>Only skills returned by the existing career skill-gap logic are treated as relevant.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SkillGroup title="Matched Skills" description="Relevant skills already present in your profile." skills={matched} matched />
                    <SkillGroup title="Missing Skills" description="Required skills not currently found in your profile." skills={missing} matched={false} />
                    {!gap && <p className="text-sm text-ink-500">Run the analysis to load your career-specific skill breakdown.</p>}
                  </CardContent>
                  {gap && <ContinueStep to="/improvement-plan" label="Continue to Improvement Plan" showPrevious={false} />}
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skill Match Visualization</CardTitle>
                    <CardDescription>Matched versus missing required skills.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <ProgressRow label="Matched" value={match} tone="bg-accent-500" />
                    <ProgressRow label="Missing" value={Math.max(0, 100 - match)} tone="bg-amber-500" />
                    <p className="text-sm text-ink-500 dark:text-ink-400">
                      Target career: <strong className="text-ink-700 dark:text-ink-200">{career}</strong>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Why these skills matter for your career</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {gap ? (
                      <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                        Your current profile matches {matched.length} of {required.length} skills required for {career}. The missing skills are the specific requirements returned for this career and are the clearest next areas to develop.
                      </p>
                    ) : (
                      <p className="text-sm text-ink-500">Analyze your skill gap to see a career-specific explanation.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Projects</CardTitle>
                    <CardDescription>Existing project technologies that may demonstrate your current skills.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {projects.length ? projects.map((project) => (
                      <div key={`${project.project_name}-${project.technologies}`} className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
                        <p className="font-semibold text-ink-800 dark:text-ink-100">{project.project_name || "Untitled project"}</p>
                        <p className="mt-1 text-sm text-ink-500">{project.technologies || "Technologies not provided"}</p>
                      </div>
                    )) : <p className="text-sm text-ink-500">No projects currently demonstrate the required skills.</p>}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="overflow-hidden">
                  <div className="h-1.5 bg-brand-600" />
                  <CardHeader>
                    <CardTitle>Target Career</CardTitle>
                    <CardDescription>Selected through your profile and existing career recommendation logic.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-3xl font-extrabold text-ink-900 dark:text-ink-50">{career}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <Fact icon={<GraduationCap className="h-4 w-4" />} label="Education" value={[profile.degree, profile.branch].filter(Boolean).join(" / ") || "Not provided"} />
                      <Fact icon={<Code2 className="h-4 w-4" />} label="Current technical skills" value={technicalSkills.length ? String(technicalSkills.length) : "Not provided"} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What should you learn first?</CardTitle>
                    <CardDescription>Missing skills ordered as returned by the existing career mapping.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {missing.length ? missing.slice(0, 5).map((skill, index) => (
                      <div key={skill} className="flex items-center gap-3 rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{index + 1}</span>
                        <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">{skill}</p>
                      </div>
                    )) : <p className="text-sm text-ink-500">No missing skills returned.</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skill Development Plan</CardTitle>
                    <CardDescription>Simple, actionable steps for {career}.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["Learn the fundamentals", "Practice the missing skills", "Build a relevant project", "Add the project to your Placentra AI profile", "Update your resume", "Practice interviews"].map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{index + 1}</span>
                        <p className="pt-1 text-sm text-ink-600 dark:text-ink-300">{step}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Improve Your Profile</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm text-ink-600 dark:text-ink-300">
                    {missing.length > 0 && <p>• Add relevant technical skills: {missing.slice(0, 2).join(", ")}.</p>}
                    {!projects.length && <p>• Build a practical project related to {career}.</p>}
                    <p>• Keep your resume updated with completed work.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Continue building your profile</CardTitle></CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <ActionLink to="/skills" label="Update My Skills" icon={<Code2 className="h-4 w-4" />} />
                    <ActionLink to="/projects" label="View My Projects" icon={<FileText className="h-4 w-4" />} />
                    <ActionLink to="/career-recommendation" label="Career Recommendation" icon={<Lightbulb className="h-4 w-4" />} />
                    <ActionLink to="/resume" label="Build My Resume" icon={<FileText className="h-4 w-4" />} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone: "success" | "warning" | "brand" }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-ink-500">{label}</p>
        <p className={`mt-2 text-4xl font-extrabold ${tone === "success" ? "text-accent-600" : tone === "warning" ? "text-amber-600" : "text-brand-600"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function SkillGroup({ title, description, skills, matched }: { title: string; description: string; skills: string[]; matched: boolean }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-semibold text-ink-800 dark:text-ink-100">
        {matched ? <CheckCircle2 className="h-5 w-5 text-accent-500" /> : <Target className="h-5 w-5 text-amber-500" />}
        {title}
      </h3>
      <p className="mt-1 text-sm text-ink-500">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.length ? skills.map((skill) => <SkillChip key={skill} name={skill} matched={matched} />) : <span className="text-sm text-ink-500">None returned.</span>}
      </div>
    </div>
  );
}

function ProgressRow({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm"><span className="font-medium text-ink-600 dark:text-ink-300">{label}</span><strong>{value}%</strong></div>
      <div className="h-3 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800"><div className={`h-full ${tone}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-3 dark:border-ink-800 dark:bg-ink-800/40"><div className="mb-1 flex items-center gap-2 text-ink-400">{icon}<span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div><p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{value}</p></div>;
}
