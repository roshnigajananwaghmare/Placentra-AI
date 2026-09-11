import { BrainCircuit, Sparkles, Github, BookOpen, Sun, Moon } from 'lucide-react';
import { Badge } from './ui/Badge';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
      {/* Decorative gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(60% 100% at 0% 0%, #3377ff 0%, transparent 50%), radial-gradient(50% 100% at 100% 0%, #10b981 0%, transparent 50%)',
        }}
      />
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-ink-900 dark:text-ink-50">
              Placentra AI
            </span>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            <a
              href="#predictor"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            >
              Predictor
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            >
              How it works
            </a>
            <a
              href="#history"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            >
              History
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            >
              <BookOpen className="h-4 w-4" />
              Docs
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 ring-1 ring-ink-200 transition-all duration-200 hover:bg-ink-100 hover:text-ink-900 active:scale-95 dark:text-ink-400 dark:ring-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-100"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <Badge tone="brand" dot className="hidden sm:inline-flex">
              <Sparkles className="h-3 w-3" />
              v1.0 Beta
            </Badge>
          </div>
        </div>

        {/* Hero */}
        <div className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <Badge tone="brand" className="mb-4">
              <Sparkles className="h-3 w-3" />
              AI-Powered Career Insights
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl dark:text-ink-50">
              AI Placement{' '}
              <span className="text-gradient">Predictor</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-500 dark:text-ink-400">
              Predict your placement chances using AI and data science. Get a
              personalized probability score and actionable suggestions to
              strengthen your profile.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                Uses your saved academic and experience data
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                6 key placement signals
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Instant results
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
