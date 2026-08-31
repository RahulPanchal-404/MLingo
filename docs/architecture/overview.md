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

## TrainingRun, a future first-class domain concept

A `TrainingRun` will represent a replayable execution, rather than just a final model. Its eventual shape includes an `id`, algorithm, dataset, configuration, total epochs, training history, metrics, timeline markers, and metadata.

The eventual training pipeline will emit snapshots to the training history and timeline markers. The API will expose those records, and the frontend will use them to synchronize model state, metrics, predictions, and visualizations while a learner scrubs a run. No training engine or timeline UI is implemented in this milestone.
