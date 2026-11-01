import type { TaskType } from "./types";

export type WorkbenchDatasetRecord = {
  id: string;
  name: string;
  taskType: TaskType;
  description: string;
  targetColumn?: string;
  rows: Array<Record<string, string | number | null>>;
};

// 1. PROJECT 01: SALARY PREDICTION (Regression)
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

// 2. PROJECT 02: STUDENT EXAM OUTCOME (Binary Classification)
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

// 3. PROJECT 03: CUSTOMER RETAIL SEGMENTATION (Clustering)
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

// 4. PROJECT 04: HOUSE PRICE PREDICTION (Multivariate Regression)
export const HOUSE_PRICE_DATA: Array<Record<string, string | number | null>> = [
  { square_feet: 1200, bedrooms: 2, bathrooms: 1.5, house_age: 15, location: "Suburban", price: 235.0 },
  { square_feet: 1450, bedrooms: 3, bathrooms: 2.0, house_age: 10, location: "Suburban", price: 280.0 },
  { square_feet: 1600, bedrooms: 3, bathrooms: 2.0, house_age: 12, location: "Urban", price: 340.0 },
  { square_feet: 1750, bedrooms: 3, bathrooms: null, house_age: 8, location: "Suburban", price: 310.0 }, // intentional missing
  { square_feet: 1900, bedrooms: 4, bathrooms: 2.5, house_age: 5, location: "Suburban", price: 375.0 },
  { square_feet: 2100, bedrooms: 4, bathrooms: 3.0, house_age: 18, location: "Urban", price: 420.0 },
  { square_feet: 2300, bedrooms: 4, bathrooms: 3.0, house_age: 4, location: "Urban", price: 495.0 },
  { square_feet: 2500, bedrooms: 4, bathrooms: 3.5, house_age: 6, location: "Suburban", price: 460.0 },
  { square_feet: 2800, bedrooms: 5, bathrooms: 3.5, house_age: 2, location: "Urban", price: 580.0 },
  { square_feet: 1100, bedrooms: 2, bathrooms: 1.0, house_age: 25, location: "Rural", price: 180.0 },
  { square_feet: 1350, bedrooms: 3, bathrooms: 1.5, house_age: 20, location: "Rural", price: 215.0 },
  { square_feet: 1550, bedrooms: 3, bathrooms: 2.0, house_age: 14, location: "Rural", price: 245.0 },
  { square_feet: 3100, bedrooms: 5, bathrooms: 4.0, house_age: 1, location: "Urban", price: 650.0 },
  { square_feet: 2050, bedrooms: 3, bathrooms: 2.5, house_age: 9, location: "Suburban", price: 390.0 },
  { square_feet: 1800, bedrooms: 3, bathrooms: 2.0, house_age: 7, location: "Suburban", price: 350.0 },
];

// 5. PROJECT 05: CUSTOMER RFM SEGMENTATION (Clustering)
export const CUSTOMER_RFM_DATA: Array<Record<string, string | number | null>> = [
  { recency_days: 12, frequency_orders: 28, monetary_spend: 3450.0, loyalty: "Gold" },
  { recency_days: 15, frequency_orders: 24, monetary_spend: 3100.0, loyalty: "Gold" },
  { recency_days: 8, frequency_orders: 35, monetary_spend: 4200.0, loyalty: "Gold" },
  { recency_days: 20, frequency_orders: 22, monetary_spend: 2800.0, loyalty: "Gold" },
  { recency_days: 45, frequency_orders: 12, monetary_spend: 1450.0, loyalty: "Silver" },
  { recency_days: 52, frequency_orders: 10, monetary_spend: 1200.0, loyalty: "Silver" },
  { recency_days: 60, frequency_orders: 14, monetary_spend: 1600.0, loyalty: "Silver" },
  { recency_days: 38, frequency_orders: 15, monetary_spend: 1750.0, loyalty: "Silver" },
  { recency_days: 140, frequency_orders: 3, monetary_spend: 280.0, loyalty: "Bronze" },
  { recency_days: 180, frequency_orders: 2, monetary_spend: 190.0, loyalty: "Bronze" },
  { recency_days: 210, frequency_orders: 1, monetary_spend: 110.0, loyalty: "Bronze" },
  { recency_days: 165, frequency_orders: 2, monetary_spend: 220.0, loyalty: "Bronze" },
];

