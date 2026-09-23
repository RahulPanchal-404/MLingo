import type { TrainingState } from "@/types/training-run";

export function KMeansMathMode({ state }: { state: TrainingState | null }) {
  if (!state) {
    return (
      <section className="learning-mode-panel">
        <p className="eyebrow">Math mode</p>
        <p className="empty-state">Select a recorded frame to inspect its mathematics.</p>
      </section>
    );
  }

  const centroids = state.centroids ?? [];
  const movement = state.centroid_movement?.reduce((sum, val) => sum + val, 0) ?? 0;
  const inertiaVal = state.inertia ?? state.loss;

  return (
    <section id="math-mode-panel" aria-label="K-Means math mode" className="learning-mode-panel">
      <div className="learning-mode-heading">
        <div>
          <p className="eyebrow">Math mode / K-Means</p>
          <h2>Selected frame mathematics</h2>
        </div>
        <span>Step {state.step}</span>
      </div>

      {/* Beginner Intuition Helpers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-2.5">
          <span className="font-bold text-teal-900 block mb-0.5">Centroid:</span>
          <span className="text-slate-600">A centroid is the current center of a cluster.</span>
        </div>
        <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-2.5">
          <span className="font-bold text-teal-900 block mb-0.5">Inertia (Distortion):</span>
          <span className="text-slate-600">Inertia measures how far points are from their assigned cluster centers. Lower usually means tighter clusters.</span>
        </div>
      </div>

      <div className="equation-list">
        <p>
          <code>c⁽ⁱ⁾ = argminⱼ ‖x⁽ⁱ⁾ - μⱼ‖²</code>
          <span>Cluster assignment</span>
        </p>
        <p>
          <code>μⱼ = (1 / |Cⱼ|) Σ_{"{i∈Cⱼ}"} x⁽ⁱ⁾</code>
          <span>Centroid update</span>
        </p>
        <p>
          <code>J = Σᵢ ‖x⁽ⁱ⁾ - μ_{"{c⁽ⁱ⁾}"}‖²</code>
          <span>Inertia / distortion</span>
        </p>
      </div>

      <dl className="math-values">
        <div>
          <dt>Clusters</dt>
          <dd>{centroids.length}</dd>
        </div>
        <div>
          <dt>Inertia</dt>
          <dd>{format(inertiaVal)}</dd>
        </div>
        <div>
          <dt>Centroid movement</dt>
          <dd>{state.step === 0 ? "Initial" : format(movement)}</dd>
        </div>
        {centroids.map((centroid, index) => (
          <div key={`centroid-math-${index}`}>
            <dt>μ_{index + 1} (x, y)</dt>
            <dd>({format(centroid[0], 2)}, {format(centroid[1], 2)})</dd>
          </div>
        ))}
      </dl>
      <p className="learning-mode-note">
        {state.step === 0
          ? "Initial cluster centroids were sampled prior to the first assignment iteration."
          : `At iteration ${state.step}, centroids shifted by a combined displacement of ${format(movement)}.`}
      </p>
    </section>
  );
}

function format(value: number | null | undefined, digits = 4): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : "N/A";
}
