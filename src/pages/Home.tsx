import { useEffect, useState } from 'react';
import {
  BarChart3,
  Brain,
  Zap,
  FileCheck2,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Header } from '../components/Header';
import { StudentForm } from '../components/StudentForm';
import { ResultSection } from '../components/ResultSection';
import { ProfileSummary } from '../components/ProfileSummary';
import { PredictionHistory } from '../components/PredictionHistory';
import { StatCard, StatCardGrid } from '../components/StatCard';
import { Card, CardContent } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import {
  type PredictionResult,
  type StudentFormValues,
  type HistoryEntry,
} from '../types';

interface HistoryApiRecord {
  id: number;
  student_name: string;
  probability: number;
  status: 'likely' | 'moderate' | 'unlikely';
  generated_at: string;
  status_label?: string;
}

function App() {
  const { theme, toggle } = useTheme();

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // 👇 Add this entire block
  const fetchHistory = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/history");

      if (!response.ok) throw new Error("Unable to load prediction history.");
      const data = await response.json();

      const records = Array.isArray(data) ? data as HistoryApiRecord[] : [];
      const formatted = records.map((item) => ({
        id: item.id.toString(),
        studentName: item.student_name,
        probability: item.probability,
        status: item.status,
        statusLabel:
          item.status === "likely"
            ? "Strong Placement Chances"
            : item.status === "moderate"
            ? "Moderate Placement Chances"
            : "Needs Significant Improvement",
        generatedAt: item.generated_at,
      }));

      setHistory(formatted);

    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 👇 Your existing function continues here
  const handlePredict = async (values: StudentFormValues) => {

  try {
    setLoading(true);
    const response = await fetch(
      'http://127.0.0.1:5000/predict',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      }
    );

    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Prediction failed.");
    }

    const newResult: PredictionResult = {
      ...data,
      profile: values,
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    };

    setResult(newResult);

    await fetchHistory();
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'Prediction failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => setResult(null);
  const handleClearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Header theme={theme} onToggleTheme={toggle} />

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        {/* Dashboard stats */}
        <section className="py-8">
          <StatCardGrid>
            <StatCard
              label="Total Predictions"
              value={history.length}
              icon={<BarChart3 className="h-5 w-5" />}
              accent="brand"
              delay={0}
            />
            <StatCard
              label="Avg Probability"
              value={
                history.length > 0
                  ? Math.round(history.reduce((s, e) => s + e.probability, 0) / history.length)
                  : 0
              }
              suffix="%"
              icon={<TrendingUp className="h-5 w-5" />}
              accent="success"
              delay={80}
            />
            <StatCard
              label="Likely Placed"
              value={history.filter((e) => e.status === 'likely').length}
              icon={<Award className="h-5 w-5" />}
              accent="warning"
              trend={8}
              trendLabel="this month"
              delay={160}
            />
            <StatCard
              label="Candidates"
              value={new Set(history.map((e) => e.studentName)).size}
              icon={<Users className="h-5 w-5" />}
              accent="neutral"
              delay={240}
            />
          </StatCardGrid>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-ink-50">
              How it works
            </h2>
            <p className="mt-2 text-ink-500 dark:text-ink-400">
              Three steps from profile to prediction.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StepCard
              icon={<FileCheck2 className="h-5 w-5" />}
              step="01"
              title="Enter your profile"
              description="Fill in your academic record, projects, and skill ratings."
            />
            <StepCard
              icon={<Brain className="h-5 w-5" />}
              step="02"
              title="AI analyzes signals"
              description="Our model evaluates six key placement signals in real time."
            />
            <StepCard
              icon={<Zap className="h-5 w-5" />}
              step="03"
              title="Get your prediction"
              description="Receive a probability score and tailored improvement plan."
            />
          </div>
        </section>

        {/* Predictor + result */}
        <section id="predictor" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <StudentForm onSubmit={handlePredict} loading={loading} />
            {result && <ProfileSummary profile={result.profile} />}
          </div>

          {result ? (
            <ResultSection result={result} onReset={handleReset} />
          ) : (
            <EmptyState loading={loading} />
          )}
        </section>

        {/* Prediction history */}
        <section id="history" className="mt-6">
          <PredictionHistory entries={history} onClear={handleClearHistory} />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StepCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <Card hover className="group relative animate-fade-in-up">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
            {icon}
          </div>
          <span className="font-display text-3xl font-extrabold text-ink-100 transition-colors group-hover:text-brand-100 dark:text-ink-800 dark:group-hover:text-brand-500/30">
            {step}
          </span>
        </div>
        <h3 className="mt-4 font-display text-base font-bold text-ink-900 dark:text-ink-50">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <Card className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <CardContent className="flex flex-col items-center">
        <div className="relative">
          {loading && (
            <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-brand-500/30" />
          )}
          <div
            className={`relative flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
              loading
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500'
            }`}
          >
            <BarChart3 className="h-8 w-8" />
          </div>
        </div>
        <h3 className="mt-5 font-display text-lg font-bold text-ink-900 dark:text-ink-50">
          {loading ? 'Crunching the numbers…' : 'Your prediction will appear here'}
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-ink-500 dark:text-ink-400">
          {loading
            ? 'Comparing your inputs with the configured placement model.'
            : 'Fill in your student profile and hit Predict Placement to see your chances.'}
        </p>
        {loading && (
          <div className="mt-6 w-full max-w-xs space-y-2.5">
            <div className="shimmer-bg h-3 animate-shimmer rounded-full" />
            <div className="shimmer-bg h-3 w-4/5 animate-shimmer rounded-full" />
            <div className="shimmer-bg h-3 w-3/5 animate-shimmer rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Placentra AI · AI-powered student placement prediction and career guidance.
        </p>
        <p className="text-xs text-ink-400 dark:text-ink-500">
          For demonstration purposes. Predictions are illustrative only.
        </p>
      </div>
    </footer>
  );
}

export default App;
