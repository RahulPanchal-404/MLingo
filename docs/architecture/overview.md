# Architecture overview

MLingo is a small monorepo with independently runnable frontend and API applications.

```text
Next.js frontend
      ↓ HTTP (/api/v1)
FastAPI routes
      ↓
Services
      ↓
ML engine
      ↓
PostgreSQL database
```

## Current boundaries

- `apps/web` contains the Next.js shell. Components are split into `components/ui`, `components/layout`, and future feature folders. `NEXT_PUBLIC_API_URL` is the frontend's API boundary.
- `apps/api/app/api` contains versioned route modules. Route handlers validate HTTP input and delegate to `services`.
- `apps/api/app/services` contains application use cases. `schemas` define API data, `models` will contain persistence models, and `ml` will contain framework-independent machine-learning code.
- `app/core/config.py` owns environment configuration; `app/core/database.py` is the future home for SQLAlchemy engines and sessions. Routes must not own database configuration.

## TrainingRun, the replayable domain concept

A `TrainingRun` will represent a replayable execution, rather than just a final model. Its eventual shape includes an `id`, algorithm, dataset, configuration, total epochs, training history, metrics, timeline markers, and metadata.

The training pipeline emits snapshots to `history`; each snapshot contains parameters, loss, gradients, predictions, and algorithm-specific metrics. The frontend uses one selected frame to drive plots, state panels, math/code views, diagnostics, and the timeline. The current API returns runs for the active session; durable replay is a future limitation.

## Feature architecture

- **Algorithms:** each engine owns its dataset generation and update rules while returning the shared `TrainingRun` shape. Terminology remains algorithm-specific: MSE, Binary Cross-Entropy, and Inertia.
- **Timeline:** `useTrainingTimeline` owns the playhead, playback, stepping, reduced-motion behavior, and selected snapshot. Timeline markers are derived from diagnostics or added by the learner.
- **Diagnostics & Training Insights:** the analysis engine turns adjacent history snapshots into heuristic events. The pure deterministic Training Insights engine summarizes run behavior ("What this run suggests") across all algorithms and enables frame jumping via playhead navigation.
- **Comparison Insights:** A/B review provides neutral, factual metric and trajectory observations across runs without ranking, scoring, or subjective terminology.
- **Challenges:** Break Mode supplies a constrained experiment and evaluates the resulting diagnostic evidence. It does not reveal the target frame before the learner acts.
- **Learning Modes:** Math Mode and Code Mode are supported across all three algorithms (Linear Regression, Logistic Regression, and K-Means) to ground the current selected frame in mathematical formulas and conceptual implementation code.
