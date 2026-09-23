"use client";

import Link from "next/link";
import { useState } from "react";
import type { LessonDefinition } from "../lessons-data";

export function LessonLayout({ lesson }: { lesson: LessonDefinition }) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  const selectedOption = selectedOptionIndex !== null && lesson.thinkPrompt
    ? lesson.thinkPrompt.options[selectedOptionIndex]
    : null;

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Navigation Bar */}
      <nav aria-label="Curriculum breadcrumb" className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span>← Back to Curriculum</span>
        </Link>
        <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-full px-3 py-0.5">
          {lesson.tag}
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 font-semibold text-slate-700">
            {lesson.difficulty}
          </span>
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-slate-600">
            ⏱️ {lesson.estimatedMinutes} min read & practice
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight">
          {lesson.title}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          {lesson.subtitle}
        </p>

        {lesson.prerequisites && (
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Prerequisites: </span>
            {lesson.prerequisites}
          </div>
        )}
      </header>

      {/* Key Idea Callout Box */}
      <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/80 to-white p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
            Key Idea
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-900 leading-relaxed">
          {lesson.keyIdea}
        </p>
      </section>

      {/* 1. What Am I Learning? */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>🎯</span> What am I learning?
        </h2>
        <ul className="space-y-2.5">
          {lesson.whatAmILearning.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
                {idx + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Visual / Concept Intuition */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🔬</span> Concept Intuition: {lesson.visual.title}
          </h2>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {lesson.visual.type}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {lesson.visual.items.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 space-y-1.5 ${
                item.highlight
                  ? "border-teal-300 bg-teal-50/60 ring-1 ring-teal-200"
                  : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <span className={`text-xs font-bold block ${item.highlight ? "text-teal-950" : "text-slate-800"}`}>
                {item.label}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Why Does It Matter? */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>🌍</span> Why does it matter?
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {lesson.whyItMatters}
        </p>
      </section>

      {/* 4. Concrete Example */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📐</span> Concrete Example: {lesson.concreteExample.context}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Input</span>
            <p className="font-mono text-slate-800">{lesson.concreteExample.input}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Model Prediction</span>
            <p className="font-mono text-slate-800">{lesson.concreteExample.prediction}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">True Target</span>
            <p className="font-mono text-slate-800">{lesson.concreteExample.target}</p>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Learning Insight</span>
            <p className="text-teal-950">{lesson.concreteExample.errorNote}</p>
          </div>
        </div>
      </section>

      {/* 5. Think Before You Continue (Checkpoint) */}
      {lesson.thinkPrompt && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-700 text-xs text-white">
              ?
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Think Before You Continue
            </h2>
          </div>

          <p className="text-xs text-slate-700 font-medium">
            {lesson.thinkPrompt.question}
          </p>

          <div className="space-y-2">
            {lesson.thinkPrompt.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedOptionIndex(idx)}
                  className={`w-full text-left rounded-xl border p-3 text-xs transition-all cursor-pointer ${
                    isSelected
                      ? opt.correct
                        ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium"
                        : "border-amber-400 bg-amber-50/80 text-amber-950 font-medium"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        isSelected
                          ? opt.correct
                            ? "border-emerald-600 bg-emerald-600 text-white font-bold"
                            : "border-amber-600 bg-amber-600 text-white font-bold"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected ? (opt.correct ? "✓" : "!") : ""}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div
              className={`rounded-xl border p-3 text-xs animate-in fade-in-50 duration-200 ${
                selectedOption.correct
                  ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                  : "border-amber-200 bg-amber-50/60 text-amber-900"
              }`}
            >
              <span className="font-bold mr-1">
                {selectedOption.correct ? "Correct:" : "Review:"}
              </span>
              {selectedOption.feedback}
            </div>
          )}
        </section>
      )}

      {/* 6. Now Try It Action Card */}
      <section className="rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Hands-On Practice
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {lesson.nowTryIt.headline}
            </h2>
          </div>

          <Link
            href={lesson.nowTryIt.href}
            className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition-colors shrink-0"
          >
            {lesson.nowTryIt.buttonLabel}
          </Link>
        </div>

        <div className="rounded-xl border border-teal-200 bg-white/90 p-4 space-y-2">
          <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block">
            What to observe in the lab:
          </span>
          <ul className="space-y-1.5">
            {lesson.nowTryIt.whatToObserve.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="text-teal-700 font-bold shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lesson Navigation Footer */}
      <footer className="flex items-center justify-between border-t border-slate-200 pt-6">
        {lesson.prevLesson ? (
          <Link
            href={`/learn/${lesson.prevLesson.slug}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← Previous: {lesson.prevLesson.title}
          </Link>
        ) : (
          <div />
        )}

        {lesson.nextLesson && (
          <Link
            href={`/learn/${lesson.nextLesson.slug}`}
            className="rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition-colors"
          >
            Next: {lesson.nextLesson.title} →
          </Link>
        )}
      </footer>
    </article>
  );
}
