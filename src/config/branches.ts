export const BRANCH_OPTIONS = [
  "Computer Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Artificial Intelligence & Machine Learning",
  "Electronics & Telecommunication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Other",
] as const;

export const BRANCH_SELECT_OPTIONS = BRANCH_OPTIONS.map((branch) => ({
  value: branch,
  label: branch,
}));
