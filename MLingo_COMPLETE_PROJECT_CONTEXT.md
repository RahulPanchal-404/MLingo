# MLingo — Complete Project Context for Claude

## Purpose
This is the complete working context for the MLingo project. Treat it as the source of truth, but inspect the current repository before modifying anything. The project is not starting from scratch.

The user is building MLingo themselves. GitHub Copilot is the primary implementation assistant. Claude is being brought in for diagnosis, review, and second opinions. ChatGPT has been acting as product architect, technical mentor, milestone planner, debugger, and reviewer.

The user does NOT want an AI assistant to blindly build the whole project. Work milestone-by-milestone. Preserve existing work. Explain important architectural decisions.

---

# 1. PRODUCT IDENTITY

Project: MLingo

Primary tagline:
Machine Learning, Frame by Frame.

Other useful phrases:
- Run. Scrub. Inspect. Break. Compare. Understand.
- Learn ML by watching it happen.
- Two experiments. One clock. (A/B comparison)

Target users:
- ML learners
- primarily college students/learners who know basic Python/programming but struggle to understand what happens inside ML algorithms
- learners who understand theory but lack intuition

Core problem:
Traditional ML learning often looks like Theory → Formula → Code → Final Result. Students can memorize definitions yet struggle to understand training dynamics, parameter updates, loss, learning rate, overfitting, and how math maps to code.

MLingo solves this with interactive, replayable ML training experiences.

---

# 2. KILLER FEATURE

## Training Timeline

A video-editor-inspired Training Timeline is the defining product feature.

Mental model:
A Machine Learning training run is like footage in a video editor.

Instead of:
Train → Wait → Final result

MLingo should provide:
Train → Recorded Training Run → Timeline → Scrub → Inspect exact state

If playhead = 30:
- regression line reflects state 30
- loss reflects state 30
- weights reflect state 30
- bias reflects state 30
- gradients reflect state 30
- predictions reflect state 30
- metrics reflect state 30

All views must remain synchronized.

The timeline must NOT be a fake animation. It is a visual controller over real historical training states.

Video-editing ideas to use:
- playhead
- ruler
- scrubbing
- play/pause
- step controls
- markers
- annotations
- A/B shared timeline
- future highlight reels

Do not claim that no competitor has this without proper competitor research. The defensible differentiation is the timeline-centric representation of model training combined with synchronized visualization, state inspection, experimentation, and learning.

---

# 3. PRODUCT PHILOSOPHY

Core learning loop:
Learn → Run → Scrub → Inspect → Break → Compare → Understand → Challenge → Build

Questions MLingo should answer:

What happened?
→ Training Timeline

Why did it happen?
→ Model inspection + deterministic diagnostics + later AI Tutor

What happens if I change it?
→ Experiment Lab + A/B comparison

Can I understand it deeply?
→ Math Mode + Code Mode + Challenges

Core educational principle:
"Don't just tell students how ML works. Let them make ML work."

---

# 4. LONG-TERM PRODUCT VISION

MLingo is intended to become:
- interactive ML learning platform
- interactive ML laboratory
- training-run replay environment
- experiment sandbox
- model inspection tool
- challenge environment
- contextual AI tutor

Conceptual flow:

MLINGO
├── LEARN
├── LABS
├── EXPERIMENTS
├── CHALLENGES
├── PROGRESS
└── PROJECTS

Inside Labs/Experiments:
Concept → Run → Timeline → Inspect → Break → Compare → Understand

AI Tutor will sit across the learning experience later and use actual lab context.

---

# 5. CORE TECHNICAL DOMAIN MODEL

## TrainingRun

A TrainingRun is a first-class domain object. It is a replayable historical recording of model training, not just a final accuracy result.

Conceptual fields:
- id
- algorithm
- dataset
- configuration
- total_steps
- history
- markers
- metadata

## TrainingState

A TrainingState is one exact point/frame of training.

Current concepts include:
- step
- weights
- bias
- loss
- gradients
- bias gradient
- predictions
- metrics

Think:
TrainingRun = the whole video
TrainingState = one frame

Important UI rule:
Do NOT let frontend components index history directly using implementation details such as `run.history[currentStep - 1]`.

Prefer:
Timeline abstraction/controller → selected TrainingState

The timeline abstraction owns the relationship between playhead position and training history.

---

# 6. SYSTEM ARCHITECTURE

Overall system:

