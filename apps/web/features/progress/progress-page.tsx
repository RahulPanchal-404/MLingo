"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { readLearningActivity, type LearningActivity } from "@/features/progress/activity";

const defaultActivity: LearningActivity = { labsExplored: 0, experimentsRun: 0, challengesCompleted: [], concepts: [] };

export function ProgressPage() {
      const [activity, setActivity] = useState(defaultActivity);
      useEffect(() => {
            const update = () => setActivity(readLearningActivity());
            update(); window.addEventListener("mlingo-activity-change", update); window.addEventListener("storage", update);
            return () => { window.removeEventListener("mlingo-activity-change", update); window.removeEventListener("storage", update); };
      }, []);
      return <section className="progress-page"><div className="workspace-heading"><div><p className="eyebrow">Learning memory / this browser</p><h1>Keep the thread.</h1><p>Only activity recorded during this session or in this browser appears here.</p></div><Link className="secondary-button" href="/learn">Open learning path</Link></div><div className="progress-overview"><div><span>Labs explored</span><strong>{activity.labsExplored}</strong></div><div><span>Experiments run</span><strong>{activity.experimentsRun}</strong></div><div><span>Parameter sweeps</span><strong>{activity.sweepsCompleted ?? 0}</strong></div><div><span>Saved experiments</span><strong>{activity.experimentsSaved ?? 0}</strong></div><div><span>Replayed runs</span><strong>{activity.experimentsReplayed ?? 0}</strong></div><div><span>Challenges completed</span><strong>{activity.challengesCompleted.length}</strong></div></div><section className="progress-section"><div><p className="eyebrow">Concepts encountered</p><h2>What your recorded runs have touched</h2></div>{activity.concepts.length > 0 ? <ul className="concept-list">{activity.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ul> : <p className="empty-state">Run a lab, experiment, or challenge to start building learning memory.</p>}</section><section className="progress-section"><p className="eyebrow">Continue learning</p><div className="continue-links"><Link href="/labs/gradient-descent">Return to the Gradient Descent Lab</Link><Link href="/challenges">Inspect a challenge</Link><Link href="/experiments">Build an experiment</Link></div></section></section>;
}