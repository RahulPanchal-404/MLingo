# MLingo — Machine Learning, Frame by Frame.

> **MLingo** is an interactive machine-learning laboratory and replay environment. Instead of treating model training as a black box that yields a static final metric, MLingo records the step-by-step history of training updates, enabling learners to scrub through exact parameter snapshots, inspect mathematical gradients, explore conceptual code, and diagnose training dynamics.

---

## The Core Problem

Traditional machine-learning education often follows a rigid pipeline: **Theory → Formula → Code → Final Result**. Learners frequently memorize formulas and high-level library calls (`model.fit()`), but develop little intuition for what actually happens inside an algorithm during optimization:
- How loss curves correlate with parameter movements.
- Why learning rates cause plateaus, oscillations, or divergence.
- How binary decision boundaries rotate and translate as sigmoid probabilities sharpen.
- How cluster centroids drift toward high-density regions until equilibrium is reached.

MLingo solves this by treating machine-learning training runs like footage in a video editor.

---

## The Killer Feature: The Training Timeline

In MLingo, a **TrainingRun** is a first-class, replayable historical recording rather than just a final model artifact. 

When the playhead is at **Step $t$**, every view on screen synchronizes strictly to that exact snapshot:
- **Visualizations**: The regression line, classification decision boundary, or cluster assignments reflect State $t$.
- **Loss / Metrics**: The playhead displays Mean Squared Error (MSE), Binary Cross-Entropy (BCE), Accuracy, or Inertia at State $t$.
- **Weights & Gradients**: Exact weight values and gradients before or at update $t$ are inspected.
- **Math Mode**: The underlying loss and update equations display with exact numerical substitutions for Step $t$.
- **Code Mode**: Conceptual Python/NumPy implementations reflect the exact values computed at Step $t$.
- **Diagnostics & Training Insights**: Real recorded anomalies (rapid loss decreases, oscillations, plateaus, divergence, near-convergence) are detected deterministically and jump directly to relevant frames.

---

## Supported Algorithms

1. **Linear Regression (Gradient Descent)**
   - Single-variable continuous regression with synthetic datasets.
   - Mean Squared Error (MSE) loss tracking.
   - Real-time parameter updates ($w \leftarrow w - \alpha \frac{\partial L}{\partial w}$, $b \leftarrow b - \alpha \frac{\partial L}{\partial b}$).
2. **Logistic Regression**
   - Two-dimensional planar binary classification.
   - Sigmoid probability mapping and Binary Cross-Entropy (BCE) loss.
   - Dynamic decision boundary plotting ($w_1 x_1 + w_2 x_2 + b = 0$) with division-by-zero protection.
3. **K-Means Clustering**
   - Unsupervised Lloyd's algorithm clustering in 2D space.
   - Iterative distance calculation, cluster assignment, and centroid re-centering.
   - Inertia minimization and centroid movement monitoring.

---

## Core Product Capabilities

- **Interactive Labs**: Dedicated, single-algorithm environments for deep exploration.
- **Model X-Ray**: Frame-by-frame inspection of weights, bias, gradients, parameter deltas, sample predictions, probabilities, and cluster distributions.
- **Experiment Explorer (Parameter Sweeps)**: Run several experiments, vary one parameter, and inspect how the training process changes. Supports sweeps over learning rate (Linear & Logistic Regression) and cluster count $k$ (K-Means), complete with parameter-vs-metric curves, overlaid training trajectories, and factual comparative insights.
- **Local Experiment History & Replay**: Save interesting runs to client-side storage, replay recordings frame by frame offline without re-running models on the backend, and compare multiple saved runs.
- **Training Insights**: Pure deterministic observations ("What this run suggests") derived from recorded run metrics and diagnostics, with single-click navigation to the referenced frame.
- **A/B Comparison Mode**: "Two experiments. One clock." Run two models side by side and scrub their histories with a shared synchronized playhead and factual, neutral difference analysis.
- **Break Mode Challenges**: Pedagogical challenges where learners intentionally provoke anomalies (instability, learning slowdown, divergence) and identify suspicious frames with timeline markers.
- **Algorithm-Aware Experiments Workspace**: Freely configure hyperparameters (learning rate, epochs, clusters, samples, noise, seed) across any supported algorithm.
- **Curriculum (Learn)**: Bite-sized foundations linking directly to interactive lab experiences.
- **Progress Tracking**: Session and browser-local tracking of labs explored, experiments executed, parameter sweeps completed, concepts touched, and challenges conquered.

---

## System Architecture & Tech Stack

