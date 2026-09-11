import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const ONBOARDING_STEPS = [
  { label: "Profile", path: "/profile" },
  { label: "Projects", path: "/projects" },
  { label: "Skills", path: "/skills" },
  { label: "Internships", path: "/internships" },
  { label: "Certifications", path: "/certifications" },
  { label: "Resume", path: "/resume" },
  { label: "Prediction", path: "/placement-predictor" },
  { label: "Career", path: "/career-recommendation" },
  { label: "Skill Gap", path: "/skill-gap-analysis" },
  { label: "Plan", path: "/improvement-plan" },
  { label: "Dashboard", path: "/dashboard" },
];

export function markOnboardingStep(step: string) {
  const user = JSON.parse(localStorage.getItem("user") || "{}") as { id?: number };
  if (!user.id) return;
  const key = `placementai-onboarding-${user.id}`;
  const current = JSON.parse(localStorage.getItem(key) || "{}") as Record<string, boolean>;
  localStorage.setItem(key, JSON.stringify({ ...current, [step]: true }));
}

export function OnboardingProgress({ current }: { current: string }) {
  const index = ONBOARDING_STEPS.findIndex((step) => step.label === current);
  return (
    <nav aria-label="Onboarding progress" className="mb-6 overflow-x-auto rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex min-w-max items-center gap-2">
        {ONBOARDING_STEPS.map((step, stepIndex) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              stepIndex === index
                ? "bg-brand-600 text-white"
                : stepIndex < index
                  ? "bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300"
                  : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500"
            }`}>
              {stepIndex < index && <CheckCircle2 className="h-3.5 w-3.5" />}
              {step.label}
            </div>
            {stepIndex < ONBOARDING_STEPS.length - 1 && <span className="text-ink-300">→</span>}
          </div>
        ))}
      </div>
    </nav>
  );
}

export function ContinueStep({ to, label, optional = false, showPrevious = true }: { to: string; label: string; optional?: boolean; showPrevious?: boolean }) {
  const targetIndex = ONBOARDING_STEPS.findIndex((step) => step.path === to);
  const previousStep = targetIndex > 1 ? ONBOARDING_STEPS[targetIndex - 2] : undefined;
  const currentStep = targetIndex > 0 ? ONBOARDING_STEPS[targetIndex - 1]?.label : undefined;
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      {optional && <span className="text-xs text-ink-500">This step is optional.</span>}
      <div className="flex flex-wrap gap-3">
        {showPrevious && previousStep && <PreviousStep to={previousStep.path} />}
        {optional && (
          <Link
            to={to}
            onClick={() => currentStep && markOnboardingStep(currentStep)}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            Skip
          </Link>
        )}
      <Link
        to={to}
        onClick={() => currentStep && markOnboardingStep(currentStep)}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        {label} <ArrowRight className="h-4 w-4" />
      </Link>
      </div>
    </div>
  );
}

export function PreviousStep({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
    >
      <ArrowLeft className="h-4 w-4" /> Previous
    </Link>
  );
}