// 6. PROJECT 06: EMAIL SPAM DETECTION (NLP / Binary Classification)
export const EMAIL_SPAM_DATA: Array<Record<string, string | number | null>> = [
  { char_count: 140, urgency_words: 4, has_link: 1, susp_score: 85, sender: "unverified", is_spam: 1 },
  { char_count: 95, urgency_words: 3, has_link: 1, susp_score: 92, sender: "unverified", is_spam: 1 },
  { char_count: 210, urgency_words: 5, has_link: 1, susp_score: 88, sender: "freemail", is_spam: 1 },
  { char_count: 75, urgency_words: 4, has_link: 1, susp_score: 95, sender: "unverified", is_spam: 1 },
  { char_count: 120, urgency_words: 3, has_link: 1, susp_score: 79, sender: "freemail", is_spam: 1 },
  { char_count: 550, urgency_words: 0, has_link: 0, susp_score: 12, sender: "corporate", is_spam: 0 },
  { char_count: 420, urgency_words: 1, has_link: 1, susp_score: 18, sender: "corporate", is_spam: 0 },
  { char_count: 380, urgency_words: 0, has_link: 0, susp_score: null, sender: "corporate", is_spam: 0 }, // intentional missing
  { char_count: 620, urgency_words: 1, has_link: 1, susp_score: 22, sender: "corporate", is_spam: 0 },
  { char_count: 290, urgency_words: 0, has_link: 0, susp_score: 15, sender: "freemail", is_spam: 0 },
  { char_count: 160, urgency_words: 4, has_link: 1, susp_score: 90, sender: "unverified", is_spam: 1 },
  { char_count: 480, urgency_words: 0, has_link: 1, susp_score: 25, sender: "corporate", is_spam: 0 },
];

// 7. PROJECT 07: HANDWRITTEN DIGIT RECOGNITION (Computer Vision / Classification)
export const DIGIT_RECOGNITION_DATA: Array<Record<string, string | number | null>> = [
  { top_density: 0.15, bottom_density: 0.85, loops: 0, vert_sym: 0.72, horiz_sym: 0.40, is_digit_zero: 0 },
  { top_density: 0.78, bottom_density: 0.75, loops: 1, vert_sym: 0.85, horiz_sym: 0.88, is_digit_zero: 1 },
  { top_density: 0.82, bottom_density: 0.80, loops: 1, vert_sym: 0.90, horiz_sym: 0.84, is_digit_zero: 1 },
  { top_density: 0.12, bottom_density: 0.90, loops: 0, vert_sym: 0.68, horiz_sym: 0.35, is_digit_zero: 0 },
  { top_density: 0.75, bottom_density: 0.79, loops: 1, vert_sym: 0.88, horiz_sym: 0.86, is_digit_zero: 1 },
  { top_density: 0.20, bottom_density: 0.82, loops: 0, vert_sym: 0.75, horiz_sym: 0.42, is_digit_zero: 0 },
  { top_density: 0.85, bottom_density: 0.72, loops: 1, vert_sym: 0.82, horiz_sym: 0.80, is_digit_zero: 1 },
  { top_density: 0.18, bottom_density: 0.88, loops: null, vert_sym: 0.70, horiz_sym: 0.38, is_digit_zero: 0 }, // intentional missing
  { top_density: 0.80, bottom_density: 0.85, loops: 1, vert_sym: 0.86, horiz_sym: 0.90, is_digit_zero: 1 },
  { top_density: 0.22, bottom_density: 0.78, loops: 0, vert_sym: 0.65, horiz_sym: 0.45, is_digit_zero: 0 },
  { top_density: 0.77, bottom_density: 0.74, loops: 1, vert_sym: 0.84, horiz_sym: 0.82, is_digit_zero: 1 },
  { top_density: 0.16, bottom_density: 0.86, loops: 0, vert_sym: 0.71, horiz_sym: 0.39, is_digit_zero: 0 },
];