Frontend (Next.js/React/TypeScript/Tailwind)
        ↓ HTTP/JSON
FastAPI API
        ↓
Services
        ↓
ML Engine
        ↓
TrainingRun / TrainingState history

PostgreSQL is used for persistence of application metadata and eventually experiments/progress/users. Training history is currently in memory and should not be prematurely forced into relational tables.

Important separation:
API route → Service → Training Engine → TrainingRun

Do not put a large ML algorithm implementation directly inside a FastAPI route.

Frontend feature-oriented structure and backend service/domain separation should be preserved.

---

# 7. CURRENT PROJECT LOCATION

Windows project path:
D:\MLingo

Broad structure:
D:\MLingo
├── apps
│   ├── web
│   └── api
├── docs
│   ├── architecture
│   ├── product
│   └── decisions
├── infra
│   └── docker-compose.yml
├── README.md
└── .gitignore

---

# 8. FRONTEND STATUS

Frontend stack:
- Next.js
- React
- TypeScript
- Tailwind CSS

Location:
D:\MLingo\apps\web

Current important routes:
- /
- /learn
- /labs
- /labs/gradient-descent
- /labs/gradient-descent/compare
- /experiments
- /challenges
- /progress
- /profile

Navigation works.

The normal Gradient Descent Lab is a single-run experience.
The comparison lab is a separate route.

Intended information architecture:

/labs
  ↓
/labs/gradient-descent
  ↓
Single-run learning experience

Single-run lab has:
"Compare training runs"
  ↓
/labs/gradient-descent/compare

Do not make comparison the default experience for a beginner.

The /labs page is currently simple and is intentionally not yet a full lab library.

---

# 9. BACKEND STATUS

Backend stack:
- Python
- FastAPI
- Pydantic

Location:
D:\MLingo\apps\api

API prefix:
/api/v1

Health endpoint:
GET /api/v1/health

Expected:
{
  "status": "ok",
  "service": "MLingo API"
}

Swagger:
http://127.0.0.1:8000/docs

---

# 10. POSTGRESQL / DOCKER

PostgreSQL is already configured through Docker.

Container:
mlingo-postgres

Database:
mlingo

Port:
5432

Compose file:
D:\MLingo\infra\docker-compose.yml

Do not replace/recreate this setup blindly.

TrainingRun is currently NOT persisted to PostgreSQL. This is intentional.

Later evaluate storage based on real history sizes:
- PostgreSQL for metadata/ownership/experiment information
- serialized artifacts/object storage/client-side/hybrid for large histories as appropriate

---

# 11. CURRENT ML MODEL

Current first model:
Linear Regression

Model:
ŷ = wx + b

Optimization:
Gradient Descent

Implementation:
NumPy-based educational training engine

Why not rely only on high-level sklearn:
MLingo needs access to per-step internal state so it can visualize:
- weight updates
- bias updates
- gradients
- predictions
- loss
- model state

Planned algorithms after the core lab:
- Logistic Regression
- KNN
- K-Means
- Decision Tree
- PCA
- SVM
- Neural Network
- Backpropagation

Depth over breadth. Prefer a few excellent labs to many shallow ones.

---

# 12. ML TRAINING ENGINE — ALREADY IMPLEMENTED

Structure:
apps/api/app/ml/
├── algorithms/
│   └── linear_regression.py
├── datasets/
│   └── synthetic.py
├── experiments/
│   └── __init__.py
├── metrics/
│   └── regression.py
└── training/
    ├── gradient_descent.py
    ├── trainer.py
    └── types.py

Existing concepts:
- TrainingConfig
- RegressionDataset
- TrainingState
- TrainingRun
- Linear Regression
- Gradient Descent
- MSE
- deterministic synthetic regression dataset

TrainingConfig supports concepts such as:
- learning_rate
- epochs
- initial weights
- initial bias

Synthetic dataset generator supports:
- samples
- slope
- intercept
- noise
- seed

Training should be deterministic for the same dataset/configuration.

Milestone 2 test result:
10 passed

---

# 13. TRAINING HISTORY INITIAL STATE ISSUE

An important issue was discovered:
The first history design started with the first post-update state.

Example:
Step 1
weight ≈ 1.1075
bias ≈ 1.5027

There was no state before the first update.

Desired timeline semantics:

State 0
→ model before any update

State 1
→ after update 1

State 2
→ after update 2

...

State N
→ after update N

