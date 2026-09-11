import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Circle,
  Code2,
  GraduationCap,
  Lightbulb,
  Loader2,
  MessageSquare,
  Target,
  UserRound,
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
import { OnboardingProgress, ContinueStep, PreviousStep, markOnboardingStep } from "../components/OnboardingProgress";

const API_URL = "http://127.0.0.1:5000";

interface Profile {
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  year?: string | number | null;
  cgpa?: string | number | null;
  aptitude_score?: string | number | null;
  communication_score?: string | number | null;
  target_role?: string | null;
}

interface Summary {
  projects?: number;
  skills?: number;
  internships?: number;
  certifications?: number;
  profile_completion?: number;
}

interface PredictionDetails {
  cgpa?: number;
  aptitude_score?: number;
  communication_score?: number;
  projects?: number;
  internships?: number;
  certifications?: number;
}

interface Prediction {
  score: number;
  details: PredictionDetails;
  improvements: string[];
}

interface Skill {
  skill_name?: string | null;
  skill_type?: string | null;
}

interface User {
  id?: number;
}

function displayValue(value: string | number | null | undefined): string {
  return value !== null && value !== undefined && String(value).trim()
    ? String(value)
    : "Not provided";
}

function readiness(score: number) {
  if (score >= 80) return { label: "Excellent", tone: "text-accent-600" };
  if (score >= 65) return { label: "Good", tone: "text-brand-600" };
  if (score >= 50) return { label: "Moderate", tone: "text-amber-600" };
  return { label: "Needs Improvement", tone: "text-rose-600" };
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4 dark:border-ink-800 dark:bg-ink-800/40">
      <div className="mb-2 flex items-center gap-2 text-ink-400 dark:text-ink-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-base font-bold text-ink-900 dark:text-ink-50">
        {value}
      </p>
    </div>
  );
}

function ChecklistItem({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink-700 dark:text-ink-300">
      {complete ? (
        <CheckCircle2 className="h-5 w-5 text-accent-500" />
      ) : (
        <Circle className="h-5 w-5 text-ink-300 dark:text-ink-600" />
      )}
      <span>{label}</span>
    </div>
  );
}

