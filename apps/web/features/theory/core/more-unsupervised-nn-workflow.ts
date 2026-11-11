import type { TheoryTopic } from "../topics";

const r = String.raw;

export const PCA_THEORY: TheoryTopic[] = [
  {
    slug: "pca",
    group: "Unsupervised learning",
    title: "PCA: Principal Component Analysis",
    summary: "Rotate the data onto the directions of greatest spread and keep only the top few.",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "PCA finds new axes (principal components) ordered by how much variance they capture, so you can drop the low-variance ones and keep most of the information in fewer dimensions." } },
          { p: "Height in cm and height in inches are two columns carrying one piece of information. PCA spots such redundancy automatically: correlated features collapse onto a shared direction. Uses: compressing features before a model, removing noise, and plotting high-dimensional data in 2-D." },
        ],
      },
      {
        heading: "The maths",
        blocks: [
          { p: "Centre the data (subtract each column's mean) to get $\\mathbf{X}$. Its covariance matrix is:" },
          { math: r`\mathbf{C} = \frac{1}{n - 1}\mathbf{X}^\top\mathbf{X}` },
          { p: "The principal components are the eigenvectors of $\\mathbf{C}$; each eigenvalue is the variance along its eigenvector. Sort by eigenvalue, keep the top $k$ as columns of $\\mathbf{W}_k$, and project:" },
          { math: r`\mathbf{C}\mathbf{v}_j = \lambda_j\mathbf{v}_j, \qquad \mathbf{Z} = \mathbf{X}\mathbf{W}_k, \qquad \text{explained variance ratio}_j = \frac{\lambda_j}{\sum_i \lambda_i}` },
          {
            derive: {
              title: "Why eigenvectors give the maximum variance",
              blocks: [
                { p: "The variance of the data projected onto a unit vector $\\mathbf{v}$ is $\\mathbf{v}^\\top\\mathbf{C}\\mathbf{v}$. Maximise it subject to $\\mathbf{v}^\\top\\mathbf{v} = 1$ with a Lagrange multiplier:" },
                { math: r`\nabla_{\mathbf{v}}\big[\mathbf{v}^\top\mathbf{C}\mathbf{v} - \lambda(\mathbf{v}^\top\mathbf{v} - 1)\big] = 2\mathbf{C}\mathbf{v} - 2\lambda\mathbf{v} = 0 \;\Rightarrow\; \mathbf{C}\mathbf{v} = \lambda\mathbf{v}` },
                { p: "So the best direction is an eigenvector, and the variance it captures is $\\mathbf{v}^\\top\\mathbf{C}\\mathbf{v} = \\lambda$. The largest eigenvalue wins. Each next component is the best direction perpendicular to the ones already chosen." },
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "Two centred features with covariance matrix $\\mathbf{C} = \\begin{bmatrix} 3 & 1 \\\\ 1 & 3 \\end{bmatrix}$." },
          {
            steps: [
              { title: "Eigenvalues", body: "Solve $\\det(\\mathbf{C} - \\lambda\\mathbf{I}) = 0$.", math: r`(3 - \lambda)^2 - 1 = 0 \;\Rightarrow\; \lambda_1 = 4,\; \lambda_2 = 2` },
              { title: "Eigenvectors", body: "PC1 points along the diagonal, PC2 across it.", math: r`\mathbf{v}_1 = \tfrac{1}{\sqrt{2}}(1, 1), \qquad \mathbf{v}_2 = \tfrac{1}{\sqrt{2}}(1, -1)` },
              { title: "Explained variance", body: "Keeping only PC1 keeps two-thirds of the variance with half the columns.", math: r`\frac{4}{4 + 2} \approx 66.7\%, \qquad \frac{2}{6} \approx 33.3\%` },
              { title: "Project a point", body: "The point (2, 0) becomes a single number on PC1.", math: r`z_1 = (2, 0) \cdot \tfrac{1}{\sqrt{2}}(1, 1) = \tfrac{2}{\sqrt{2}} \approx 1.414` },
            ],
          },
        ],
      },
      {
        heading: "Choosing k",
        blocks: [
          {
            list: [
              "**Cumulative explained variance**: keep enough components to reach 90–95%.",
              "**Scree plot**: plot eigenvalues in order and cut at the elbow.",
              "**Downstream score**: treat $k$ as a hyperparameter and pick it by cross-validation of the final model.",
            ],
          },
          {
            table: {
              head: ["PCA is good for", "PCA is not"],
              rows: [
                ["Removing correlated, redundant features", "Feature selection: each component mixes all original features"],
                ["Speeding up models on many features", "Guaranteed to help classification (it ignores labels)"],
                ["2-D plots of high-dimensional data", "Good at curved structure (t-SNE/UMAP are better for plots)"],
              ],
            },
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "scaling", caption: "PCA follows variance, so an unscaled feature with a huge range (income) would hog PC1. Standardise first unless the units are already comparable." }],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import numpy as np

pca = make_pipeline(StandardScaler(), PCA(n_components=0.95))  # keep 95% variance
Z = pca.fit_transform(X_train)
print(Z.shape, np.cumsum(pca[-1].explained_variance_ratio_))

model = make_pipeline(StandardScaler(), PCA(n_components=10), LogisticRegression())
model.fit(X_train, y_train)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Running PCA on unscaled features", fix: "Standardise first, or the largest-unit feature dominates." },
              { mistake: "Fitting PCA on all data before splitting", fix: "It is a fitted step: put it in the pipeline after the split." },
              { mistake: "Interpreting components as original features", fix: "Look at the loadings (pca.components_) to see what each component mixes." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "The eigenvalues of a covariance matrix are 6, 3 and 1. What share of variance do the first two components keep?", options: ["60%", "80%", "90%", "100%"], answer: 2, why: "(6 + 3) / (6 + 3 + 1) = 9/10 = 90%." } },
        ],
      },
    ],
  },
];