Therefore if epochs = 50:
history should ideally contain 51 states.

State 0 should capture:
- initial weights
- initial bias
- initial predictions
- initial loss
- initial gradients only if conceptually meaningful; do NOT invent fake gradients

This is important because the timeline should show:
Where I started → how I changed → where I ended.

The state-0 change was explicitly requested to Copilot after seeing the first frame already partially trained.

Current status of whether this has been implemented must be inspected in the repository; do not assume.

---

# 14. TIMELINE DOMAIN ENGINE — ALREADY IMPLEMENTED

Location:
apps/api/app/timeline/
├── __init__.py
├── controller.py
└── types.py

TimelineController owns navigation from a TrainingRun to selected TrainingState.

Supports:
- play
- pause
- toggle
- step forward
- step backward
- jump to step
- jump to start/end
- playback speed
- marker creation/removal
- boundary handling
- empty history handling

TimelineState represents:
- current step
- total recorded steps
- playing state
- playback speed
- markers
- selected training state

Timeline is pure domain logic and must not depend on:
- React
- Next.js
- DOM
- browser APIs
- FastAPI
- PostgreSQL

Milestone 3 test result:
17 passed

---

# 15. TRAINING API — ALREADY IMPLEMENTED

Endpoint:
POST /api/v1/training-runs

Request:
{
  "algorithm": "linear_regression",
  "dataset": {
    "samples": 32,
    "slope": 2.0,
    "intercept": 1.0,
    "noise": 0.0,
    "seed": 0
  },
  "training": {
    "learning_rate": 0.1,
    "epochs": 50,
    "initial_weight": 0.0,
    "initial_bias": 0.0
  }
}

Response type:
TrainingRunResponse

Conceptual response fields:
- id
- algorithm
- dataset
- dataset_points
- training
- total_steps
- history
- markers
- metadata

TrainingState response fields include concepts such as:
- step
- weights
- bias
- loss
- gradients
- bias_gradient
- predictions
- metrics

The response is intended to be JSON serializable.

Swagger manual test succeeded with HTTP 201 Created.

Existing focused API tests:
4 passed

Complete backend suite after fixing a dataclass import issue:
21 passed

CORS:
`http://localhost:3000` is allowed by default/configuration.

Bug already fixed:
`services/training_runs.py` used `@dataclass` before importing dataclass. The import was moved to the standard-library imports.

Do not change the API contract casually.

---

# 16. FIRST REAL USER-FACING LAB — ALREADY IMPLEMENTED

Route:
/labs/gradient-descent

Features currently include:
- learning rate input
- epochs input
- samples input
- noise input
- Run Training
- regression visualization
- loss visualization
- selected state panel
- timeline
- play/pause/reset
- previous/next
- scrubbing
- playback speed
- user markers
- automatic event markers
- frame-change summaries
- loading/error states
- responsive behavior

Visual direction:
- scientific
- technical
- premium
- creative-tool inspired
- educational
- not a generic dashboard

Current UI hierarchy roughly:
Lab title
↓
Experiment setup
↓
Regression + Loss
↓
Selected frame
↓
Timeline

---

# 17. TIMELINE 2.0 — ALREADY IMPLEMENTED

Reported changed files:
- gradient-descent-lab.tsx
- timeline-controls.tsx
- use-training-timeline.ts
- types.ts
- event-markers.ts
- frame-changes.ts
- globals.css

Features added:
- data-driven timeline ruler
- derived labels/ticks
- visible playhead
- current frame and total steps
- local user markers
- automatic event markers
- marker navigation
- frame-change summaries

Automatic event rules implemented:
- Rapid loss decrease: at least 15% relative loss reduction
- Possible plateau: five-frame window with loss changes <= 0.002
- Near convergence: weight and bias gradients both within 0.05

Marker steps use zero-based internal history indexing but display one-based training steps.

Clicking a marker jumps to the step and pauses playback.

Frame-change summaries include:
- weight
- bias
- loss
- gradient

First frame:
"No previous frame."

Browser smoke checks passed for:
- user marker creation
- marker navigation
- user marker removal
- automatic event marker rendering
- frame-change display

Lint/build passed.

No frontend test runner existed, and a test framework was not added just for this milestone.

---

# 18. LEARNING-RATE INPUT BUG — FIXED

At one point, learning rate 0.01 was rejected by the browser with:
"Please enter a valid value. The two nearest valid values are 0.001 and 0.011."