// 8. PROJECT 08: MOVIE RECOMMENDATION SYSTEM (Collaborative Filtering / Regression)
export const MOVIE_RATING_DATA: Array<Record<string, string | number | null>> = [
  { action_affinity: 0.90, scifi_affinity: 0.85, drama_affinity: 0.30, avg_rating_given: 4.2, genre: "Sci-Fi", rating: 4.8 },
  { action_affinity: 0.85, scifi_affinity: 0.92, drama_affinity: 0.25, avg_rating_given: 4.0, genre: "Sci-Fi", rating: 4.6 },
  { action_affinity: 0.30, scifi_affinity: 0.20, drama_affinity: 0.95, avg_rating_given: 3.8, genre: "Drama", rating: 4.5 },
  { action_affinity: 0.25, scifi_affinity: 0.15, drama_affinity: 0.88, avg_rating_given: 3.9, genre: "Drama", rating: 4.2 },
  { action_affinity: 0.95, scifi_affinity: 0.80, drama_affinity: 0.20, avg_rating_given: null, genre: "Action", rating: 4.7 }, // intentional missing
  { action_affinity: 0.40, scifi_affinity: 0.35, drama_affinity: 0.85, avg_rating_given: 3.5, genre: "Drama", rating: 4.1 },
  { action_affinity: 0.80, scifi_affinity: 0.75, drama_affinity: 0.40, avg_rating_given: 3.7, genre: "Action", rating: 4.0 },
  { action_affinity: 0.35, scifi_affinity: 0.40, drama_affinity: 0.90, avg_rating_given: 4.1, genre: "Drama", rating: 4.4 },
  { action_affinity: 0.88, scifi_affinity: 0.90, drama_affinity: 0.35, avg_rating_given: 4.4, genre: "Sci-Fi", rating: 4.9 },
  { action_affinity: 0.20, scifi_affinity: 0.10, drama_affinity: 0.92, avg_rating_given: 3.6, genre: "Drama", rating: 4.3 },
  { action_affinity: 0.75, scifi_affinity: 0.70, drama_affinity: 0.45, avg_rating_given: 3.8, genre: "Action", rating: 3.9 },
  { action_affinity: 0.82, scifi_affinity: 0.88, drama_affinity: 0.28, avg_rating_given: 4.3, genre: "Sci-Fi", rating: 4.6 },
];

// 9. PROJECT 09: STOCK PRICE PREDICTION (Time-Series Regression)
export const STOCK_PRICE_DATA: Array<Record<string, string | number | null>> = [
  { day_seq: 1, open_price: 150.0, high_price: 152.5, low_price: 149.0, volume_k: 1200, ma_5day: 148.5, close_price: 151.8 },
  { day_seq: 2, open_price: 152.0, high_price: 154.0, low_price: 151.0, volume_k: 1350, ma_5day: 149.8, close_price: 153.2 },
  { day_seq: 3, open_price: 153.5, high_price: 156.0, low_price: 152.8, volume_k: 1400, ma_5day: 151.0, close_price: 155.5 },
  { day_seq: 4, open_price: 155.0, high_price: 157.2, low_price: 154.0, volume_k: 1250, ma_5day: 152.4, close_price: 156.0 },
  { day_seq: 5, open_price: 156.5, high_price: 158.0, low_price: 155.0, volume_k: 1100, ma_5day: 154.5, close_price: 157.8 },
  { day_seq: 6, open_price: 158.0, high_price: 160.5, low_price: 157.5, volume_k: 1500, ma_5day: null, close_price: 159.2 }, // intentional missing
  { day_seq: 7, open_price: 159.5, high_price: 161.0, low_price: 158.0, volume_k: 1300, ma_5day: 157.1, close_price: 160.5 },
  { day_seq: 8, open_price: 161.0, high_price: 163.0, low_price: 160.0, volume_k: 1420, ma_5day: 158.6, close_price: 162.0 },
  { day_seq: 9, open_price: 162.5, high_price: 164.5, low_price: 161.5, volume_k: 1600, ma_5day: 159.9, close_price: 163.8 },
  { day_seq: 10, open_price: 164.0, high_price: 165.5, low_price: 162.8, volume_k: 1380, ma_5day: 161.5, close_price: 164.2 },
  { day_seq: 11, open_price: 164.5, high_price: 166.0, low_price: 163.5, volume_k: 1280, ma_5day: 162.9, close_price: 165.7 },
  { day_seq: 12, open_price: 166.0, high_price: 168.0, low_price: 165.0, volume_k: 1700, ma_5day: 164.4, close_price: 167.5 },
];

