import {
  PredictionResult,
  StudentFormValues,
} from '../types';

export function generatePrediction(
  values: StudentFormValues
): PredictionResult {

  const cgpa = Number(values.cgpa);
const aptitude = Number(values.aptitudeScore);
const projects = Number(values.projects);
const communication = Number(values.communication);

let score = 0;

/* CGPA (30 marks) */
score += (cgpa / 10) * 30;

/* Aptitude (25 marks) */
score += (aptitude / 100) * 25;

/* Projects (20 marks) */
if (projects >= 5) {
  score += 20;
} else if (projects >= 3) {
  score += 15;
} else if (projects >= 1) {
  score += 8;
}

/* Internship (15 marks) */
if (values.internship === 'yes') {
  score += 15;
}

/* Communication (10 marks) */
score += (communication / 10) * 10;

/* Penalties */

if (cgpa < 6) {
  score -= 10;
}

if (aptitude < 50) {
  score -= 10;
}

if (projects === 0) {
  score -= 15;
}

if (values.internship !== 'yes') {
  score -= 5;
}

score = Math.round(score);
score = Math.max(0, Math.min(95, score));

  let status: 'likely' | 'moderate' | 'unlikely';
let statusLabel: string;

if (score >= 80) {
  status = 'likely';
  statusLabel = 'Strong Placement Chances';
}
else if (score >= 60) {
  status = 'moderate';
  statusLabel = 'Moderate Placement Chances';
}
else {
  status = 'unlikely';
  statusLabel = 'Needs Significant Improvement';
}

  const suggestions: string[] = [];

  if (Number(values.cgpa) < 7) {
    suggestions.push('Improve academic performance');
  }

  if (Number(values.projects) < 2) {
    suggestions.push('Build more projects');
  }

  if (Number(values.aptitudeScore) < 60) {
    suggestions.push('Practice aptitude tests');
  }

  if (values.internship !== 'yes') {
    suggestions.push('Complete an internship');
  }

  if (Number(values.communication) < 6) {
    suggestions.push('Improve communication skills');
  }

  if (suggestions.length === 0) {
    suggestions.push('Excellent profile. Continue interview preparation.');
  }

  return {
    probability: score,
    status,
    statusLabel,
    suggestions,
    studentName: values.fullName,
    generatedAt: new Date().toISOString(),
    profile: values,
  };
}