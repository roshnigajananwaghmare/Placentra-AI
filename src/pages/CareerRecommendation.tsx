import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  Lightbulb,
  Loader2,
  MessageSquare,
  Target,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { OnboardingProgress, ContinueStep, PreviousStep, markOnboardingStep } from "../components/OnboardingProgress";

const API_URL = "http://127.0.0.1:5000";

interface Profile {
  degree?: string | null;
  branch?: string | null;
  year?: string | number | null;
  cgpa?: string | number | null;
  aptitude_score?: string | number | null;
  communication_score?: string | number | null;
  target_role?: string | null;
}

interface Project {
  project_name?: string | null;
}

interface Internship {
  role?: string | null;
  company_name?: string | null;
}

interface Certification {
  certificate_name?: string | null;
}

interface Skill {
  skill_name?: string | null;
  skill_type?: string | null;
}

interface Recommendation {
  career?: string;
  confidence?: number;
  reason?: string[];
  matched_skills?: string[];
  missing_skills?: string[];
  recommended_skills?: string[];
}

interface SkillGap {
  career?: string;
  required_skills?: string[];
  matched_skills?: string[];
  missing_skills?: string[];
  skill_match?: number;
}

interface User {
  id?: number;
}

function valueOrFallback(value: string | number | null | undefined): string {
  return value !== null && value !== undefined && String(value).trim()
    ? String(value)
    : "Not provided";
}

function MatchBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-600 dark:text-ink-300">{label}</span>
        <span className="font-bold text-ink-900 dark:text-ink-100">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-700"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function SkillPill({ label, matched }: { label: string; matched: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
        matched
          ? "bg-accent-50 text-accent-700 ring-1 ring-accent-200 dark:bg-accent-500/10 dark:text-accent-300 dark:ring-accent-500/30"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30"
      }`}
    >
      {matched ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export default function CareerRecommendation() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const user = useMemo<User>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}") as User;
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    if (!user.id) {
      setError("Your user session could not be found. Please log in again.");
      setLoadingProfile(false);
      return;
    }

    const loadProfileData = async () => {
      try {
        const responses = await Promise.all([
          fetch(`${API_URL}/profile/${user.id}`),
          fetch(`${API_URL}/skills/${user.id}`),
          fetch(`${API_URL}/projects/${user.id}`),
          fetch(`${API_URL}/internships/${user.id}`),
          fetch(`${API_URL}/certifications/${user.id}`),
        ]);
        const payloads = await Promise.all(responses.map((response) => response.json()));

        if (!responses.every((response) => response.ok)) {
          throw new Error("Unable to load your profile information.");
        }

        const [profileData, skillsData, projectsData, internshipsData, certificationsData] = payloads;
        if (!profileData.success) throw new Error(profileData.message || "Unable to load your profile.");
        if (!skillsData.success) throw new Error(skillsData.message || "Unable to load your skills.");
        if (!projectsData.success) throw new Error(projectsData.message || "Unable to load your projects.");
        if (!internshipsData.success) throw new Error(internshipsData.message || "Unable to load your internships.");
        if (!certificationsData.success) throw new Error(certificationsData.message || "Unable to load your certifications.");

        setProfile(profileData.profile || {});
        setSkills(Array.isArray(skillsData.skills) ? skillsData.skills : []);
        setProjects(Array.isArray(projectsData.projects) ? projectsData.projects : []);
        setInternships(Array.isArray(internshipsData.internships) ? internshipsData.internships : []);
        setCertifications(
          Array.isArray(certificationsData.certifications)
            ? certificationsData.certifications
            : [],
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your profile information.",
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfileData();
  }, [user.id]);

  const analyzeCareer = async () => {
    if (!user.id) {
      setError("Your user session could not be found. Please log in again.");
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      const [careerResponse, skillGapResponse] = await Promise.all([
        fetch(`${API_URL}/career/${user.id}`),
        fetch(`${API_URL}/skill-gap/${user.id}`),
      ]);
      const careerData = await careerResponse.json();
      const skillGapData = await skillGapResponse.json();

      if (!careerResponse.ok || !careerData.success) {
        throw new Error(careerData.message || "Unable to generate a career recommendation.");
      }
      if (!skillGapResponse.ok || !skillGapData.success) {
        throw new Error(skillGapData.message || "Unable to load the skill gap analysis.");
      }

      setRecommendation(careerData.recommendation || {});
      setSkillGap(skillGapData.data || {});
      markOnboardingStep("Career");
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "We couldn't analyze your profile right now. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const matchedSkills = skillGap?.matched_skills || recommendation?.matched_skills || [];
  const missingSkills = skillGap?.missing_skills || recommendation?.missing_skills || [];
  const requiredSkills = skillGap?.required_skills || [];
  const technicalSkills = skills.filter(
    (skill) => skill.skill_type?.toLowerCase() !== "soft skill",
  );
  const confidence = Number(recommendation?.confidence);

  return (
    <div className="min-h-screen bg-ink-50 px-5 py-8 dark:bg-ink-950 sm:px-8">
      <main className="mx-auto max-w-7xl">
        <OnboardingProgress current="Career" />
        <PreviousStep to="/placement-predictor" />
        <header className="mb-8 flex flex-col gap-6 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Lightbulb className="h-4 w-4" />
              AI career guidance
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 sm:text-4xl">
              AI Career Recommendation
            </h1>
            <p className="mt-3 max-w-2xl text-ink-500 dark:text-ink-400">
              Discover career paths that match your skills, education, projects
              and career interests.
            </p>
          </div>
          <Button
            size="lg"
            onClick={analyzeCareer}
            loading={analyzing}
            disabled={loadingProfile || !profile}
            leftIcon={!analyzing ? <Lightbulb className="h-5 w-5" /> : undefined}
          >
            {analyzing ? "Analyzing your profile..." : "Analyze My Career"}
          </Button>
        </header>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loadingProfile ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center gap-3 text-ink-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your profile data...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="h-1.5 bg-brand-600" />
                <CardHeader>
                  <CardTitle>Your Recommended Career</CardTitle>
                  <CardDescription>
                    This recommendation is calculated by the existing career recommendation service.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendation ? (
                    <>
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <Badge tone="brand">Primary recommendation</Badge>
                          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-900 dark:text-ink-50">
                            {recommendation.career || "Not provided"}
                          </h2>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                            Confidence
                          </p>
                          <p className="mt-1 text-4xl font-extrabold tabular-nums text-brand-600">
                            {Number.isFinite(confidence) ? `${confidence}%` : "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-7 space-y-4">
                        {(recommendation.reason || []).map((reason) => (
                          <div key={reason} className="flex items-start gap-3 text-sm text-ink-600 dark:text-ink-300">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <Lightbulb className="mx-auto h-12 w-12 text-ink-300 dark:text-ink-600" />
                      <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">
                        Analyze your profile to see the backend recommendation.
                      </p>
                    </div>
                  )}
                </CardContent>
                {recommendation && <ContinueStep to="/skill-gap-analysis" label="Continue to Skill Gap Analysis" showPrevious={false} />}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Why this career matches you</CardTitle>
                  <CardDescription>
                    Actual profile signals considered by the recommendation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <Fact icon={<GraduationCap className="h-4 w-4" />} label="Academic background" value={valueOrFallback([profile?.degree, profile?.branch].filter(Boolean).join(" / "))} />
                  <Fact icon={<Target className="h-4 w-4" />} label="Career interest" value={valueOrFallback(profile?.target_role)} />
                  <Fact icon={<Code2 className="h-4 w-4" />} label="Technical skills" value={technicalSkills.length ? technicalSkills.map((skill) => skill.skill_name).filter(Boolean).join(", ") : "Not provided"} />
                  <Fact icon={<FileText className="h-4 w-4" />} label="Projects" value={projects.length ? `${projects.length} project${projects.length === 1 ? "" : "s"}` : "Not provided"} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Match</CardTitle>
                  <CardDescription>
                    Actual profile information, not invented feature scores.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <MatchBar label="Skills" value={skillGap?.skill_match ?? 0} />
                  <Fact icon={<GraduationCap className="h-4 w-4" />} label="CGPA" value={valueOrFallback(profile?.cgpa)} />
                  <Fact icon={<Target className="h-4 w-4" />} label="Aptitude score" value={valueOrFallback(profile?.aptitude_score)} />
                  <Fact icon={<MessageSquare className="h-4 w-4" />} label="Communication score" value={valueOrFallback(profile?.communication_score)} />
                  <div className="grid gap-3 pt-2 sm:grid-cols-3">
                    <Fact icon={<FileText className="h-4 w-4" />} label="Projects" value={String(projects.length)} />
                    <Fact icon={<Briefcase className="h-4 w-4" />} label="Internships" value={String(internships.length)} />
                    <Fact icon={<Award className="h-4 w-4" />} label="Certifications" value={String(certifications.length)} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Skills commonly required for {recommendation?.career || "your target role"}
                  </CardTitle>
                  <CardDescription>
                    Required skills returned by the existing career skill map.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {requiredSkills.length ? (
                    <div className="flex flex-wrap gap-2">
                      {requiredSkills.map((skill) => (
                        <SkillPill key={skill} label={skill} matched={matchedSkills.includes(skill)} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-500 dark:text-ink-400">
                      Analyze your career profile to load required skills.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Current Skill Match</CardTitle>
                  <CardDescription>
                    Matched skills are based on exact skills in your profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-500">Matched</span>
                    <span className="font-bold text-accent-600">{matchedSkills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.length ? matchedSkills.map((skill) => <SkillPill key={skill} label={skill} matched />) : <span className="text-sm text-ink-500">No matched skills yet.</span>}
                  </div>
                  <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-ink-500">Missing / recommended</span>
                      <span className="font-bold text-amber-600">{missingSkills.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.length ? missingSkills.map((skill) => <SkillPill key={skill} label={skill} matched={false} />) : <span className="text-sm text-ink-500">No missing skills returned.</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Skill Gap</CardTitle>
                  <CardDescription>Prioritized areas returned by the existing skill-gap analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  {missingSkills.length ? (
                    <ul className="space-y-3">
                      {missingSkills.slice(0, 5).map((skill, index) => (
                        <li key={skill} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2.5 dark:bg-ink-800/50">
                          <span className="font-medium text-ink-700 dark:text-ink-200">{skill}</span>
                          <Badge tone={index === 0 ? "warning" : "neutral"}>
                            {index === 0 ? "High priority" : "Recommended"}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-ink-500 dark:text-ink-400">
                      No missing skills were returned for this profile.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Career Roadmap</CardTitle>
                  <CardDescription>
                    Practical next steps for the recommended career path.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Strengthen the fundamentals for your target role.",
                    missingSkills.length ? `Learn the missing skills: ${missingSkills.slice(0, 2).join(" and ")}.` : "Deepen the skills already present in your profile.",
                    "Build relevant projects that demonstrate those skills.",
                    "Gain practical experience through internships or applied work.",
                    "Prepare for role-specific interviews and assessments.",
                  ].map((step, index) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-sm text-ink-600 dark:text-ink-300">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Continue building your profile</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                  <ActionLink to="/skills" icon={<Code2 className="h-4 w-4" />} label="Update Skills" />
                  <ActionLink to="/projects" icon={<FileText className="h-4 w-4" />} label="View My Projects" />
                  <ActionLink to="/resume" icon={<FileText className="h-4 w-4" />} label="Build Resume" />
                  <ActionLink to="/placement-predictor" icon={<Target className="h-4 w-4" />} label="Placement Predictor" />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-3 dark:border-ink-800 dark:bg-ink-800/40">
      <div className="mb-1 flex items-center gap-2 text-ink-400 dark:text-ink-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{value}</p>
    </div>
  );
}

function ActionLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
