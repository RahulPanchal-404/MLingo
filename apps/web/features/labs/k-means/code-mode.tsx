import type { TrainingState } from "@/types/training-run";

export function getKMeansCodeLines(state: TrainingState | null): string[] {
  const inertiaVal = state?.inertia ?? state?.loss;
  const movement = state?.centroid_movement?.reduce((sum, val) => sum + val, 0);

  return [
    "# 1. Calculate pairwise distance from each point to each centroid",
    "distances = np.linalg.norm(points[:, None, :] - centroids[None, :, :], axis=2)",
    "# 2. Assign each point to its nearest centroid",
    "assignments = np.argmin(distances, axis=1)",
    "# 3. Update centroids to the cluster mean",
    "for k in range(k_clusters):",
    "    centroids[k] = points[assignments == k].mean(axis=0)",
    `# recorded inertia = ${format(inertiaVal)}, centroid movement = ${format(movement)}`,
  ];
}

export function KMeansCodeMode({ state }: { state: TrainingState | null }) {
  return (
    <section aria-label="K-Means code mode" className="learning-mode-panel code-mode-panel">
      <div className="learning-mode-heading">
        <div>
          <p className="eyebrow">Code mode / K-Means</p>
          <h2>Conceptual iteration update</h2>
        </div>
        <span>{state ? `Step ${state.step}` : "No frame"}</span>
      </div>
      <pre aria-label="Conceptual Python K-Means update">
        <code>{getKMeansCodeLines(state).join("\n")}</code>
      </pre>
      <p className="learning-mode-note">
        This conceptual Python represents the standard Lloyd&apos;s algorithm iteration executed on the recorded dataset.
      </p>
    </section>
  );
}

function format(value: number | null | undefined, digits = 4): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : "N/A";
}