// 10. PROJECT 10: CREDIT CARD FRAUD DETECTION (Imbalanced Binary Classification)
export const CREDIT_FRAUD_DATA: Array<Record<string, string | number | null>> = [
  { amount: 18.5, distance_miles: 2.1, is_online: 0, device_risk: 10, card_type: "Chip", is_fraud: 0 },
  { amount: 45.0, distance_miles: 4.5, is_online: 0, device_risk: 15, card_type: "Chip", is_fraud: 0 },
  { amount: 82.0, distance_miles: 8.0, is_online: 1, device_risk: 25, card_type: "Online", is_fraud: 0 },
  { amount: 35.0, distance_miles: 1.5, is_online: 0, device_risk: 8, card_type: "Chip", is_fraud: 0 },
  { amount: 1200.0, distance_miles: 450.0, is_online: 1, device_risk: 92, card_type: "Virtual", is_fraud: 1 }, // FRAUD
  { amount: 24.0, distance_miles: 3.2, is_online: 0, device_risk: 12, card_type: "Chip", is_fraud: 0 },
  { amount: 95.0, distance_miles: 12.0, is_online: 1, device_risk: null, card_type: "Online", is_fraud: 0 }, // intentional missing
  { amount: 55.0, distance_miles: 6.0, is_online: 0, device_risk: 18, card_type: "Chip", is_fraud: 0 },
  { amount: 1850.0, distance_miles: 820.0, is_online: 1, device_risk: 98, card_type: "Virtual", is_fraud: 1 }, // FRAUD
  { amount: 42.0, distance_miles: 5.0, is_online: 0, device_risk: 14, card_type: "Chip", is_fraud: 0 },
  { amount: 68.0, distance_miles: 7.5, is_online: 1, device_risk: 20, card_type: "Online", is_fraud: 0 },
  { amount: 2100.0, distance_miles: 620.0, is_online: 1, device_risk: 95, card_type: "Virtual", is_fraud: 1 }, // FRAUD
  { amount: 32.0, distance_miles: 2.8, is_online: 0, device_risk: 10, card_type: "Chip", is_fraud: 0 },
  { amount: 76.0, distance_miles: 9.2, is_online: 1, device_risk: 22, card_type: "Online", is_fraud: 0 },
  { amount: 50.0, distance_miles: 4.0, is_online: 0, device_risk: 16, card_type: "Chip", is_fraud: 0 },
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
  {
    id: "house_price_prediction",
    name: "Suburban Real Estate House Prices",
    taskType: "regression",
    description: "Predict residential house sale prices ($k) from square footage, bedrooms, bathrooms, age, and location (contains 1 missing value).",
    targetColumn: "price",
    rows: HOUSE_PRICE_DATA,
  },
  {
    id: "customer_rfm_clustering",
    name: "E-Commerce Customer RFM Cohorts",
    taskType: "clustering",
    description: "Discover natural behavioral buyer cohorts using Recency (days), Frequency (orders), Monetary spend ($), and loyalty tier.",
    rows: CUSTOMER_RFM_DATA,
  },
  {
    id: "email_spam_detection",
    name: "Email Phishing & Spam Filter",
    taskType: "classification",
    description: "Classify incoming emails as Spam or Legitimate using character counts, urgency words, embedded links, and suspicion scores.",
    targetColumn: "is_spam",
    rows: EMAIL_SPAM_DATA,
  },
  {
    id: "digit_recognition",
    name: "Handwritten Digit Structural Features",
    taskType: "classification",
    description: "Identify handwritten digits from pixel densities, aspect ratios, loop counts, and symmetry vectors.",
    targetColumn: "is_digit_zero",
    rows: DIGIT_RECOGNITION_DATA,
  },
  {
    id: "movie_recommendations",
    name: "Streaming Movie User Preferences",
    taskType: "regression",
    description: "Predict personalized user film review ratings (1.0 to 5.0) from genre affinities and historical average user scores.",
    targetColumn: "rating",
    rows: MOVIE_RATING_DATA,
  },
  {
    id: "stock_price_prediction",
    name: "Daily Equity Stock Quotations",
    taskType: "regression",
    description: "Forecast equity closing prices ($) from sequential trading days, moving averages, daily high/low spreads, and volume.",
    targetColumn: "close_price",
    rows: STOCK_PRICE_DATA,
  },
  {
    id: "credit_card_fraud",
    name: "Credit Card Fraudulent Transactions",
    taskType: "classification",
    description: "Detect rare unauthorized transactions (imbalanced ~20% fraud) using transaction amounts, geolocation distance, and device risk.",
    targetColumn: "is_fraud",
    rows: CREDIT_FRAUD_DATA,
  },
];

export function getWorkbenchDataset(id: string): WorkbenchDatasetRecord {
  const found = AVAILABLE_WORKBENCH_DATASETS.find((d) => d.id === id);
  if (!found) {
    throw new Error(`Unknown dataset id: ${id}`);
  }
  return found;
}