```text
Next.js Frontend (React 19 / TypeScript / Tailwind CSS)
            ↓ HTTP / JSON (/api/v1)
FastAPI Backend (Python 3.13 / NumPy / Pydantic)
            ↓
ML Training Engines (Linear Regression, Logistic Regression, K-Means)
            ↓
Immutable TrainingRun History Snapshot (in-memory per session)
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons, Vitest.
- **Backend**: FastAPI, Python 3.13, NumPy, Pydantic v2, pytest.
- **Infrastructure**: Local Docker Compose for optional PostgreSQL persistence.

---

## Environment Configuration

### Frontend (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend (`apps/api/.env`)
```bash
MLINGO_APP_NAME="MLingo API"
MLINGO_APP_VERSION="0.1.0"
MLINGO_ENVIRONMENT="development"
MLINGO_FRONTEND_ORIGIN="http://localhost:3000"
MLINGO_DATABASE_URL="postgresql://mlingo:mlingo_dev_password@localhost:5432/mlingo"
```

---

## Local Development Setup

### 1. Backend Setup (FastAPI)
```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```
Verify backend health: `http://localhost:8000/api/v1/health`

### 2. Frontend Setup (Next.js)
```powershell
cd apps/web
npm install
npm run dev
```
Open application: `http://localhost:3000`

---

## Running Verification Tests

### Backend Unit & Integration Tests
```powershell
cd apps/api
.\.venv\Scripts\python.exe -m pytest
```

### Frontend Test Suite, Linter & Production Build
```powershell
cd apps/web
npm test
npm run lint
npm run build
```

---

## Deployment

### Frontend (Vercel)
- **Platform**: Vercel
- **Root Directory**: `apps/web`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://<your-deployed-backend>/api/v1` *(must be configured in Vercel before building)*

### Backend (Render Web Service)
- **Platform**: Render (Web Service)
- **Root Directory**: `apps/api`
- **Runtime**: Python 3.13 / 3.12
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `MLINGO_ENVIRONMENT`: `production`
  - `MLINGO_FRONTEND_ORIGIN`: `https://<your-deployed-frontend>.vercel.app`

---

## Recommended 5–7 Minute Evaluator Demo Flow

1. **Start at Landing Page (`/`)**: Note the clear learning path from foundations to labs and challenges.
2. **Explore Curriculum (`/learn`)**: Review progressive concepts (loss, gradient descent, classification, clustering) that link directly to live labs.
3. **Linear Regression Lab (`/labs/gradient-descent`)**:
   - Run training with default parameters.
   - Scrub the playhead to observe synchronized fit line, MSE loss curve, and gradient vectors.
   - Switch between **Math Mode** and **Code Mode** to view exact calculations.
   - Review **Training Signals** and **Training Insights**; click an insight to jump to its corresponding frame.
4. **Try a Challenge (`/challenges`)**:
   - Open *Make gradient descent unstable*. Increase learning rate to provoke loss oscillation.
   - Scrub the timeline to find the first rising frame, place a user marker, and verify challenge completion.
5. **Logistic Regression Lab (`/labs/logistic-regression`)**:
   - Run a 2-class classification run. Observe how the decision boundary forms and stabilizes as accuracy climbs to 100%.
6. **K-Means Clustering Lab (`/labs/k-means`)**:
   - Observe centroid movement and cluster reassignment across iterations.
   - Inspect K-Means Math Mode and Code Mode.
7. **Compare Experiments (`/labs/gradient-descent/compare`)**:
   - Train Run A ($\alpha = 0.001$) vs Run B ($\alpha = 0.01$).
   - Scrub with the shared playhead to inspect metric differences and factual comparison observations.
8. **Experiments Workspace (`/experiments`)**:
   - Freely configure custom runs across any of the 3 algorithms.
9. **Review Learning Memory (`/progress`)**:
   - Check recorded concepts, completed challenges, and explored laboratories.

---

## Current Scope & Limitations

- **Browser-Local State**: User progress and custom markers use browser `localStorage`. No remote account database is required.
- **In-Memory Training Runs**: Replayable runs are generated and held in memory for the active session.
- **Deterministic Heuristics**: Diagnostic signals and Training Insights are 100% deterministic mathematical calculations, not LLM-generated text.
- **No Third-Party Dependencies**: No external AI APIs, payment processors, or authentication providers.

---

## Future Roadmap

- Durable server-side run storage and sharing links.
- Additional foundational algorithms (PCA, Decision Trees, Multi-Layer Perceptron).
- Contextual, deterministic Socratic AI tutor grounded in recorded run state.
- Interactive export of generated datasets and models to Python notebooks.
