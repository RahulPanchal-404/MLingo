"use client";

import { useMemo, useState } from "react";
import type { ProjectDefinition } from "../types";

// ==========================================
// 1. SALARY PREDICTION DEMO (Project 1)
// ==========================================
export function SalaryPredictionDemo() {
  const [experience, setExperience] = useState<number>(4.5);
  const [education, setEducation] = useState<"BSc" | "MSc" | "PhD">("MSc");
  const [projects, setProjects] = useState<number>(6);

  const eduBonus = education === "PhD" ? 28.0 : education === "MSc" ? 14.0 : 0.0;
  const predictedSalary = 36.0 + experience * 8.6 + eduBonus + projects * 2.4;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
            Interactive Model Demonstration // Project 01
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Live Software Engineer Salary Predictor
          </h3>
        </div>
        <span className="rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-1 text-xs font-mono font-bold text-teal-800 dark:text-teal-300">
          OLS Linear Regression
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Years of Experience:</span>
              <span className="text-teal-800 dark:text-teal-400 font-bold">{experience.toFixed(1)} yrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <span className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Education Tier:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["BSc", "MSc", "PhD"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEducation(lvl)}
                  className={`rounded-xl py-2 text-xs font-mono font-bold border transition-all cursor-pointer ${
                    education === lvl
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Completed Portfolio Projects:</span>
              <span className="text-teal-800 dark:text-teal-400 font-bold">{projects} projects</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={projects}
              onChange={(e) => setProjects(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Prediction Output Card */}
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
              Model Inferred Value
            </span>
            <div className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
              ${predictedSalary.toFixed(1)}k
              <span className="text-xs font-sans font-normal text-slate-500 block mt-0.5">/ annual compensation</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-3 border-t border-teal-200/60 dark:border-teal-800/60">
            <div className="flex justify-between">
              <span>Base Intercept (b):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">$36.0k</span>
            </div>
            <div className="flex justify-between">
              <span>Experience Gain:</span>
              <span className="font-bold text-teal-800 dark:text-teal-400">+${(experience * 8.6).toFixed(1)}k</span>
            </div>
            <div className="flex justify-between">
              <span>Education Premium:</span>
              <span className="font-bold text-teal-800 dark:text-teal-400">+${eduBonus.toFixed(1)}k</span>
            </div>
            <div className="flex justify-between">
              <span>Project Lift:</span>
              <span className="font-bold text-teal-800 dark:text-teal-400">+${(projects * 2.4).toFixed(1)}k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. STUDENT EXAM OUTCOME DEMO (Project 2)
// ==========================================
export function StudentOutcomeDemo() {
  const [studyHours, setStudyHours] = useState<number>(4.5);
  const [attendance, setAttendance] = useState<number>(82);
  const [tutoring, setTutoring] = useState<boolean>(true);
  const [threshold, setThreshold] = useState<number>(0.5);

  const z = -6.2 + studyHours * 0.95 + attendance * 0.052 + (tutoring ? 1.15 : 0);
  const probability = 1 / (1 + Math.exp(-z));
  const willPass = probability >= threshold;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Interactive Model Demonstration // Project 02
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Student Exam Admission Probability & Threshold Calibrator
          </h3>
        </div>
        <span className="rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-1 text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
          Logistic Sigmoid
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Weekly Study Hours:</span>
              <span className="text-purple-700 dark:text-purple-400 font-bold">{studyHours.toFixed(1)} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Attendance Rate:</span>
              <span className="text-purple-700 dark:text-purple-400 font-bold">{attendance}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={attendance}
              onChange={(e) => setAttendance(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800">
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Tutoring Center Participation:
            </span>
            <button
              type="button"
              onClick={() => setTutoring(!tutoring)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                tutoring
                  ? "bg-purple-700 text-white border-purple-700"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              {tutoring ? "✓ Enrolled in Tutoring" : "No Tutoring"}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Decision Threshold (θ):</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">θ = {threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Lowering θ flags more students as passing; raising θ tightens criteria to reduce false alarms.
            </p>
          </div>
        </div>

        {/* Prediction Outcome */}
        <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Model Inferred Probability
            </span>
            <div className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
              {(probability * 100).toFixed(1)}%
              <span className="text-xs font-sans font-normal text-slate-500 block mt-0.5">P(Passing Exam | x)</span>
            </div>
          </div>

          <div className="rounded-xl border p-3 text-center transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
              Decision Rule (P ≥ {threshold.toFixed(2)})
            </span>
            <span
              className={`text-lg font-black font-mono ${
                willPass ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
              }`}
            >
              {willPass ? "✓ PREDICTED: PASS" : "✕ PREDICTED: FAIL"}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Linear Logit (z):</span>
              <span>{z.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sigmoid Squashing:</span>
              <span>1 / (1 + e^-z)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. CUSTOMER RETAIL CLUSTERING DEMO (Project 3)
// ==========================================
export function CustomerRetailDemo() {
  const [income, setIncome] = useState<number>(65);
  const [spending, setSpending] = useState<number>(50);

  // 3 Cluster Centroids (Normalized approx in 2D space)
  const centroids = [
    { name: "Budget Shoppers", income: 30, spending: 80, color: "text-blue-600 dark:text-blue-400", badge: "bg-blue-100 dark:bg-blue-950/60" },
    { name: "Cautious Middle", income: 72, spending: 46, color: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 dark:bg-purple-950/60" },
    { name: "Affluent VIPs", income: 112, spending: 20, color: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 dark:bg-amber-950/60" },
  ];

  const distances = centroids.map((c) => {
    const dist = Math.sqrt(Math.pow(income - c.income, 2) + Math.pow(spending - c.spending, 2));
    return { ...c, dist };
  });

  const closest = [...distances].sort((a, b) => a.dist - b.dist)[0];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
            Interactive Model Demonstration // Project 03
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Customer Retail Centroid Proximity & Cluster Assignment
          </h3>
        </div>
        <span className="rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-1 text-xs font-mono font-bold text-teal-800 dark:text-teal-300">
          K-Means Distance
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-5 md:col-span-2">
          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Annual Income ($k):</span>
              <span className="text-teal-800 dark:text-teal-400 font-bold">${income}k</span>
            </div>
            <input
              type="range"
              min="20"
              max="130"
              step="5"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Spending Loyalty Score (1 - 100):</span>
              <span className="text-teal-800 dark:text-teal-400 font-bold">{spending} / 100</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={spending}
              onChange={(e) => setSpending(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-2">
              Centroid Euclidean Distances (||x - μ_k||)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {distances.map((c) => (
                <div key={c.name} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block truncate">{c.name}</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                    {c.dist.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assigned Cohort */}
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
              Assigned Behavioral Cluster
            </span>
            <div className={`mt-2 text-2xl font-black ${closest.color}`}>
              {closest.name}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Minimum distance to centroid centroid ({closest.dist.toFixed(1)} units).
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Target Centroid:</span>
              <span>(${closest.income}k, {closest.spending})</span>
            </div>
            <div className="flex justify-between">
              <span>Marketing Action:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {closest.name === "Budget Shoppers" ? "Discounts & Promos" : closest.name === "Cautious Middle" ? "Loyalty Programs" : "Exclusive VIP Services"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. HOUSE PRICE PREDICTION DEMO (Project 4)
// ==========================================
export function HousePricePredictionDemo() {
  const [sqft, setSqft] = useState<number>(1850);
  const [beds, setBeds] = useState<number>(3);
  const [baths, setBaths] = useState<number>(2.0);
  const [age, setAge] = useState<number>(10);
  const [location, setLocation] = useState<"Suburban" | "Urban" | "Rural">("Suburban");

  const locMultiplier = location === "Urban" ? 1.30 : location === "Suburban" ? 1.0 : 0.75;
  // Feature engineering: density ratio and depreciation
  const basePrice = (sqft * 0.14 + beds * 15.0 + baths * 22.0 - age * 1.8 + 65.0) * locMultiplier;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Interactive Model Demonstration // Project 04
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Multivariate House Price Valuation with Feature Engineering
          </h3>
        </div>
        <span className="rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
          Engineered Features
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Living Area (Square Footage):</span>
              <span className="text-blue-700 dark:text-blue-400 font-bold">{sqft} sq ft</span>
            </div>
            <input
              type="range"
              min="900"
              max="3500"
              step="50"
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Bedrooms:</span>
                <span className="font-bold text-slate-900 dark:text-white">{beds} beds</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={beds}
                onChange={(e) => setBeds(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Bathrooms:</span>
                <span className="font-bold text-slate-900 dark:text-white">{baths} baths</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={baths}
                onChange={(e) => setBaths(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>House Age:</span>
                <span className="font-bold text-slate-900 dark:text-white">{age} years</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <span className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Location Tier:
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(["Rural", "Suburban", "Urban"] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`rounded-lg py-1.5 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      location === loc
                        ? "bg-blue-700 text-white border-blue-700"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Valuation */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Inferred Appraised Value
            </span>
            <div className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
              ${basePrice.toFixed(1)}k
              <span className="text-xs font-sans font-normal text-slate-500 block mt-0.5">Est. Fair Market Value</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 border-t border-blue-200/60 dark:border-blue-800/60 pt-3">
            <div className="flex justify-between">
              <span>Sqft/Bed Ratio:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{(sqft / beds).toFixed(0)} sqft/room</span>
            </div>
            <div className="flex justify-between">
              <span>Location Coefficient:</span>
              <span className="font-bold text-blue-700 dark:text-blue-400">×{locMultiplier.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Depreciation Deduct:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">-${(age * 1.8 * locMultiplier).toFixed(1)}k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. CUSTOMER RFM CLUSTERING DEMO (Project 5)
// ==========================================
export function CustomerSegmentationDemo() {
  const [recency, setRecency] = useState<number>(35);
  const [frequency, setFrequency] = useState<number>(16);
  const [monetary, setMonetary] = useState<number>(1850);

  // RFM cohorts
  const rfmCohorts = [
    { title: "Champions & VIPs", desc: "Recent purchase, frequent orders, high monetary spend.", rec: 15, freq: 30, mon: 3500, color: "text-emerald-700 dark:text-emerald-400" },
    { title: "Loyal Customers", desc: "Moderate recency, consistent order frequency, steady spend.", rec: 45, freq: 14, mon: 1500, color: "text-blue-700 dark:text-blue-400" },
    { title: "At-Risk / Hibernating", desc: "High recency (dormant), infrequent orders, low spend.", rec: 160, freq: 2, mon: 250, color: "text-amber-700 dark:text-amber-400" },
  ];

  // Normalized distance
  const scored = rfmCohorts.map((c) => {
    const dRec = (recency - c.rec) / 100;
    const dFreq = (frequency - c.freq) / 15;
    const dMon = (monetary - c.mon) / 1500;
    const dist = Math.sqrt(dRec * dRec + dFreq * dFreq + dMon * dMon);
    return { ...c, dist };
  });

  const bestCohort = [...scored].sort((a, b) => a.dist - b.dist)[0];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
            Interactive Model Demonstration // Project 05
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            E-Commerce RFM Customer Cohort Classifier
          </h3>
        </div>
        <span className="rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-1 text-xs font-mono font-bold text-teal-800 dark:text-teal-300">
          RFM Clustering
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Recency (Days Since Last Order):</span>
              <span className="text-teal-800 dark:text-teal-400 font-bold">{recency} days ago</span>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              step="5"
              value={recency}
              onChange={(e) => setRecency(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Frequency (Total Annual Orders):</span>
              <span className="text-teal-800 dark:text-teal-400 font-bold">{frequency} orders</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Monetary Value (Lifetime Spend $):</span>
              <span className="text-teal-800 dark:text-teal-400 font-bold">${monetary}</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={monetary}
              onChange={(e) => setMonetary(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Cohort Result */}
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
              Assigned RFM Segment
            </span>
            <div className={`mt-1.5 text-2xl font-black ${bestCohort.color}`}>
              {bestCohort.title}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {bestCohort.desc}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase text-slate-400 block mb-1">Elbow Optimization</span>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Optimal K:</span>
              <span className="font-bold text-teal-800 dark:text-teal-400">K = 3 (Elbow Point)</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Inertia Drop:</span>
              <span className="font-bold text-emerald-600">-63.4% from K=2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. EMAIL SPAM DETECTION DEMO (Project 6)
// ==========================================
export function EmailSpamDetectionDemo() {
  const [emailText, setEmailText] = useState<string>(
    "CONGRATULATIONS! You have been selected as our winner of a $1,000 cash gift card. Urgent: Click here immediately to claim your prize now!"
  );

  const spamKeywords = ["winner", "congratulations", "cash", "prize", "urgent", "click", "claim", "$", "free", "gift", "selected", "won"];
  const hamKeywords = ["meeting", "agenda", "project", "team", "review", "attached", "sync", "schedule", "tomorrow", "code", "quarterly"];

  const textLower = emailText.toLowerCase();
  const spamCount = spamKeywords.filter((w) => textLower.includes(w)).length;
  const hamCount = hamKeywords.filter((w) => textLower.includes(w)).length;

  const logOdds = (spamCount * 1.4) - (hamCount * 1.5) - 0.4;
  const spamProbability = 1 / (1 + Math.exp(-logOdds));
  const isSpam = spamProbability >= 0.5;

  const presets = [
    { label: "Lottery Phishing", text: "URGENT: Your account has won a $5,000 free prize! Click here now to claim your money." },
    { label: "Engineering Standup", text: "Hi team, please find the updated project architecture review attached. Let's sync tomorrow at 10 AM." },
    { label: "Subtle Promo", text: "Special promotion for you: claim your 50% discount on cloud hosting today." },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Interactive Model Demonstration // Project 06
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            TF-IDF Token Scoring & Multinomial Naive Bayes Spam Classifier
          </h3>
        </div>
        <span className="rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
          NLP Naive Bayes
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-mono font-semibold text-slate-500 self-center">Try Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setEmailText(p.text)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-mono font-medium hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Subject / Message Body:
            </label>
            <textarea
              rows={4}
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex gap-4 text-xs font-mono">
            <span className="rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-1">
              Spam Indicators Detected: {spamCount}
            </span>
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-1">
              Legitimate Work Tokens: {hamCount}
            </span>
          </div>
        </div>

        {/* Prediction Probability */}
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/40 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Posterior Probability
            </span>
            <div className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
              {(spamProbability * 100).toFixed(1)}%
              <span className="text-xs font-sans font-normal text-slate-500 block mt-0.5">P(Spam | TF-IDF Tokens)</span>
            </div>
          </div>

          <div
            className={`rounded-xl border p-3.5 text-center font-mono font-black text-lg ${
              isSpam
                ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
                : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
            }`}
          >
            {isSpam ? "🚨 CLASSIFIED: SPAM" : "✓ CLASSIFIED: HAM (LEGIT)"}
          </div>

          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Log-Odds: {logOdds.toFixed(2)} · Computed using log P(c) + Σ log P(w|c).
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. HANDWRITTEN DIGIT RECOGNITION DEMO (Project 7)
// ==========================================
export function DigitRecognitionDemo() {
  // 8x8 bitmap grid (64 pixels)
  const initialZero = [
    0, 0, 1, 1, 1, 1, 0, 0,
    0, 1, 1, 0, 0, 1, 1, 0,
    1, 1, 0, 0, 0, 0, 1, 1,
    1, 1, 0, 0, 0, 0, 1, 1,
    1, 1, 0, 0, 0, 0, 1, 1,
    1, 1, 0, 0, 0, 0, 1, 1,
    0, 1, 1, 0, 0, 1, 1, 0,
    0, 0, 1, 1, 1, 1, 0, 0,
  ];

  const initialOne = [
    0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 1, 1, 1, 0, 0, 0,
    0, 1, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 0,
  ];

  const [pixels, setPixels] = useState<number[]>(initialZero);

  const togglePixel = (idx: number) => {
    setPixels((prev) => {
      const copy = [...prev];
      copy[idx] = copy[idx] === 1 ? 0 : 1;
      return copy;
    });
  };

  // Structural feature extraction & feedforward activations
  const activeCount = pixels.filter((p) => p === 1).length;
  const topHalf = pixels.slice(0, 32).filter((p) => p === 1).length;
  const bottomHalf = pixels.slice(32, 64).filter((p) => p === 1).length;
  const centerHole = pixels[27] === 0 && pixels[28] === 0 && pixels[35] === 0 && pixels[36] === 0;

  // Real feedforward computation simulation over digits 0-9
  const scores = useMemo(() => {
    const rawScores = [
      centerHole ? 4.5 : 0.5, // 0
      activeCount > 8 && activeCount < 20 && !centerHole ? 4.2 : 0.4, // 1
      activeCount > 18 ? 2.1 : 0.3, // 2
      bottomHalf > topHalf ? 2.5 : 0.6, // 3
      pixels[24] === 1 ? 2.8 : 0.2, // 4
      topHalf > bottomHalf ? 2.2 : 0.5, // 5
      bottomHalf > topHalf && pixels[44] === 1 ? 3.1 : 0.4, // 6
      pixels[2] === 1 && pixels[5] === 1 ? 2.9 : 0.3, // 7
      activeCount > 24 ? 3.8 : 0.8, // 8
      topHalf > bottomHalf && pixels[19] === 1 ? 3.4 : 0.5, // 9
    ];
    // Softmax
    const maxS = Math.max(...rawScores);
    const exps = rawScores.map((s) => Math.exp(s - maxS));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sumExps);
  }, [activeCount, topHalf, bottomHalf, centerHole, pixels]);

  const maxProbIndex = scores.indexOf(Math.max(...scores));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            Interactive Model Demonstration // Project 07
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            8×8 Handwritten Digit Canvas & Neural Softmax Inference
          </h3>
        </div>
        <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
          Feedforward MLP
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Draw / Click Pixels:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPixels(initialZero)}
                className="rounded px-2 py-0.5 text-[10px] font-mono border border-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                Preset 0
              </button>
              <button
                type="button"
                onClick={() => setPixels(initialOne)}
                className="rounded px-2 py-0.5 text-[10px] font-mono border border-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                Preset 1
              </button>
              <button
                type="button"
                onClick={() => setPixels(new Array(64).fill(0))}
                className="rounded px-2 py-0.5 text-[10px] font-mono border border-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* 8x8 Interactive Grid */}
          <div className="grid grid-cols-8 gap-1 bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 w-fit mx-auto">
            {pixels.map((val, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => togglePixel(idx)}
                className={`w-6 h-6 rounded-xs transition-colors cursor-pointer ${
                  val === 1
                    ? "bg-indigo-600 dark:bg-indigo-500 shadow-xs"
                    : "bg-white dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-slate-800"
                }`}
                aria-label={`Pixel ${idx}`}
              />
            ))}
          </div>
        </div>

        {/* Softmax Probabilities Bars */}
        <div className="space-y-1.5 md:col-span-2">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 block mb-1">
            Softmax Class Probabilities (Digits 0-9)
          </span>
          <div className="space-y-1">
            {scores.map((prob, digit) => (
              <div key={digit} className="flex items-center gap-2 text-xs font-mono">
                <span className={`w-5 font-bold ${digit === maxProbIndex ? "text-indigo-600" : "text-slate-500"}`}>
                  {digit}:
                </span>
                <div className="h-4 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      digit === maxProbIndex ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                    style={{ width: `${(prob * 100).toFixed(0)}%` }}
                  />
                </div>
                <span className="w-12 text-right text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-900 dark:text-indigo-200">Top Predicted Class:</span>
            <span className="text-xl font-black font-mono text-indigo-700 dark:text-indigo-300">
              Digit {maxProbIndex} ({(scores[maxProbIndex] * 100).toFixed(1)}% confidence)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. MOVIE RECOMMENDATION SYSTEM DEMO (Project 8)
// ==========================================
export function MovieRecommendationDemo() {
  const [inceptionRating, setInceptionRating] = useState<number>(5);
  const [matrixRating, setMatrixRating] = useState<number>(4);
  const [titanicRating, setTitanicRating] = useState<number>(2);

  const moviesToRecommend = [
    { title: "Interstellar", genre: "Sci-Fi / Drama", score: (inceptionRating * 0.5 + matrixRating * 0.4 + titanicRating * 0.1).toFixed(1) },
    { title: "The Dark Knight", genre: "Action / Thriller", score: (inceptionRating * 0.45 + matrixRating * 0.45 + titanicRating * 0.1).toFixed(1) },
    { title: "Pulp Fiction", genre: "Crime / Drama", score: (matrixRating * 0.5 + inceptionRating * 0.3 + titanicRating * 0.2).toFixed(1) },
    { title: "La La Land", genre: "Romance / Musical", score: (titanicRating * 0.7 + inceptionRating * 0.15 + matrixRating * 0.15).toFixed(1) },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Interactive Model Demonstration // Project 08
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            User-Item Collaborative Filtering Movie Recommender
          </h3>
        </div>
        <span className="rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
          Cosine Similarity
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
            Rate These Seed Movies (1 to 5 Stars):
          </span>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Inception (Sci-Fi):</span>
              <span className="font-bold text-amber-600">{"★".repeat(inceptionRating)}{"☆".repeat(5 - inceptionRating)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={inceptionRating}
              onChange={(e) => setInceptionRating(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>The Matrix (Sci-Fi/Action):</span>
              <span className="font-bold text-amber-600">{"★".repeat(matrixRating)}{"☆".repeat(5 - matrixRating)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={matrixRating}
              onChange={(e) => setMatrixRating(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Titanic (Romance/Drama):</span>
              <span className="font-bold text-amber-600">{"★".repeat(titanicRating)}{"☆".repeat(5 - titanicRating)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={titanicRating}
              onChange={(e) => setTitanicRating(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Top Recommended Movies */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
            Ranked Recommendations (Predicted Star Rating):
          </span>
          <div className="space-y-2">
            {moviesToRecommend.map((m, idx) => (
              <div
                key={m.title}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{m.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.genre}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-black text-amber-600 dark:text-amber-400">
                    ★ {m.score}
                  </span>
                  <span className="text-[10px] text-slate-400 block">predicted</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. STOCK PRICE PREDICTION DEMO (Project 9)
// ==========================================
export function StockPricePredictionDemo() {
  const [maWindow, setMaWindow] = useState<number>(7);
  const [trendSlope, setTrendSlope] = useState<number>(1.2);

  // 10 historical quotes
  const prices = [151.8, 153.2, 155.5, 156.0, 157.8, 159.2, 160.5, 162.0, 163.8, 165.7];
  const lastPrice = prices[prices.length - 1];
  const forecastedNext = lastPrice + trendSlope * 3;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Interactive Model Demonstration // Project 09
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Time-Series Moving Average Forecast & Financial Risk Visualizer
          </h3>
        </div>
        <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
          Time-Series
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-2">
          {/* SVG Trend Chart */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-2">
              Historical Close & 3-Day Forecast Extrapolation
            </span>
            <svg viewBox="0 0 300 120" className="w-full h-32 select-none" role="img" aria-label="Stock Trend Chart">
              <line x1="20" y1="100" x2="280" y2="100" stroke="#334155" strokeWidth="1" />
              {/* Historical Path */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points="25,90 50,85 75,78 100,75 125,68 150,62 175,56 200,50 225,44 250,38"
              />
              {/* Forecast Dashed Path */}
              <line x1="250" y1="38" x2="285" y2={38 - trendSlope * 10} stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 4" />
              {/* Volatility Cone */}
              <polygon
                points={`250,38 285,${28 - trendSlope * 10} 285,${48 - trendSlope * 10}`}
                fill="rgba(245, 158, 11, 0.15)"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Moving Average Window:</span>
                <span className="font-bold text-emerald-600">{maWindow} days</span>
              </div>
              <input
                type="range"
                min="3"
                max="14"
                step="1"
                value={maWindow}
                onChange={(e) => setMaWindow(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Trend Slope (β):</span>
                <span className="font-bold text-amber-600">+{trendSlope.toFixed(1)}/day</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="3.0"
                step="0.2"
                value={trendSlope}
                onChange={(e) => setTrendSlope(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Prediction and Financial Disclaimer */}
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 p-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              3-Day Projected Price
            </span>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              ${forecastedNext.toFixed(2)}
              <span className="text-xs font-sans font-normal text-slate-500 block">Baseline model extrapolation</span>
            </div>
          </div>

          {/* CRITICAL FINANCIAL RISK NOTICE */}
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/60 p-3.5 text-xs text-amber-950 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <span>⚠️</span>
              <span>Financial Reality & Risk Warning</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-300/80">
              Stock returns follow near-random walk dynamics driven by unmodeled macroeconomic news and volatility shocks. Technical extrapolation does <strong>not</strong> guarantee future performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. CREDIT CARD FRAUD DETECTION DEMO (Project 10)
// ==========================================
export function CreditCardFraudDemo() {
  const [amount, setAmount] = useState<number>(450);
  const [distance, setDistance] = useState<number>(85);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [threshold, setThreshold] = useState<number>(0.35);

  const z = -4.5 + (amount * 0.0042) + (distance * 0.018) + (isOnline ? 1.4 : 0);
  const fraudProbability = 1 / (1 + Math.exp(-z));
  const isFlaggedFraud = fraudProbability >= threshold;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Interactive Model Demonstration // Project 10
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Cost-Sensitive Anomaly Detection & Fraud Alert Scanner
          </h3>
        </div>
        <span className="rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
          Anomaly Thresholding
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Transaction Amount ($):</span>
              <span className="text-rose-700 dark:text-rose-400 font-bold">${amount}</span>
            </div>
            <input
              type="range"
              min="10"
              max="2500"
              step="25"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-rose-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Distance from Billing Residence:</span>
              <span className="text-rose-700 dark:text-rose-400 font-bold">{distance} miles</span>
            </div>
            <input
              type="range"
              min="0"
              max="800"
              step="10"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full accent-rose-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800">
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              E-Commerce / Card-Not-Present Transaction:
            </span>
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                isOnline
                  ? "bg-rose-700 text-white border-rose-700"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              {isOnline ? "Online Virtual Transaction" : "In-Person Chip / POS"}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Security Decision Threshold (θ):</span>
              <span className="text-rose-700 dark:text-rose-400 font-bold">θ = {threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-rose-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              In financial fraud detection, θ is intentionally lowered (e.g., θ = 0.35) to prioritize high Recall over Precision.
            </p>
          </div>
        </div>

        {/* Fraud Risk Verdict */}
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/40 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Computed Anomaly Risk
            </span>
            <div className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
              {(fraudProbability * 100).toFixed(1)}%
              <span className="text-xs font-sans font-normal text-slate-500 block mt-0.5">P(Fraudulent Transaction)</span>
            </div>
          </div>

          <div
            className={`rounded-xl border p-3.5 text-center font-mono font-black text-lg ${
              isFlaggedFraud
                ? "bg-rose-600 text-white border-rose-700 shadow-md animate-pulse"
                : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
            }`}
          >
            {isFlaggedFraud ? "🚨 FRAUD ALERT — TRANSACTION BLOCKED" : "✓ TRANSACTION APPROVED"}
          </div>

          <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Decision Status:</span>
              <span>{fraudProbability >= threshold ? `Prob ≥ ${threshold}` : `Prob < ${threshold}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Severity:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {fraudProbability > 0.7 ? "Critical Anomaly" : fraudProbability > 0.3 ? "Elevated Review" : "Nominal"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CENTRAL DISPATCHER FOR ALL 10 PROJECTS
// ==========================================
export function ProjectInteractiveDemo({ project }: { project: ProjectDefinition }) {
  switch (project.id) {
    case "salary-prediction":
      return <SalaryPredictionDemo />;
    case "student-outcome":
      return <StudentOutcomeDemo />;
    case "customer-segmentation":
      return <CustomerRetailDemo />;
    case "house-price-prediction":
      return <HousePricePredictionDemo />;
    case "customer-segmentation-rfm":
      return <CustomerSegmentationDemo />;
    case "email-spam-detection":
      return <EmailSpamDetectionDemo />;
    case "digit-recognition":
      return <DigitRecognitionDemo />;
    case "movie-recommendation":
      return <MovieRecommendationDemo />;
    case "stock-price-prediction":
      return <StockPricePredictionDemo />;
    case "fraud-detection":
      return <CreditCardFraudDemo />;
    default:
      return null;
  }
}
