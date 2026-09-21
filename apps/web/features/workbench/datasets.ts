import type { TaskType } from "./types";

export type WorkbenchDatasetRecord = {
  id: string;
  name: string;
  taskType: TaskType;
  description: string;
  targetColumn?: string;
  rows: Array<Record<string, string | number | null>>;
};

export const HOUSING_EXPERIENCE_DATA: Array<Record<string, string | number | null>> = [
  { experience: 1.0, education: "BSc", projects: 2, salary: 45.0 },
  { experience: 1.5, education: "BSc", projects: 3, salary: 48.0 },
  { experience: 2.0, education: "MSc", projects: 4, salary: 56.0 },
  { experience: 2.5, education: "BSc", projects: null, salary: 53.0 }, // intentional missing
  { experience: 3.0, education: "MSc", projects: 5, salary: 64.0 },
  { experience: 3.5, education: "PhD", projects: 6, salary: 75.0 },
  { experience: 4.0, education: "BSc", projects: 5, salary: 68.0 },
  { experience: 4.5, education: "MSc", projects: 7, salary: 79.0 },
  { experience: 5.0, education: "PhD", projects: 8, salary: 92.0 },
  { experience: 5.5, education: "BSc", projects: 6, salary: 81.0 },
  { experience: 6.0, education: "MSc", projects: 9, salary: 95.0 },
  { experience: 6.5, education: "PhD", projects: 10, salary: 108.0 },
  { experience: 7.0, education: "BSc", projects: 8, salary: 98.0 },
  { experience: 7.5, education: "MSc", projects: 11, salary: 112.0 },
  { experience: 8.0, education: "PhD", projects: 12, salary: 126.0 },
  { experience: 8.5, education: "MSc", projects: 12, salary: 122.0 },
  { experience: 9.0, education: "PhD", projects: 14, salary: 138.0 },
  { experience: 9.5, education: "PhD", projects: 15, salary: 145.0 },
  { experience: 10.0, education: "MSc", projects: 14, salary: 140.0 },
  { experience: 10.5, education: "PhD", projects: 16, salary: 155.0 },
];

export const STUDENT_ADMISSION_DATA: Array<Record<string, string | number | null>> = [
  { study_hours: 1.5, attendance: 65.0, tutoring: "No", passed: 0 },
  { study_hours: 2.0, attendance: 70.0, tutoring: "No", passed: 0 },
  { study_hours: 2.2, attendance: 60.0, tutoring: "No", passed: 0 },
  { study_hours: 2.8, attendance: 75.0, tutoring: "Yes", passed: 0 },
  { study_hours: null, attendance: 68.0, tutoring: "No", passed: 0 }, // intentional missing
  { study_hours: 3.2, attendance: 80.0, tutoring: "No", passed: 0 },
  { study_hours: 3.5, attendance: 72.0, tutoring: "Yes", passed: 0 },
  { study_hours: 3.8, attendance: 85.0, tutoring: "No", passed: 1 },
  { study_hours: 4.0, attendance: 78.0, tutoring: "Yes", passed: 1 },
  { study_hours: 4.5, attendance: 82.0, tutoring: "No", passed: 1 },
  { study_hours: 5.0, attendance: 90.0, tutoring: "Yes", passed: 1 },
  { study_hours: 5.2, attendance: 76.0, tutoring: "No", passed: 0 },
  { study_hours: 5.8, attendance: 88.0, tutoring: "Yes", passed: 1 },
  { study_hours: 6.0, attendance: 92.0, tutoring: "Yes", passed: 1 },
  { study_hours: 6.5, attendance: 85.0, tutoring: "No", passed: 1 },
  { study_hours: 7.0, attendance: 95.0, tutoring: "Yes", passed: 1 },
  { study_hours: 7.5, attendance: 91.0, tutoring: "Yes", passed: 1 },
  { study_hours: 8.0, attendance: 96.0, tutoring: "Yes", passed: 1 },
  { study_hours: 8.5, attendance: 94.0, tutoring: "Yes", passed: 1 },
  { study_hours: 9.0, attendance: 98.0, tutoring: "Yes", passed: 1 },
];

export const CUSTOMER_CLUSTERING_DATA: Array<Record<string, string | number | null>> = [
  { income: 25.0, spending: 78.0, membership: "Standard" },
  { income: 28.0, spending: 82.0, membership: "Standard" },
  { income: 32.0, spending: 75.0, membership: "Standard" },
  { income: 35.0, spending: 85.0, membership: "Standard" },
  { income: 65.0, spending: 45.0, membership: "Premium" },
  { income: 70.0, spending: 48.0, membership: "Premium" },
  { income: 72.0, spending: 52.0, membership: "Premium" },
  { income: 75.0, spending: 40.0, membership: "Premium" },
  { income: 105.0, spending: 18.0, membership: "VIP" },
  { income: 110.0, spending: 22.0, membership: "VIP" },
  { income: 115.0, spending: 15.0, membership: "VIP" },
  { income: 120.0, spending: 25.0, membership: "VIP" },
];

export const AVAILABLE_WORKBENCH_DATASETS: WorkbenchDatasetRecord[] = [
  {
    id: "housing_regression",
    name: "Experience & Education Salary",
    taskType: "regression",
    description: "Predict software engineer salary ($k) from years of experience, education tier, and completed projects (contains 1 missing value).",
    targetColumn: "salary",
    rows: HOUSING_EXPERIENCE_DATA,
  },
  {
    id: "student_classification",
    name: "Student Exam Admission",
    taskType: "classification",
    description: "Classify student pass/fail outcome from weekly study hours (contains 1 missing value), attendance rate, and tutoring status.",
    targetColumn: "passed",
    rows: STUDENT_ADMISSION_DATA,
  },
  {
    id: "customer_clustering",
    name: "Customer Retail Segmentation",
    taskType: "clustering",
    description: "Segment retail shoppers without targets using annual income ($k), spending loyalty score, and membership tier.",
    rows: CUSTOMER_CLUSTERING_DATA,
  },
];

export function getWorkbenchDataset(id: string): WorkbenchDatasetRecord {
  const found = AVAILABLE_WORKBENCH_DATASETS.find((d) => d.id === id);
  if (!found) {
    throw new Error(`Unknown dataset id: ${id}`);
  }
  return found;
}