Cause was an incorrect HTML number input min/step configuration.

It was fixed so common values such as 0.001, 0.005, 0.01, 0.05, 0.1 can be entered.

Do not undo this fix.

---

# 19. USER VALIDATED TRAINING BEHAVIOR

The user manually tested different learning rates.

Example Run A:
learning rate = 0.001
At Step 1:
- weight ≈ 0.00142
- bias ≈ 0.002
- loss ≈ 2.41334

The regression line moved very little.

Example Run B:
learning rate = 0.01
At Step 1:
- weight ≈ 0.01419
- bias ≈ 0.02
- loss ≈ 2.35968

The model moved farther toward the dataset.

This validated:
configuration → actual training → TrainingRun → timeline → visualization

---

# 20. A/B TRAINING COMPARISON — ALREADY IMPLEMENTED

Route:
/labs/gradient-descent/compare

Current comparison experience includes:
- Run A configuration
- Run B configuration
- two real TrainingRuns
- shared timeline
- synchronized playhead
- side-by-side regression plots
- side-by-side loss charts
- selected states
- metric differences
- common/shared step range

Mental model:
"Two experiments. One clock."

Comparison architecture:
Run A ──────┐
            ├── RunComparison / shared timeline
Run B ──────┘
               ↓
           currentStep
               ↓
       State A / State B

Shared comparison range is limited by the shorter run.
Do not invent missing states.

A/B is a separate experience from the single-run lab.

Use cases later:
- learning rate comparison
- noise comparison
- datasets
- preprocessing
- regularization
- algorithms
- hyperparameters

---

# 21. ACTIVE SIDEBAR STATE

An issue was observed where Progress appeared active while inside a lab.

Desired rules:
- /labs → Labs active
- /labs/gradient-descent → Labs active
- /labs/gradient-descent/compare → Labs active
- /learn → Learn active
- /experiments → Experiments active
- /challenges → Challenges active
- /progress → Progress active
- /profile → Profile active

Nested routes should use sensible segment/prefix-aware logic rather than brittle exact equality.

This was included in the A/B refactor task and should be checked if necessary.

---

# 22. BREAK MODE / TRAINING DIAGNOSTICS — NEXT MAJOR PRODUCT FEATURE

Break Mode should let a learner intentionally break a model and investigate what happened.

Core loop:
TRAIN
↓
OBSERVE
↓
CHANGE
↓
BREAK
↓
FIND PROBLEMATIC FRAME
↓
UNDERSTAND WHY

Planned diagnostic event types:
- rapid_loss_decrease
- possible_plateau
- possible_instability
- possible_divergence
- near_convergence

DiagnosticEvent concept:
- id
- step
- type
- title
- description
- severity
- evidence

Diagnostics should be deterministic, data-driven, and not AI-generated.

Use careful language:
- Possible instability
- Possible plateau
- Possible divergence
- Near convergence

Do not present simple heuristics as universal scientific truths.

Initial Break Mode challenge idea:
"Make gradient descent unstable."

Tasks:
1. Change learning rate.
2. Run training.
3. Find first suspicious frame.
4. Add user marker.
5. Inspect evidence.

Potential success:
marker is within a small configurable step tolerance of a detected event.

AI explanations come later.

---

# 23. FUTURE MODEL X-RAY

At any selected timeline position, allow inspection of current internal state.

For simple models:
- weights
- bias
- gradients
- predictions
- metrics
- decision boundary

For neural networks later:
- layer outputs
- neuron activations
- gradients
- weights
- internal state

---

# 24. FUTURE MATH MODE

Synchronize visualization state with math.

Linear Regression:
ŷ = wx + b

Loss:
L = 1/n Σ(y - ŷ)^2

Gradient:
∂L/∂w = ...

When the playhead moves, displayed values should update.

---

# 25. FUTURE CODE MODE

Show the Python operations corresponding to the selected training process.

Example:
```python
prediction = X @ weights + bias
error = prediction - y
gradient = X.T @ error
weights -= learning_rate * gradient
```

Later, code lines can be linked to visual/model actions.

---

# 26. FUTURE AI TUTOR

Add only after deterministic core experience is stable.

AI Tutor should be context-aware.

Potential context:
- current lab
- current training step
- current parameters
- loss
- gradients
- markers
- diagnostic events

Example question:
"Why did my model diverge?"

AI should answer using actual current lab state, not be a generic chatbot.