export default function PlacementPredictor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState<Summary>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [predicting, setPredicting] = useState(false);
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
        setError("");
        const [profileResponse, summaryResponse, skillsResponse] =
          await Promise.all([
            fetch(`${API_URL}/profile/${user.id}`),
            fetch(`${API_URL}/dashboard/${user.id}`),
            fetch(`${API_URL}/skills/${user.id}`),
          ]);

        const profileData = await profileResponse.json();
        const summaryData = await summaryResponse.json();
        const skillsData = await skillsResponse.json();

        if (!profileResponse.ok || !profileData.success) {
          throw new Error(profileData.message || "Unable to load your profile.");
        }
        if (!summaryResponse.ok || !summaryData.success) {
          throw new Error(summaryData.message || "Unable to load profile summary.");
        }
        if (!skillsResponse.ok || !skillsData.success) {
          throw new Error(skillsData.message || "Unable to load your skills.");
        }

        setProfile(profileData.profile || {});
        setSummary(summaryData.summary || {});
        setSkills(Array.isArray(skillsData.skills) ? skillsData.skills : []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load placement data.",
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfileData();
  }, [user.id]);

  const predictPlacement = async () => {
    if (!user.id) {
      setError("Your user session could not be found. Please log in again.");
      return;
    }

    try {
      setPredicting(true);
      setError("");
      const response = await fetch(`${API_URL}/placement-score/${user.id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to calculate your placement prediction.");
      }

      setPrediction({
        score: Number(data.score),
        details: data.details || {},
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
      });
      markOnboardingStep("Prediction");
    } catch (predictionError) {
      setError(
        predictionError instanceof Error
          ? predictionError.message
          : "Unable to calculate your placement prediction.",
      );
    } finally {
      setPredicting(false);
    }
  };

  const currentDetails = prediction?.details || {
    projects: summary.projects,
    internships: summary.internships,
    certifications: summary.certifications,
    cgpa: profile?.cgpa ? Number(profile.cgpa) : undefined,
    aptitude_score: profile?.aptitude_score
      ? Number(profile.aptitude_score)
      : undefined,
    communication_score: profile?.communication_score
      ? Number(profile.communication_score)
      : undefined,
  };
  const readinessResult = prediction ? readiness(prediction.score) : null;
  const technicalSkills = skills.filter(
    (skill) => skill.skill_type?.toLowerCase() !== "soft skill",
  );
  const softSkills = skills.filter(
    (skill) => skill.skill_type?.toLowerCase() === "soft skill",
  );
  const improvementItems =
    prediction?.improvements.length ? prediction.improvements.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-ink-50 px-5 py-8 dark:bg-ink-950 sm:px-8">
      <main className="mx-auto max-w-7xl">
        <OnboardingProgress current="Prediction" />
        <PreviousStep to="/resume" />
        <header className="mb-8 flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Target className="h-4 w-4" />
              Placement readiness
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 sm:text-4xl">
              Placement Predictor
            </h1>
            <p className="mt-2 max-w-2xl text-ink-500 dark:text-ink-400">
              AI-powered analysis of your placement readiness.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              Analyze your academic performance, skills, projects, experience
              and other profile factors to estimate your placement readiness.
            </p>
          </div>
          <Button
            size="lg"
            onClick={predictPlacement}
            loading={predicting}
            disabled={loadingProfile || !profile}
            leftIcon={!predicting ? <Target className="h-5 w-5" /> : undefined}
          >
            {predicting ? "Analyzing profile..." : "Predict My Placement"}
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
              Loading your profile factors...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brand-600" />
                    Profile factors considered
                  </CardTitle>
                  <CardDescription>
                    These are the values supplied to the placement model.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">
                      Academic
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Metric icon={<GraduationCap className="h-4 w-4" />} label="CGPA" value={displayValue(currentDetails.cgpa)} />
                      <Metric icon={<BarChart3 className="h-4 w-4" />} label="Year" value={displayValue(profile?.year)} />
                      <Metric icon={<GraduationCap className="h-4 w-4" />} label="Branch / Degree" value={displayValue([profile?.branch, profile?.degree].filter(Boolean).join(" / "))} />
                    </div>
                  </div>
                  <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">
                      Performance
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Metric icon={<Target className="h-4 w-4" />} label="Aptitude" value={displayValue(currentDetails.aptitude_score)} />
                      <Metric icon={<MessageSquare className="h-4 w-4" />} label="Communication" value={displayValue(currentDetails.communication_score)} />
                    </div>
                  </div>
                  <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">
                      Experience and skills
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Metric icon={<Code2 className="h-4 w-4" />} label="Projects" value={displayValue(currentDetails.projects)} />
                      <Metric icon={<Briefcase className="h-4 w-4" />} label="Internships" value={displayValue(currentDetails.internships)} />
                      <Metric icon={<Award className="h-4 w-4" />} label="Certifications" value={displayValue(currentDetails.certifications)} />
                      <Metric icon={<UserRound className="h-4 w-4" />} label="Technical / soft skills" value={`${technicalSkills.length} / ${softSkills.length}`} />
                    </div>
                  </div>
                </CardContent>
                {prediction && <ContinueStep to="/career-recommendation" label="Continue to Career Recommendation" showPrevious={false} />}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    AI Insights
                  </CardTitle>
                  <CardDescription>
                    Observations based on the profile values used for this prediction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prediction ? (
                    <>
                      {Number(currentDetails.projects) > 0 && (
                        <p className="text-sm text-ink-600 dark:text-ink-300">
                          Your project experience is a positive factor in your profile.
                        </p>
                      )}
                      {Number(currentDetails.internships) === 0 && (
                        <p className="text-sm text-ink-600 dark:text-ink-300">
                          Adding relevant internship experience could strengthen your profile.
                        </p>
                      )}
                      {Number(currentDetails.cgpa) >= 7 && (
                        <p className="text-sm text-ink-600 dark:text-ink-300">
                          Your academic performance is a positive contributor.
                        </p>
                      )}
                      {technicalSkills.length < 3 && (
                        <p className="text-sm text-ink-600 dark:text-ink-300">
                          Adding relevant technical skills could improve your placement readiness.
                        </p>
                      )}
                      {!Number(currentDetails.projects) &&
                        !Number(currentDetails.internships) &&
                        Number(currentDetails.cgpa) < 7 &&
                        technicalSkills.length >= 3 && (
                          <p className="text-sm text-ink-600 dark:text-ink-300">
                            Building practical evidence through projects or internships would strengthen your profile.
                          </p>
                        )}
                    </>
                  ) : (
                    <p className="text-sm text-ink-500 dark:text-ink-400">
                      Run a prediction to see profile-specific insights.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="h-1.5 bg-brand-600" />
                <CardHeader>
                  <CardTitle>AI Placement Prediction</CardTitle>
                  <CardDescription>
                    Prediction generated from the existing placement model.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {prediction ? (
                    <>
                      <p className="font-display text-7xl font-extrabold tabular-nums text-ink-900 dark:text-ink-50">
                        {prediction.score}%
                      </p>
                      <p className="mt-3 text-sm uppercase tracking-widest text-ink-400">
                        Placement Readiness
                      </p>
                      <p className={`mt-2 text-xl font-bold ${readinessResult?.tone}`}>
                        {readinessResult?.label}
                      </p>
                    </>
                  ) : (
                    <div className="py-8">
                      <Target className="mx-auto h-12 w-12 text-ink-300 dark:text-ink-600" />
                      <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">
                        Your actual model prediction will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How to Improve Your Placement Readiness</CardTitle>
                  <CardDescription>
                    Recommendations returned by the placement analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {improvementItems.length ? (
                    <ul className="space-y-3">
                      {improvementItems.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-ink-600 dark:text-ink-300">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-ink-500 dark:text-ink-400">
                      Run a prediction to receive recommendations based on your profile.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Readiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ChecklistItem label="Profile information" complete={Boolean(summary.profile_completion)} />
                  <ChecklistItem label="Projects" complete={Boolean(summary.projects)} />
                  <ChecklistItem label="Skills" complete={Boolean(summary.skills)} />
                  <ChecklistItem label="Internship" complete={Boolean(summary.internships)} />
                  <ChecklistItem label="Certifications" complete={Boolean(summary.certifications)} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
