import { useState, type FormEvent } from 'react';
import {
  User,
  GraduationCap,
  Target,
  FolderGit2,
  Briefcase,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import type { StudentFormValues } from '../types';

interface StudentFormProps {
  onSubmit: (values: StudentFormValues) => void;
  loading?: boolean;
}

const initialValues: StudentFormValues = {
  fullName: '',
  cgpa: '',
  aptitudeScore: '',
  projects: '',
  internship: '',
  communication: '',
};

export function StudentForm({ onSubmit, loading = false }: StudentFormProps) {
  const [values, setValues] = useState<StudentFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormValues, string>>>({});

  const update = (field: keyof StudentFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof StudentFormValues, string>> = {};
    if (!values.fullName.trim()) next.fullName = 'Please enter your full name';

    const cgpa = Number(values.cgpa);
    if (!values.cgpa || isNaN(cgpa) || cgpa < 0 || cgpa > 10)
      next.cgpa = 'CGPA must be between 0 and 10';

    const apt = Number(values.aptitudeScore);
    if (!values.aptitudeScore || isNaN(apt) || apt < 0 || apt > 100)
      next.aptitudeScore = 'Aptitude score must be between 0 and 100';

    const proj = Number(values.projects);
    if (!values.projects || isNaN(proj) || proj < 0)
      next.projects = 'Enter a valid number of projects';

    if (!values.internship) next.internship = 'Please select an option';

    const comm = Number(values.communication);
    if (!values.communication || isNaN(comm) || comm < 1 || comm > 10)
      next.communication = 'Communication skills must be between 1 and 10';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(values);
  };

  return (
    <Card id="predictor" className="animate-fade-in-up scroll-mt-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Student Profile</CardTitle>
            <CardDescription>
              Enter your academic and skill details to generate a prediction.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            name="fullName"
            label="Full Name"
            placeholder="e.g. Aarav Sharma"
            icon={<User className="h-4 w-4" />}
            value={values.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            error={errors.fullName}
            autoComplete="name"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              name="cgpa"
              type="number"
              label="CGPA"
              placeholder="8.5"
              min={0}
              max={10}
              step={0.1}
              suffix="/ 10"
              icon={<GraduationCap className="h-4 w-4" />}
              value={values.cgpa}
              onChange={(e) => update('cgpa', e.target.value)}
              error={errors.cgpa}
            />
            <Input
              name="aptitudeScore"
              type="number"
              label="Aptitude Score"
              placeholder="75"
              min={0}
              max={100}
              suffix="/ 100"
              icon={<Target className="h-4 w-4" />}
              value={values.aptitudeScore}
              onChange={(e) => update('aptitudeScore', e.target.value)}
              error={errors.aptitudeScore}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              name="projects"
              type="number"
              label="Number of Projects"
              placeholder="3"
              min={0}
              icon={<FolderGit2 className="h-4 w-4" />}
              value={values.projects}
              onChange={(e) => update('projects', e.target.value)}
              error={errors.projects}
            />
            <Select
              name="internship"
              label="Internship Experience"
              placeholder="Select…"
              icon={<Briefcase className="h-4 w-4" />}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
              value={values.internship}
              onChange={(e) => update('internship', e.target.value)}
              error={errors.internship}
            />
          </div>

          <Input
            name="communication"
            type="number"
            label="Communication Skills"
            placeholder="8"
            min={1}
            max={10}
            suffix="/ 10"
            icon={<MessageSquare className="h-4 w-4" />}
            value={values.communication}
            onChange={(e) => update('communication', e.target.value)}
            error={errors.communication}
            hint="Rate your verbal and written communication from 1 to 10."
          />

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full"
            leftIcon={!loading ? <Sparkles className="h-5 w-5" /> : undefined}
            rightIcon={!loading ? <ArrowRight className="h-5 w-5" /> : undefined}
          >
            {loading ? 'Analyzing your profile…' : 'Predict Placement'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