---

# 27. FUTURE CHALLENGES

Examples:
- Find a learning rate that converges quickly without diverging
- Identify first problematic frame
- Identify overfitting
- Fix a bad model
- Choose best K
- Explain why one run is better

Challenges should eventually consume the same TrainingRun + Timeline infrastructure.

---

# 28. FUTURE CHECKPOINTS / BRANCHING

Think of this as Git for ML training.

At step 40:
Save checkpoint
→ continue normally
OR
→ branch
→ change hyperparameter
→ create new TrainingRun

This is future functionality, not part of the current core.

---

# 29. FUTURE HIGHLIGHT REELS

Video-inspired feature.

User selects a training range, e.g. the moment loss rapidly decreases.

MLingo can produce a short shareable visual replay.

Potential shareable artifact:
- algorithm
- training settings
- animated selected interval
- key metrics

Do not build until timeline and comparison are mature.

---

# 30. MVP PRIORITY

## MUST HAVE
- platform shell
- learning paths
- labs
- TrainingRun
- TrainingState
- timeline
- Linear Regression
- Gradient Descent
- Logistic Regression
- KNN
- K-Means
- Decision Tree
- dataset generation
- experiments
- evaluation
- basic challenges
- progress
- Math Mode
- Code Mode
- basic AI Tutor later

## SHOULD HAVE
- timeline annotations
- diagnostics
- checkpoints
- branching
- shareable experiments
- highlight reels
- skill tree

## FUTURE / V2
- browser Python execution
- neural network debugger
- 3D optimization surfaces
- SHAP suite
- collaboration
- instructor mode
- public experiment community
- leaderboards
- certificates
- mobile app
- research-paper visualizer
- advanced LLM ML debugging

---

# 31. 30-DAY ROADMAP

Week 1 — Foundation
- product definition
- architecture
- Git/GitHub
- frontend
- backend
- PostgreSQL
- routing
- design system
- auth foundation

Week 2 — Timeline + First Lab
- ML computation engine
- TrainingRun
- TrainingState
- timeline domain
- timeline UI
- Gradient Descent
- Linear Regression
- synchronized visualizations

Week 3 — ML Laboratory
- Logistic Regression
- KNN
- K-Means
- Decision Tree
- dataset system
- experiment system
- A/B comparison
- Break Mode
- evaluation

Week 4 — Productization
- learning system
- Math Mode
- Code Mode
- challenges
- progress
- AI tutor
- polish
- testing
- security
- deployment
- presentation

---

# 32. GIT / GITHUB

Git is initialized.

Branch:
main

GitHub remote:
origin

A significant implementation checkpoint was committed and pushed.

Useful commit style:
- chore: initialize MLingo project
- feat: add ML training engine
- feat: add timeline domain engine
- feat: expose training run API
- feat: build gradient descent lab
- feat: add training run comparison

Commit at meaningful milestones.
Keep working tree clean before large new work.

---

# 33. WINDOWS / LOCAL DEVELOPMENT

PowerShell blocks npm.ps1 on this machine.
Use `npm.cmd`.

Frontend:
```powershell
cd D:\MLingo\apps\web
npm.cmd run dev
```

Lint:
```powershell
npm.cmd run lint
```

Build:
```powershell
npm.cmd run build
```