export const MORE_NN_THEORY: TheoryTopic[] = [
  {
    slug: "training-neural-networks",
    group: "Neural networks",
    title: "Training Neural Networks: Optimisers & Regularisation",
    summary: "Momentum, Adam, good initialisation, dropout and batch norm: what makes deep nets actually train.",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Plain gradient descent is too slow and fragile for deep networks, so we add smarter optimisers, careful weight initialisation and regularisers that keep training stable and stop memorisation." } },
          { p: "Backpropagation tells you the gradient. Everything on this page is about using that gradient well: how big a step to take, how to keep signals from fading or exploding through many layers, and how to stop the network from memorising the training set." },
        ],
      },
      {
        heading: "Optimisers",
        blocks: [
          { math: r`\text{SGD: } \boldsymbol\theta \leftarrow \boldsymbol\theta - \eta\,\mathbf{g} \qquad \text{Momentum: } \mathbf{v} \leftarrow \beta\mathbf{v} + \mathbf{g},\;\; \boldsymbol\theta \leftarrow \boldsymbol\theta - \eta\,\mathbf{v}` },
          { p: "**Adam** keeps a running mean of gradients ($\\mathbf{m}$, like momentum) and of squared gradients ($\\mathbf{v}$, a per-parameter scale), with bias correction for the first steps:" },
          { math: r`\mathbf{m} \leftarrow \beta_1\mathbf{m} + (1 - \beta_1)\mathbf{g}, \quad \mathbf{v} \leftarrow \beta_2\mathbf{v} + (1 - \beta_2)\mathbf{g}^2, \quad \hat{\mathbf{m}} = \frac{\mathbf{m}}{1 - \beta_1^t},\; \hat{\mathbf{v}} = \frac{\mathbf{v}}{1 - \beta_2^t}` },
          { math: r`\boldsymbol\theta \leftarrow \boldsymbol\theta - \eta\,\frac{\hat{\mathbf{m}}}{\sqrt{\hat{\mathbf{v}}} + \epsilon} \qquad (\beta_1 = 0.9,\; \beta_2 = 0.999,\; \eta = 10^{-3})` },
          {
            table: {
              head: ["Optimiser", "Key idea", "When"],
              rows: [
                ["SGD", "Step along the gradient", "Simple models; sometimes best final accuracy with tuning"],
                ["SGD + momentum", "Builds speed in consistent directions, damps zig-zags", "CNNs, with a schedule"],
                ["RMSProp", "Divides by running RMS of gradients", "RNNs, noisy problems"],
                ["Adam / AdamW", "Momentum + per-parameter scaling (AdamW decouples weight decay)", "Default starting point"],
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: Adam's first step",
        blocks: [
          { p: "One parameter, gradient $g = 4$ on the first step ($t = 1$), defaults $\\beta_1 = 0.9$, $\\beta_2 = 0.999$, $\\eta = 0.001$." },
          {
            steps: [
              { title: "Running averages start at 0", body: "", math: r`m = 0.1 \times 4 = 0.4, \qquad v = 0.001 \times 16 = 0.016` },
              { title: "Bias correction", body: "Without it, the first steps would be far too small because m and v start at 0.", math: r`\hat{m} = \frac{0.4}{1 - 0.9} = 4, \qquad \hat{v} = \frac{0.016}{1 - 0.999} = 16` },
              { title: "The step", body: "The step is η regardless of whether the gradient was 4 or 400: Adam normalises each parameter's step size.", math: r`\Delta\theta = -0.001 \times \frac{4}{\sqrt{16}} = -0.001` },
              { title: "What momentum adds", body: "With β = 0.9, momentum averages over roughly the last 1/(1 − β) = 10 gradients, so noise cancels and steady directions accelerate." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "gd-step", caption: "The zig-zag you see at a high learning rate is exactly what momentum smooths and Adam rescales." }],
      },
      {
        heading: "Initialisation and normalisation",
        blocks: [
          { p: "If weights start too small, signals shrink layer after layer (vanishing); too large and they blow up. Initialise so each layer keeps the variance roughly constant:" },
          { math: r`\text{Xavier/Glorot (tanh, sigmoid): } \operatorname{Var}(w) = \frac{2}{n_{\text{in}} + n_{\text{out}}} \qquad \text{He (ReLU): } \operatorname{Var}(w) = \frac{2}{n_{\text{in}}}` },
          { p: "**Batch normalisation** standardises each layer's pre-activations over the mini-batch, then lets the network rescale them with learned $\\gamma$, $\\beta$. It allows larger learning rates and makes training less sensitive to initialisation:" },
          { math: r`\hat{z} = \frac{z - \mu_{\text{batch}}}{\sqrt{\sigma^2_{\text{batch}} + \epsilon}}, \qquad y = \gamma\hat{z} + \beta` },
        ],
      },
      {
        heading: "Regularisation",
        blocks: [
          {
            table: {
              head: ["Technique", "How", "Effect"],
              rows: [
                ["Weight decay (L2)", "Add $\\lambda\\lVert\\mathbf{w}\\rVert^2$ to the loss", "Keeps weights small and smooth"],
                ["Dropout", "Randomly zero each unit with probability $p$ during training; scale survivors by $1/(1 - p)$", "Units cannot rely on each other; like training many sub-networks"],
                ["Early stopping", "Stop when validation loss stops improving; keep the best weights", "Cheap and very effective"],
                ["Data augmentation", "Flips, crops, noise on inputs", "More effective data for free (images, audio)"],
              ],
            },
          },
          { p: "Dropout is switched **off** at prediction time. Because survivors were scaled up by $1/(1 - p)$ during training (inverted dropout), no change is needed at test time." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import torch, torch.nn as nn

model = nn.Sequential(
    nn.Linear(20, 64), nn.BatchNorm1d(64), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(64, 32), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(32, 1))
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
loss_fn = nn.BCEWithLogitsLoss()

for epoch in range(50):
    model.train()                                       # dropout + batchnorm in training mode
    for xb, yb in train_loader:
        opt.zero_grad()
        loss = loss_fn(model(xb).squeeze(1), yb)
        loss.backward()                                 # backprop
        opt.step()                                      # Adam update
    model.eval()                                        # dropout off for validation`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Forgetting model.eval() when validating", fix: "Dropout and batch norm behave differently in training mode; switch modes explicitly." },
              { mistake: "Initialising all weights to zero", fix: "Every unit then gets the same gradient and stays identical. Use random (He/Xavier) initialisation." },
              { mistake: "Changing many things at once when training fails", fix: "First overfit a tiny batch. If the model cannot, the bug is in the code, not the hyperparameters." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Training loss keeps falling but validation loss started rising 10 epochs ago. What is the simplest fix?", options: ["Raise the learning rate", "Early stopping: keep the weights from the best validation epoch", "Remove dropout", "Add more layers"], answer: 1, why: "Rising validation loss with falling training loss is overfitting. Early stopping takes the best checkpoint; the other options make overfitting worse or do not address it." } },
        ],
      },
    ],
  },
];

export const MORE_WORKFLOW_THEORY: TheoryTopic[] = [
  {
    slug: "cross-validation-tuning",
    group: "Workflow",
    title: "Cross-Validation & Hyperparameter Tuning",
    summary: "Estimate performance reliably and choose settings without fooling yourself.",
    learnHref: "/workbench",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Cross-validation averages scores over several train/validation splits for a stable estimate, and hyperparameter search uses that estimate to pick settings, while the test set stays untouched." } },
          { p: "One validation split is noisy: a lucky split can make a bad model look good. Rotating the validation fold and averaging gives a number you can trust, plus a spread that tells you how much to trust it." },
        ],
      },
      {
        heading: "Cross-validation schemes",
        blocks: [
          { math: r`\text{CV}_k = \frac{1}{k}\sum_{j=1}^{k} \text{score}_j, \qquad \text{report } \text{mean} \pm \text{std}` },
          {
            table: {
              head: ["Scheme", "How", "Use when"],
              rows: [
                ["k-fold (k = 5 or 10)", "k equal folds; each is validation once", "Default for i.i.d. data"],
                ["Stratified k-fold", "Each fold keeps class proportions", "Classification, especially imbalanced"],
                ["Group k-fold", "All rows of one group stay in one fold", "Several rows per patient/user/session"],
                ["Time-series split", "Train on the past, validate on the next block", "Anything ordered in time"],
                ["Leave-one-out", "k = n", "Tiny datasets only (expensive, high variance)"],
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "5-fold accuracies: 0.82, 0.85, 0.80, 0.88, 0.85." },
          {
            steps: [
              { title: "Mean", body: "", math: r`\frac{0.82 + 0.85 + 0.80 + 0.88 + 0.85}{5} = 0.84` },
              { title: "Spread", body: "Deviations −0.02, 0.01, −0.04, 0.04, 0.01. Standard deviation ≈ 0.028.", math: r`\text{accuracy} = 0.84 \pm 0.03` },
              { title: "Compare two models", body: "If model B scores 0.85 ± 0.03, the 0.01 gap is well inside the noise. Prefer the simpler or faster model." },
              { title: "Cost of a grid search", body: "4 values of C × 4 values of γ × 5 folds:", math: r`4 \times 4 \times 5 = 80 \text{ model fits}` },
            ],
          },
        ],
      },
      {
        heading: "Search strategies",
        blocks: [
          {
            table: {
              head: ["Method", "How", "Pros / cons"],
              rows: [
                ["Grid search", "Try every combination", "Thorough for 1–3 parameters; explodes with more"],
                ["Random search", "Sample combinations at random", "Better than grid for the same budget when only some parameters matter"],
                ["Bayesian optimisation (e.g. Optuna)", "Model the score surface, try promising points next", "Fewest fits; more setup"],
                ["Successive halving", "Start many configs cheaply, keep the best, give them more data", "Fast for large searches"],
              ],
            },
          },
          { p: "Search learning rates, C, λ and γ on a **log scale** (0.001, 0.01, 0.1, …). If the best value is at the edge of your grid, extend the grid." },
          { p: "**Nested CV** (an outer CV loop around the whole search) gives an unbiased estimate of the tuned model when you have no separate test set." },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "poly-degree", caption: "The degree is a hyperparameter. Cross-validation is how you would pick the degree with the lowest test error without peeking at the test set." }],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from scipy.stats import randint, loguniform

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
search = RandomizedSearchCV(
    RandomForestClassifier(random_state=0),
    {"n_estimators": randint(100, 600), "max_depth": randint(3, 20),
     "min_samples_leaf": randint(1, 10), "max_features": loguniform(0.1, 1.0)},
    n_iter=40, cv=cv, scoring="f1", n_jobs=-1, random_state=0)
search.fit(X_train, y_train)
print(search.best_params_, search.best_score_)
print(search.score(X_test, y_test))      # once, at the very end`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Preprocessing outside the CV loop", fix: "Wrap scaling, imputation and selection in a Pipeline so each fold refits them." },
              { mistake: "Reporting best_score_ as the final result", fix: "It is optimistically biased by the search. Report the untouched test score." },
              { mistake: "Ignoring the spread", fix: "Differences smaller than the CV standard deviation are not meaningful." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "You have 3 hyperparameters with 5 values each and use 5-fold CV. How many fits does a full grid search need?", options: ["15", "75", "125", "625"], answer: 3, why: "5 × 5 × 5 = 125 combinations, each fitted 5 times: 625 fits. That is why random search is popular." } },
        ],
      },
    ],
  },
  {
    slug: "feature-engineering",
    group: "Workflow",
    title: "Feature Engineering: Missing Values, Encoding & Transforms",
    summary: "Turn raw columns into numbers a model can learn from, without leaking information.",
    learnHref: "/workbench",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Feature engineering fills gaps, converts categories and text to numbers, and reshapes skewed or raw values so the model can see the patterns that matter." } },
          { p: "Most models only accept complete numeric matrices. Real data has blanks, text categories, dates and wildly skewed values. Good features often improve results more than switching models does." },
        ],
      },
      {
        heading: "Missing values",
        blocks: [
          {
            table: {
              head: ["Strategy", "How", "Use when"],
              rows: [
                ["Drop rows", "Remove rows with blanks", "Very few missing, missing at random"],
                ["Mean / median", "Fill with the training column's mean or median", "Numeric; median if skewed or outliers"],
                ["Most frequent / 'Unknown'", "Fill with the mode or a new category", "Categorical"],
                ["Model-based (KNN, iterative)", "Predict the blank from other columns", "Strong relationships between columns"],
                ["Missing indicator", "Add a 0/1 'was missing' column", "When missingness itself carries information"],
              ],
            },
          },
        ],
      },
      {
        heading: "Encoding categories",
        blocks: [
          {
            table: {
              head: ["Encoding", "Example", "Use when", "Watch out"],
              rows: [
                ["One-hot", "city → is_Mysuru, is_Bengaluru, is_Pune", "Nominal (no order), few categories", "Many categories → many columns"],
                ["Ordinal", "S, M, L → 0, 1, 2", "Categories with a real order", "Never on unordered categories for linear models"],
                ["Target encoding", "city → mean target for that city", "High-cardinality columns", "Leaks unless computed out-of-fold"],
                ["Frequency", "city → share of rows", "Quick baseline for many categories", "Different categories can collide"],
              ],
            },
          },
        ],
      },
      {
        heading: "Transforms and new features",
        blocks: [
          {
            list: [
              "**Log** (`log1p`) for right-skewed values like income, prices and counts: compresses the long tail so a few huge values do not dominate.",
              "**Binning** turns a number into ranges (age groups) when the effect is step-like.",
              "**Date parts**: day of week, month, hour, 'is weekend', days since an event.",
              "**Ratios and interactions**: price per m², clicks per visit, $x_1 \\times x_2$.",
              "**Clipping** extreme outliers to a percentile (e.g. 1st–99th).",
            ],
          },
          { math: r`x' = \ln(1 + x) \qquad \text{e.g. } 10^2 \to 4.6,\;\; 10^5 \to 11.5` },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "A small student table: age = [22, 25, missing, 30, 41], city = [Mysuru, Pune, Mysuru, Bengaluru, Pune], size of hostel room = [S, L, M, M, S]." },
          {
            steps: [
              { title: "Impute age", body: "Median of the known training values [22, 25, 30, 41] is 27.5 (the mean, 29.5, is pulled up by 41).", math: r`\text{median} = \tfrac{25 + 30}{2} = 27.5` },
              { title: "One-hot the city", body: "Three columns; each row has a single 1. Mysuru becomes [1, 0, 0]. For linear models, drop one column to avoid perfect collinearity (drop='first')." },
              { title: "Ordinal-encode room size", body: "S, M, L have a real order, so map to 0, 1, 2. The row sizes become [0, 2, 1, 1, 0]." },
              { title: "Freeze the numbers", body: "27.5, the city list and the S/M/L map are learned from training data and reused unchanged on validation and test rows. A city never seen in training should map to all zeros (handle_unknown='ignore')." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "scaling", caption: "After encoding, numeric features still need comparable scales for distance- and gradient-based models." }],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.compose import ColumnTransformer
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler, FunctionTransformer
from sklearn.linear_model import LogisticRegression
import numpy as np

numeric = make_pipeline(SimpleImputer(strategy="median"), StandardScaler())
skewed = make_pipeline(SimpleImputer(strategy="median"), FunctionTransformer(np.log1p), StandardScaler())
nominal = make_pipeline(SimpleImputer(strategy="most_frequent"), OneHotEncoder(handle_unknown="ignore"))
ordinal = OrdinalEncoder(categories=[["S", "M", "L"]])

prep = ColumnTransformer([
    ("num", numeric, ["age"]), ("skew", skewed, ["income"]),
    ("cat", nominal, ["city"]), ("ord", ordinal, ["room_size"])])
model = make_pipeline(prep, LogisticRegression()).fit(X_train, y_train)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Imputing or encoding with statistics from the full dataset", fix: "Fit imputers and encoders on training data only, inside a pipeline." },
              { mistake: "Label-encoding unordered categories for a linear model", fix: "The model would read Pune > Mysuru as meaningful. Use one-hot." },
              { mistake: "Target encoding without folds", fix: "Each row's own target leaks into its feature. Use out-of-fold (TargetEncoder with cross-fitting)." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "A 'pincode' column has 15,000 distinct values. Which encoding is usually the most practical?", options: ["One-hot", "Ordinal 0 to 14,999", "Out-of-fold target or frequency encoding", "Drop all rows with rare pincodes"], answer: 2, why: "One-hot creates 15,000 sparse columns and ordinal invents a fake order. Target or frequency encoding gives one informative column; out-of-fold fitting prevents leakage." } },
        ],
      },
    ],
  },
  {
    slug: "imbalanced-data",
    group: "Workflow",
    title: "Imbalanced Data",
    summary: "When one class is rare: the right metrics, class weights, resampling and threshold choice.",
    learnHref: "/workbench",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "When the class you care about is rare, accuracy becomes meaningless, so you change how you measure, how much each mistake costs during training, and where you set the decision threshold." } },
          { p: "Fraud, disease and equipment failure are often 1% or less of the data. A model can reach 99% accuracy by never predicting the rare class, which is useless. The fixes work at three levels: the metric, the training, and the threshold." },
        ],
      },
      {
        heading: "Toolbox",
        blocks: [
          {
            table: {
              head: ["Level", "Technique", "Idea"],
              rows: [
                ["Metric", "Precision, recall, F1, PR-AUC", "Measure performance on the rare class directly"],
                ["Training", "Class weights", "Make mistakes on the rare class cost more in the loss"],
                ["Training", "Random oversampling / SMOTE", "Show the model more minority examples"],
                ["Training", "Undersampling", "Drop some majority rows (faster, loses data)"],
                ["Prediction", "Threshold moving", "Flag at a probability lower than 0.5"],
              ],
            },
          },
          { p: "Balanced class weights (scikit-learn's `class_weight='balanced'`) for $K$ classes:" },
          { math: r`w_k = \frac{n}{K \cdot n_k}` },
          { p: "**SMOTE** creates a synthetic minority point on the line between a minority point and one of its minority neighbours:" },
          { math: r`\mathbf{x}_{\text{new}} = \mathbf{x}_i + \lambda\,(\mathbf{x}_{\text{nn}} - \mathbf{x}_i), \qquad \lambda \sim U(0, 1)` },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "1,000 transactions, 10 of them fraud (1%)." },
          {
            steps: [
              { title: "The useless baseline", body: "Predict 'not fraud' every time: 990/1000 = 99% accuracy, 0% recall. Any model must beat this on recall and PR-AUC, not accuracy." },
              { title: "Class weights", body: "Each fraud mistake now counts about 100 times as much as a normal one.", math: r`w_{\text{fraud}} = \frac{1000}{2 \times 10} = 50, \qquad w_{\text{normal}} = \frac{1000}{2 \times 990} \approx 0.505` },
              { title: "PR-AUC baseline", body: "A random classifier's average precision equals the positive rate, here 0.01. A PR-AUC of 0.30 is therefore 30× better than random, even though it sounds low." },
              { title: "Pick the threshold", body: "On validation data, choose the threshold that meets the business need, e.g. the highest precision with recall ≥ 0.8, then freeze it for the test set." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "confusion", caption: "Set true negatives to 190 and true positives to 1: accuracy looks high while recall tells the real story." }],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, precision_recall_curve
from imblearn.pipeline import make_pipeline as make_imb_pipeline   # pip install imbalanced-learn
from imblearn.over_sampling import SMOTE
import numpy as np

weighted = LogisticRegression(class_weight="balanced", max_iter=1000).fit(X_train, y_train)

smote = make_imb_pipeline(SMOTE(random_state=0), LogisticRegression(max_iter=1000))
smote.fit(X_train, y_train)                 # SMOTE runs on training data only

p = weighted.predict_proba(X_val)[:, 1]
print(average_precision_score(y_val, p))
prec, rec, thr = precision_recall_curve(y_val, p)
best = thr[np.argmax(np.where(rec[:-1] >= 0.8, prec[:-1], 0))]   # threshold for recall >= 0.8`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Oversampling before the train/test split", fix: "Copies of test rows leak into training. Resample inside the training fold only (imblearn pipeline)." },
              { mistake: "Balancing the test set", fix: "Evaluate on the real class ratio, or the scores will not match production." },
              { mistake: "Using ROC-AUC alone for very rare positives", fix: "ROC can look great while precision is terrible. Check PR-AUC too." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "With class_weight='balanced', 900 negatives and 100 positives, what weight does a positive example get?", options: ["0.1", "1", "5", "9"], answer: 2, why: "w = n / (K · n_k) = 1000 / (2 × 100) = 5. Negatives get 1000 / 1800 ≈ 0.56." } },
        ],
      },
    ],
  },
];
