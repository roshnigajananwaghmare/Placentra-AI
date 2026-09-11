export interface StudentFormValues {
  fullName: string;
  cgpa: string;
  aptitudeScore: string;
  projects: string;
  internship: string;
  communication: string;
}

export type PlacementStatus = 'likely' | 'moderate' | 'unlikely';

export interface PredictionResult {
  probability: number;
  status: PlacementStatus;
  statusLabel: string;
  suggestions: string[];
  studentName: string;
  generatedAt: string;
  /** Snapshot of the profile used for this prediction */
  profile: StudentFormValues;
}

export interface HistoryEntry {
  id: string;
  studentName: string;
  probability: number;
  status: PlacementStatus;
  statusLabel: string;
  generatedAt: string;
}