Backend:
```powershell
cd D:\MLingo\apps\api
.venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

PostgreSQL:
```powershell
cd D:\MLingo
docker compose -f infra\docker-compose.yml up -d
```

Frontend:
http://localhost:3000

Backend:
http://127.0.0.1:8000

Health:
http://127.0.0.1:8000/api/v1/health

Swagger:
http://127.0.0.1:8000/docs

Do not concatenate PowerShell commands accidentally. Run one command per line.

---

# 34. TESTING HISTORY

Frontend:
- `npm.cmd run lint` passed
- `npm.cmd run build` passed
- Next.js production build succeeds
- routes compiled successfully
- originally no frontend test runner was installed

Backend:
- ML/training milestone: 10 passed
- timeline milestone: 17 passed
- focused training API tests: 4 passed
- full backend suite: 21 passed
- one existing dependency deprecation warning exists

Do not claim a frontend test framework exists unless inspected.

---

# 35. HYDRATION ERROR — CURRENT DIAGNOSTIC CONTEXT

There is a persistent Next.js hydration overlay in some development/browser conditions.

Message:
"A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up."

The mismatch is shown on the root `<body>`.

Suspicious injected attribute resembles:
`__processed_<random-id>="true"`

Example screenshot highlights an attribute like:
`__processed_76ca4a85-...__="true"`

Next.js points to:
`apps/web/app/layout.tsx`
near:
`<body className="min-h-full">{children}</body>`

Important:
The strange `__processed_*` attribute is NOT present in the MLingo source/configuration found so far.

Copilot performed an investigation that searched for:
- document
- document.body
- document.documentElement
- setAttribute
- MutationObserver
- window
- localStorage
- sessionStorage
- Date.now
- Math.random
- crypto.randomUUID
- __processed
- processed_

Copilot concluded:
1. Root cause appears to be external DOM injection.
2. The attribute is absent from MLingo source.
3. It was not found in project configuration/dependencies.
4. Root layout/client components appear deterministic.
5. No code was found deliberately mutating the body/document.
6. Lint passes.
7. Production build passes.
8. Copilot's own dev/prod checks did not reproduce the warning under its clean execution conditions.
9. Copilot made NO code changes for the hydration warning.
10. Exact external injector is not identified.

Originally the warning disappeared in Incognito in one test. Later the user reported it appearing in Incognito and another/new browser as well. Therefore do NOT simply assume a browser extension is the cause.

Attempts made:
- normal browser
- Incognito
- another/new browser
- restart Next.js
- delete `.next`
- inspect build/lint
- inspect source
- Copilot investigation

The warning may still appear for the user in the development overlay.

Critical rule:
Do NOT use `suppressHydrationWarning` as a band-aid.
Do NOT blindly rewrite `layout.tsx`.
Do NOT mask the problem.

If Claude can prove an external injection, document it and avoid compromising application architecture.
If a real application source of mismatch is proven, make the smallest correct fix.

The hydration issue is separate from API connectivity.

---

# 36. API CONNECTIVITY CONTEXT

At one point the frontend showed:
"Training could not be recorded. Failed to fetch"

This occurred when the FastAPI server had been stopped by Copilot's investigation session.

Backend was then restarted and verified healthy.

The health endpoint returned:
`{"status":"ok","service":"MLingo API"}`

Swagger POST /api/v1/training-runs returned:
HTTP 201 Created

Therefore the backend API itself is healthy when running.

If the frontend says `Failed to fetch`, first verify that FastAPI is running on port 8000 before changing code.

---

# 37. IMPORTANT PRODUCT/UX INSIGHT FROM TESTING

The first lab demonstrated that changing learning rate changes actual model behavior.

The next product question is not "Can we add more graphs?"
It is:
"Does this feel like a timeline of how the model learned?"

The project should be evaluated by learning experience, not just technical completeness.

Current useful distinction:
- Single-run lab = understand one model
- Comparison = ask what changed between two experiments
- Break Mode = intentionally cause problems and find where/why they happened

This progression is pedagogically important.

---

# 38. UX DESIGN PRINCIPLES

Avoid:
- generic dashboard aesthetics
- excessive gradients
- fake glassmorphism
- huge decorative text without purpose
- meaningless animations
- fake buttons that do nothing
- empty pages pretending to be feature-complete

Prefer:
- scientific tool
- developer tool
- creative timeline editor
- clear information hierarchy
- real model state
- educational clarity
- meaningful interaction

Video-editor influence should be visible in interaction design, not by literally cloning DaVinci Resolve.

---

# 39. CURRENT SINGLE-RUN LAB EXPERIENCE

Expected flow:
Open `/labs/gradient-descent`
↓
Configure learning rate, epochs, samples, noise
↓
Run Training
↓
Receive real TrainingRun
↓
Timeline appears
↓
Scrub/play
↓
Regression/loss/state panel update together

The learner can add markers and inspect changes.

The key proof is:
Timeline currentStep
→ selected TrainingState
→ actual weight/bias
→ regression line and loss update

---

# 40. CURRENT A/B EXPERIENCE

Expected flow:
Open `/labs/gradient-descent/compare`
↓
Configure Run A / Run B
↓
Train comparison
↓
Receive two real TrainingRuns
↓
Shared playhead
↓
State A(step) + State B(step)
↓
Side-by-side visualization and metric differences

Single-run route must NOT automatically redirect to comparison.

---

# 41. FUTURE UNIFIED EXPERIENCE

A selected timeline state should eventually feed:

selected TrainingState
├── visual state
├── mathematical state
├── code context
├── diagnostics
└── AI Tutor context

This is how MLingo stays coherent instead of becoming a collection of unrelated demos.

---

# 42. ENGINEERING WORKFLOW

Use this loop for every milestone:

PLAN
↓
ARCHITECT
↓
IMPLEMENT (Copilot/Claude as assistant)
↓
REVIEW
↓
RUN
↓
TEST
↓
COMMIT
↓
NEXT MILESTONE

Every milestone must be testable.

Never ask the coding assistant to build the whole product in one shot.

---

# 43. COPILOT / CLAUDE RULES

Always tell the coding assistant:
- inspect existing project first
- preserve working functionality
- implement only current milestone
- do not build future features
- avoid unnecessary dependencies
- use strong typing
- keep files small/maintainable
- separate domains/services/routes
- run relevant tests
- run lint/build
- report exactly what changed
- stop after the requested milestone

Never let the assistant blindly recreate infrastructure.

---

# 44. CURRENT NEXT MILESTONE

After hydration issue is sufficiently understood:

## Milestone 7A — Training Diagnostics

Build deterministic diagnostics over existing TrainingRun history.

Then:
## Milestone 7B — Break Mode

Focused challenge:
"Make gradient descent unstable."

Then:
## Milestone 7C — Diagnostic explanations

Then:
## Milestone 7D — Challenge evaluation

Do NOT jump prematurely to AI, more algorithms, social features, or gamification.

The timeline and experimentation experience are the product's heart.

---

# 45. HOW TO THINK ABOUT THE WHOLE PROJECT

The core product is not:
"an ML website with graphs."

It is:
"a system that treats model training as time-indexed, replayable, inspectable footage."

The technical core is:

Training Engine
↓
TrainingRun
↓
TrainingState[]
↓
Timeline
↓
Selected State
↓
Visualization / Math / Code / Diagnostics / AI

The educational core is:

Learn
↓
Experiment
↓
Observe
↓
Investigate
↓
Understand

The differentiating interaction is:

Scrub through the model's learning process frame by frame.

---

# 46. ONE-SENTENCE DESCRIPTION FOR PRESENTATIONS

"MLingo is an interactive Machine Learning learning platform where model training is represented as a replayable, inspectable timeline, allowing learners to watch, scrub, compare, break, and understand ML training frame by frame."

---

# 47. ONE-SENTENCE TECHNICAL DESCRIPTION

"MLingo models training as a time-indexed sequence of TrainingState snapshots, allowing a timeline playhead to drive synchronized ML visualizations and later diagnostics, comparisons, math, code, and AI explanations."

---

# 48. CURRENT STATUS AT A GLANCE

PRODUCT
✅ identity
✅ target audience
✅ killer feature
✅ philosophy
✅ MVP direction
✅ roadmap

INFRA
✅ D:\\MLingo
✅ Git/GitHub
✅ Next.js
✅ FastAPI
✅ PostgreSQL Docker
✅ routing

ML
✅ Linear Regression
✅ Gradient Descent
✅ synthetic data
✅ TrainingConfig
✅ TrainingState
✅ TrainingRun
✅ MSE

TIMELINE
✅ domain controller
✅ frontend timeline
✅ scrubbing
✅ playback
✅ speed
✅ user markers
✅ event markers
✅ frame changes

LAB
✅ Gradient Descent single-run lab
✅ real training API integration
✅ regression plot
✅ loss chart
✅ selected-state panel

COMPARISON
✅ A/B comparison
✅ shared timeline
✅ common step range
✅ metric differences

TESTING
✅ backend tests
✅ lint
✅ production build

CURRENT ISSUES
⚠️ persistent hydration warning under some browser/development conditions; suspected external DOM mutation, not proven to be MLingo source
⚠️ state-0 training history semantics must be verified in current repository if not already confirmed

NEXT PRODUCT FEATURE
🔥 deterministic training diagnostics + Break Mode

---

# 49. IMMEDIATE WORKING RULE FOR CLAUDE

Before changing anything:
1. Inspect the current repository.
2. Verify the exact current implementation.
3. Separate real application problems from environment/browser/tooling problems.
4. Avoid broad rewrites.
5. Preserve the existing training/timeline architecture.
6. Prefer the smallest correct change.
7. Run tests/lint/build.
8. Explain the result concisely.

Never assume a remembered file structure is still exact. Inspect first.

