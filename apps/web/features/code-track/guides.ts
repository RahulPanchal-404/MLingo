import type { GuideModule } from "./types";

const r = String.raw;

/** Code track modules that are not tied to one theory topic. Every Python program is run when this file is built; its output is appended. */
export const GUIDE_MODULES: Record<string, GuideModule> = {
  setup: {
    slug: "setup",
    title: "Set up your machine",
    summary: "Install Python, create an isolated environment, install the core libraries and check that everything works.",
    sections: [
      {
        heading: "What you need",
        blocks: [
          { p: "Every ML project in this track uses the same small toolset. Install it once, in its own environment, so one project's library versions never break another." },
          { table: { head: ["Tool", "What it is for"], rows: [
            ["Python 3.11 or newer", "The language. Download from python.org, or use the version your system provides."],
            ["venv", "Creates an isolated folder of libraries for one project. Built into Python."],
            ["NumPy, pandas", "Arrays and tables: loading, cleaning and reshaping data."],
            ["scikit-learn", "Preprocessing, models, cross-validation, metrics and pipelines."],
            ["matplotlib", "Plots for exploring data and checking models."],
            ["JupyterLab (optional)", "Notebooks for exploring. Final code goes in .py files."],
            ["PyTorch (later)", "Neural networks, from Part 7 onwards."],
          ] } },
        ],
      },
      {
        heading: "Create a project environment",
        blocks: [
          { program: {
            goal: "Create the folder and environment, then install the libraries",
            lang: "terminal",
            code: r`mkdir churn-model && cd churn-model
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
pip install numpy pandas scikit-learn matplotlib jupyterlab
pip freeze > requirements.txt`,
            walk: [
              { line: "python -m venv .venv", say: "Create an environment in a hidden `.venv` folder inside the project." },
              { line: "source .venv/bin/activate", say: "Switch the terminal to that environment. Your prompt shows `(.venv)` while it is active." },
              { line: "pip install numpy pandas scikit-learn matplotlib jupyterlab", say: "Install the libraries into this project only." },
              { line: "pip freeze > requirements.txt", say: "Record the exact versions. Anyone can rebuild the same environment with `pip install -r requirements.txt`." },
            ],
          } },
          { list: [
            "Add `.venv/` to `.gitignore`; commit `requirements.txt`, never the environment folder.",
            "One environment per project. Do not install ML libraries into the system Python.",
            "If you use conda instead of venv, the idea is the same: one named environment per project with a pinned file (`environment.yml`).",
          ] },
        ],
      },
      {
        heading: "Check the installation",
        blocks: [
          { program: {
            goal: "Print the version of every library",
            code: r`import sys
import importlib.metadata as md

print("Python", sys.version.split()[0])
for pkg in ["numpy", "pandas", "scikit-learn", "matplotlib", "scipy"]:
    try:
        print(f"{pkg:13s} {md.version(pkg)}")
    except md.PackageNotFoundError:
        print(f"{pkg:13s} not installed: pip install {pkg}")

# Output:
# Python 3.13.18
# numpy         2.5.3
# pandas        3.0.5
# scikit-learn  1.9.1
# matplotlib    3.11.2
# scipy         1.18.1`,
            walk: [
              { line: "import importlib.metadata as md", say: "The standard way to read an installed package's version." },
              { line: "print(f\"{pkg:13s} {md.version(pkg)}\")", say: "Print each version. Include these numbers when you report a bug or share results." },
              { line: "print(f\"{pkg:13s} not installed: pip install {pkg}\")", say: "A missing package tells you the exact command to fix it." },
            ],
          } },
        ],
      },
    ],
  },

  "first-model": {
    slug: "first-model",
    title: "Your first model, end to end",
    summary: "The complete workflow in one short program: load, split, build a pipeline, cross-validate, test once, save and predict.",
    sections: [
      {
        heading: "The workflow every project follows",
        blocks: [
          { list: [
            "**Load** the data and look at it: shape, types, target balance.",
            "**Split** off a test set first, before any decisions are made.",
            "**Build a pipeline**: preprocessing steps and the model as one object.",
            "**Cross-validate** on the training part to compare and tune.",
            "**Test once** at the end, on data the model has never seen.",
            "**Save** the fitted pipeline and **predict** on new rows with it.",
          ] },
        ],
      },
      {
        heading: "The program",
        blocks: [
          { program: {
            goal: "A complete classification project in about 20 lines",
            code: r`import joblib
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

SEED = 42

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
print("rows, columns:", X.shape, "| classes:", y.value_counts().to_dict())

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=SEED)

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
scores = cross_val_score(model, X_train, y_train, cv=5)
print(f"cross-validation accuracy: {scores.mean():.3f} ± {scores.std():.3f}")

model.fit(X_train, y_train)
print(classification_report(y_test, model.predict(X_test), digits=3))

joblib.dump(model, "model.joblib")
reloaded = joblib.load("model.joblib")
print("prediction for one new row:", reloaded.predict(X_test.head(1))[0])

# Output:
# rows, columns: (569, 30) | classes: {1: 357, 0: 212}
# cross-validation accuracy: 0.980 ± 0.013
#               precision    recall  f1-score   support
# 
#            0      0.976     0.976     0.976        42
#            1      0.986     0.986     0.986        72
# 
#     accuracy                          0.982       114
#    macro avg      0.981     0.981     0.981       114
# weighted avg      0.982     0.982     0.982       114
# 
# prediction for one new row: 0`,
            walk: [
              { line: "SEED = 42", say: "One fixed seed used everywhere, so the split and results are the same every time you run the code." },
              { line: "X, y = load_breast_cancer(return_X_y=True, as_frame=True)", say: "`X` is a table of 30 measurements per tumour, `y` the label. `as_frame=True` keeps column names." },
              { line: "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=SEED)", say: "Hold back 20% as the test set. `stratify=y` keeps the same class mix in both parts." },
              { line: "model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))", say: "Scaling and the model in one pipeline: the scaler only ever learns from training rows." },
              { line: "scores = cross_val_score(model, X_train, y_train, cv=5)", say: "Five-fold cross-validation on training data: the number you use to compare and tune models." },
              { line: "print(classification_report(y_test, model.predict(X_test), digits=3))", say: "The final check on the test set: precision, recall and F1 per class." },
              { line: "joblib.dump(model, \"model.joblib\")", say: "Save the whole fitted pipeline (scaler + model) to one file." },
              { line: "print(\"prediction for one new row:\", reloaded.predict(X_test.head(1))[0])", say: "Load it back and predict. New data goes through exactly the same preprocessing." },
            ],
          } },
          { callout: { title: "The rule behind every step", body: "Nothing the model learns from (means, scales, categories, chosen settings) may come from the test set. Pipelines plus a single final test enforce this." } },
        ],
      },
    ],
  },

  "project-structure": {
    slug: "project-structure",
    title: "How a real ML project is organised",
    summary: "Folders, scripts instead of one long notebook, a config, logging and reproducible runs.",
    sections: [
      {
        heading: "Folder layout",
        blocks: [
          { program: {
            goal: "A layout that scales from a weekend project to a team",
            lang: "text",
            code: r`churn-model/
├── data/
│   ├── raw/            original files, never edited
│   └── processed/      outputs of your cleaning code
├── notebooks/          exploration only
├── src/
│   ├── data.py         load and clean
│   ├── features.py     preprocessing pipeline
│   ├── train.py        fit, evaluate, save
│   └── predict.py      load the saved model, predict on new data
├── models/             saved model files (not in git)
├── tests/              small tests for data and features
├── requirements.txt
└── README.md`,
            walk: [
              { line: "│   ├── raw/            original files, never edited", say: "Keep the original data untouched. Every change is made by code, so it can be repeated." },
              { line: "├── notebooks/          exploration only", say: "Notebooks are for looking around. Anything you rely on moves into `src/`." },
              { line: "│   ├── train.py        fit, evaluate, save", say: "Training is one script you can rerun with one command." },
              { line: "│   └── predict.py      load the saved model, predict on new data", say: "Prediction code is separate, because it is what runs in production." },
            ],
          } },
        ],
      },
      {
        heading: "A training script with a config",
        blocks: [
          { program: {
            goal: "src/train.py: settings in one place, logging, saved model, metrics as JSON",
            code: r`import argparse
import json
import logging
from dataclasses import asdict, dataclass

import joblib
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("train")


@dataclass
class Config:
    seed: int = 42
    test_size: float = 0.2
    n_estimators: int = 300
    max_depth: int | None = None
    model_path: str = "model.joblib"


def load_data():
    return load_breast_cancer(return_X_y=True, as_frame=True)


def train(cfg: Config) -> dict:
    X, y = load_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=cfg.test_size, stratify=y, random_state=cfg.seed)
    model = RandomForestClassifier(n_estimators=cfg.n_estimators, max_depth=cfg.max_depth,
                                   random_state=cfg.seed, n_jobs=-1)
    model.fit(X_train, y_train)
    metrics = {"test_f1": round(f1_score(y_test, model.predict(X_test)), 4)}
    joblib.dump(model, cfg.model_path)
    log.info("saved model to %s", cfg.model_path)
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--n-estimators", type=int, default=300)
    parser.add_argument("--max-depth", type=int, default=None)
    args = parser.parse_args([])
    cfg = Config(n_estimators=args.n_estimators, max_depth=args.max_depth)
    result = train(cfg)
    print(json.dumps({"config": asdict(cfg), "metrics": result}, indent=2))

# Output:
# {
#   "config": {
#     "seed": 42,
#     "test_size": 0.2,
#     "n_estimators": 300,
#     "max_depth": null,
#     "model_path": "model.joblib"
#   },
#   "metrics": {
#     "test_f1": 0.9583
#   }
# }`,
            walk: [
              { line: "class Config:", say: "Every setting of the run in one object. Change a value here, not deep inside the code." },
              { line: "def load_data():", say: "Small functions with one job each: easy to test and reuse." },
              { line: "model = RandomForestClassifier(n_estimators=cfg.n_estimators, max_depth=cfg.max_depth,", say: "The model reads its settings from the config." },
              { line: "log.info(\"saved model to %s\", cfg.model_path)", say: "Use `logging` rather than `print` for messages about the run." },
              { line: "args = parser.parse_args([])", say: "Command-line options, e.g. `python src/train.py --max-depth 8`. (Empty list here only so the page can run it.)" },
              { line: "print(json.dumps({\"config\": asdict(cfg), \"metrics\": result}, indent=2))", say: "Save or print the config together with the metrics, so every result can be traced to its settings." },
            ],
          } },
          { list: [
            "Fix seeds (`random_state`) for splits and models.",
            "Pin library versions in `requirements.txt`.",
            "Record each run's config and metrics (a JSON file per run, or a tool such as MLflow).",
            "Write tests for the parts that silently break: column names, data types, value ranges.",
          ] },
        ],
      },
    ],
  },

  "load-inspect": {
    slug: "load-inspect",
    title: "Load and inspect a dataset",
    summary: "The first ten minutes with any dataset: shape, types, summary statistics, missing values, duplicates and target balance.",
    sections: [
      {
        heading: "What to look at first",
        blocks: [
          { table: { head: ["Check", "Code", "What you are looking for"], rows: [
            ["Size", "`df.shape`", "Enough rows for the model you have in mind?"],
            ["Types", "`df.dtypes`", "Numbers stored as text, dates not parsed, IDs read as numbers."],
            ["Summary", "`df.describe()`", "Impossible values (negative age), huge maximums, constant columns."],
            ["Missing", "`df.isna().sum()`", "Which columns have gaps and how many."],
            ["Duplicates", "`df.duplicated().sum()`", "Repeated rows that would leak between train and test."],
            ["Categories", "`df[col].value_counts()`", "Spelling variants, rare levels, unexpected values."],
            ["Target", "`y.value_counts(normalize=True)`", "Class imbalance, which changes metrics and methods."],
          ] } },
        ],
      },
      {
        heading: "Inspect a small customer table",
        blocks: [
          { program: {
            goal: "Load a CSV and run the first checks",
            code: r`import io

import pandas as pd

csv = io.StringIO("""customer_id,age,city,plan,monthly_spend,signup_date,churned
1,34,Mysuru,basic,499,2025-01-14,0
2,,Bengaluru,premium,1299,2025-02-03,0
3,51,Pune,basic,,2025-02-11,1
4,29,bengaluru,Premium,1199,2025-03-01,0
5,42,Mysuru,basic,449,2025-03-19,1
5,42,Mysuru,basic,449,2025-03-19,1
6,-3,Delhi,basic,520,2025-04-02,0
7,38,Pune,premium,25000,2025-04-20,0
""")
df = pd.read_csv(csv, parse_dates=["signup_date"])

print(df.shape)
print(df.dtypes.to_string())
print(df.head(3).to_string())
print(df.describe().round(1).to_string())
print("missing per column:", df.isna().sum()[df.isna().sum() > 0].to_dict())
print("duplicate rows:", df.duplicated().sum())
print("city values:", df["city"].value_counts().to_dict())
print("target balance:", df["churned"].value_counts(normalize=True).round(2).to_dict())

# Output:
# (8, 7)
# customer_id               int64
# age                     float64
# city                        str
# plan                        str
# monthly_spend           float64
# signup_date      datetime64[us]
# churned                   int64
#    customer_id   age       city     plan  monthly_spend signup_date  churned
# 0            1  34.0     Mysuru    basic          499.0  2025-01-14        0
# 1            2   NaN  Bengaluru  premium         1299.0  2025-02-03        0
# 2            3  51.0       Pune    basic            NaN  2025-02-11        1
#        customer_id   age  monthly_spend          signup_date  churned
# count          8.0   7.0            7.0                    8      8.0
# mean           4.1  33.3         4202.1  2025-03-04 12:00:00      0.4
# min            1.0  -3.0          449.0  2025-01-14 00:00:00      0.0
# 25%            2.8  31.5          474.0  2025-02-09 00:00:00      0.0
# 50%            4.5  38.0          520.0  2025-03-10 00:00:00      0.0
# 75%            5.2  42.0         1249.0  2025-03-22 12:00:00      1.0
# max            7.0  51.0        25000.0  2025-04-20 00:00:00      1.0
# std            2.0  17.4         9178.2                  NaN      0.5
# missing per column: {'age': 1, 'monthly_spend': 1}
# duplicate rows: 1
# city values: {'Mysuru': 3, 'Pune': 2, 'Bengaluru': 1, 'bengaluru': 1, 'Delhi': 1}
# target balance: {0: 0.62, 1: 0.38}`,
            walk: [
              { line: "df = pd.read_csv(csv, parse_dates=[\"signup_date\"])", say: "Read the file and turn the date column into real dates. With a file on disk, pass its path instead of `csv`." },
              { line: "print(df.dtypes.to_string())", say: "Every column's type. Check that numbers are numbers and dates are dates." },
              { line: "print(df.describe().round(1).to_string())", say: "Count, mean, quartiles and extremes. Age −3 and spend 25,000 stand out." },
              { line: "print(\"missing per column:\", df.isna().sum()[df.isna().sum() > 0].to_dict())", say: "Only the columns that have gaps." },
              { line: "print(\"duplicate rows:\", df.duplicated().sum())", say: "Customer 5 appears twice." },
              { line: "print(\"city values:\", df[\"city\"].value_counts().to_dict())", say: "\"Bengaluru\" and \"bengaluru\" are the same city written two ways." },
            ],
          } },
          { p: "Nothing is fixed yet. First write down every problem; the next module fixes them in code." },
        ],
      },
    ],
  },

  "data-quality": {
    slug: "data-quality",
    title: "Check and clean data quality",
    summary: "An automatic quality report, then a cleaning function that fixes duplicates, spelling variants and impossible values.",
    sections: [
      {
        heading: "A reusable quality report",
        blocks: [
          { program: {
            goal: "Flag constant columns, extreme values, spelling variants and possible leakage",
            code: r`import numpy as np
import pandas as pd


def quality_report(df: pd.DataFrame, target: str) -> pd.DataFrame:
    rows = []
    for col in df.columns.drop(target):
        s = df[col]
        row = {"column": col, "dtype": str(s.dtype), "missing_%": round(s.isna().mean() * 100, 1),
               "unique": s.nunique(), "flag": ""}
        if s.nunique() <= 1:
            row["flag"] = "constant: drop"
        elif pd.api.types.is_numeric_dtype(s):
            q1, q3 = s.quantile([0.25, 0.75])
            outliers = ((s < q1 - 3 * (q3 - q1)) | (s > q3 + 3 * (q3 - q1))).sum()
            corr = abs(s.corr(df[target]))
            if corr > 0.95:
                row["flag"] = f"corr with target {corr:.2f}: check for leakage"
            elif outliers:
                row["flag"] = f"{outliers} extreme values"
        elif s.str.lower().nunique() < s.nunique():
            row["flag"] = "same category written differently"
        rows.append(row)
    return pd.DataFrame(rows)


rng = np.random.default_rng(0)
n = 200
df = pd.DataFrame({
    "age": rng.integers(18, 70, n).astype(float),
    "spend": rng.lognormal(6, 0.5, n),
    "city": rng.choice(["Pune", "pune", "Mysuru"], n),
    "country": "IN",
    "churned": rng.integers(0, 2, n),
})
df.loc[:20, "age"] = np.nan
df.loc[5, "spend"] = 1e6
df["days_since_cancel"] = df["churned"] * 15 + rng.normal(0, 0.5, n)
print(quality_report(df, "churned").to_string(index=False))
print("duplicate rows:", df.duplicated().sum())

# Output:
#            column   dtype  missing_%  unique                                     flag
#               age float64       10.5      50                                         
#             spend float64        0.0     200                         4 extreme values
#              city     str        0.0       3        same category written differently
#           country     str        0.0       1                           constant: drop
# days_since_cancel float64        0.0     200 corr with target 1.00: check for leakage
# duplicate rows: 0`,
            walk: [
              { line: "def quality_report(df: pd.DataFrame, target: str) -> pd.DataFrame:", say: "One function you can run on every new dataset and every new batch of data." },
              { line: "row[\"flag\"] = \"constant: drop\"", say: "A column with one value carries no information." },
              { line: "outliers = ((s < q1 - 3 * (q3 - q1)) | (s > q3 + 3 * (q3 - q1))).sum()", say: "Count values far outside the middle half of the data (3 × IQR fences)." },
              { line: "row[\"flag\"] = f\"corr with target {corr:.2f}: check for leakage\"", say: "A feature that matches the target almost perfectly is usually information from after the outcome (here, days since cancelling)." },
              { line: "elif s.str.lower().nunique() < s.nunique():", say: "If lower-casing reduces the number of categories, the same value is spelled in different ways." },
            ],
          } },
        ],
      },
      {
        heading: "Clean in code, not by hand",
        blocks: [
          { program: {
            goal: "A cleaning function you can rerun on every new file",
            code: r`import io

import numpy as np
import pandas as pd

csv = io.StringIO("""customer_id,age,city,plan,monthly_spend,signup_date,churned
1,34,Mysuru,basic,499,2025-01-14,0
2,,Bengaluru,premium,1299,2025-02-03,0
3,51,Pune,basic,,2025-02-11,1
4,29,bengaluru ,Premium,1199,2025-03-01,0
5,42,Mysuru,basic,449,2025-03-19,1
5,42,Mysuru,basic,449,2025-03-19,1
6,-3,Delhi,basic,520,2025-04-02,0
7,38,Pune,premium,25000,2025-04-20,0
""")
df = pd.read_csv(csv, parse_dates=["signup_date"])


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates().copy()
    for col in ["city", "plan"]:
        df[col] = df[col].str.strip().str.title()
    df.loc[~df["age"].between(0, 110), "age"] = np.nan
    return df.set_index("customer_id")


tidy = clean(df)
print("rows before/after:", len(df), len(tidy))
print("cities:", sorted(tidy["city"].unique()), "| plans:", sorted(tidy["plan"].unique()))
print("ages:", tidy["age"].tolist())
print("very high spend is kept, but flagged for checking:", tidy.loc[tidy["monthly_spend"] > 20000, "monthly_spend"].to_dict())

# Output:
# rows before/after: 8 7
# cities: ['Bengaluru', 'Delhi', 'Mysuru', 'Pune'] | plans: ['Basic', 'Premium']
# ages: [34.0, nan, 51.0, 29.0, 42.0, nan, 38.0]
# very high spend is kept, but flagged for checking: {7: 25000.0}`,
            walk: [
              { line: "df = df.drop_duplicates().copy()", say: "Remove exact duplicate rows." },
              { line: "df[col] = df[col].str.strip().str.title()", say: "Trim spaces and fix capitalisation so \"bengaluru \" becomes \"Bengaluru\"." },
              { line: "df.loc[~df[\"age\"].between(0, 110), \"age\"] = np.nan", say: "An impossible age becomes missing, to be filled later by the pipeline, rather than silently kept." },
              { line: "print(\"very high spend is kept, but flagged for checking:\", tidy.loc[tidy[\"monthly_spend\"] > 20000, \"monthly_spend\"].to_dict())", say: "An extreme but possible value is kept. Ask whether it is real before removing it." },
            ],
          } },
          { table: { head: ["Problem", "Fix in cleaning", "Leave for the pipeline"], rows: [
            ["Duplicate rows", "Drop them", ""],
            ["Spelling variants", "Standardise text", ""],
            ["Impossible values", "Set to missing", "Filling the gaps"],
            ["Missing values", "", "Impute (fitted on training data)"],
            ["Extreme but possible values", "Investigate", "Robust scaling, log, or capping"],
          ] } },
          { callout: { title: "Where each fix belongs", body: "Fixes that use no statistics (spelling, duplicates, impossible values) go in the cleaning function. Fixes that learn from data (medians, scales, category lists) go in the pipeline, so they are fitted on training rows only." } },
        ],
      },
    ],
  },

  "missing-values": {
    slug: "missing-values",
    title: "Handle missing values",
    summary: "Drop, fill or model the gaps: which imputer to use, when a missing flag helps, and models that handle gaps themselves.",
    sections: [
      {
        heading: "Choose a strategy",
        blocks: [
          { table: { head: ["Situation", "Use", "Avoid"], rows: [
            ["A few rows missing, at random", "Dropping those rows is acceptable", "Dropping when it removes a large or specific group"],
            ["Numeric column, some gaps", "`SimpleImputer(strategy=\"median\")`", "Mean when the column has outliers"],
            ["Categorical column", "`strategy=\"most_frequent\"` or `\"constant\"` with `\"missing\"`", "Dropping the category"],
            ["The gap itself may mean something", "`add_indicator=True`", "Filling with no flag"],
            ["Columns strongly related to each other", "`KNNImputer` or `IterativeImputer`", "These on very large data (slow)"],
            ["Tree boosting models", "`HistGradientBoosting*` handles NaN natively", "Imputing first without reason"],
            ["A column that is mostly empty", "Consider dropping it, or just a missing flag", "Imputing 90% invented values"],
          ] } },
        ],
      },
      {
        heading: "Compare imputers on the same data",
        blocks: [
          { program: {
            goal: "Remove 20% of values, then compare filling strategies with cross-validation",
            code: r`import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.experimental import enable_iterative_imputer  # noqa: F401
from sklearn.impute import IterativeImputer, KNNImputer, SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_breast_cancer

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
rng = np.random.default_rng(0)
X = X.mask(rng.random(X.shape) < 0.2)
print(f"cells missing: {X.isna().mean().mean():.0%} | complete rows left if we drop: {X.dropna().shape[0]} of {len(X)}")

imputers = {
    "median": SimpleImputer(strategy="median"),
    "median + indicator": SimpleImputer(strategy="median", add_indicator=True),
    "KNN (k=5)": KNNImputer(n_neighbors=5),
    "iterative": IterativeImputer(max_iter=10, random_state=0),
}
for name, imp in imputers.items():
    model = make_pipeline(imp, StandardScaler(), LogisticRegression(max_iter=2000))
    print(f"{name:19s} CV accuracy {cross_val_score(model, X, y, cv=5).mean():.3f}")
print(f"{'no imputation (HGB)':19s} CV accuracy {cross_val_score(HistGradientBoostingClassifier(random_state=0), X, y, cv=5).mean():.3f}")

# Output:
# cells missing: 20% | complete rows left if we drop: 0 of 569
# median              CV accuracy 0.963
# median + indicator  CV accuracy 0.960
# KNN (k=5)           CV accuracy 0.960
# iterative           CV accuracy 0.979
# no imputation (HGB) CV accuracy 0.960`,
            walk: [
              { line: "X = X.mask(rng.random(X.shape) < 0.2)", say: "Blank out 20% of all cells at random, to simulate missing data." },
              { line: "print(f\"cells missing: {X.isna().mean().mean():.0%} | complete rows left if we drop: {X.dropna().shape[0]} of {len(X)}\")", say: "With 30 columns, almost no row is complete: dropping rows is not an option here." },
              { line: "\"median + indicator\": SimpleImputer(strategy=\"median\", add_indicator=True),", say: "Fill with the median and add a column saying the value was missing." },
              { line: "model = make_pipeline(imp, StandardScaler(), LogisticRegression(max_iter=2000))", say: "The imputer goes inside the pipeline, so its medians come from training folds only." },
              { line: "print(f\"{'no imputation (HGB)':19s} CV accuracy {cross_val_score(HistGradientBoostingClassifier(random_state=0), X, y, cv=5).mean():.3f}\")", say: "Gradient boosting accepts NaN directly and learns which way to send missing values." },
            ],
          } },
          { p: "Here the iterative imputer wins because the 30 measurements are strongly related. When the missing indicator does not help (as here, where gaps are random), the gap carries no information. On real data, gaps are often not random, and the indicator matters." },
        ],
      },
    ],
  },

  "numeric-features": {
    slug: "numeric-features",
    title: "Prepare numeric features",
    summary: "Skewed columns, outliers and scaling: what to apply, for which models, and when to leave numbers as they are.",
    sections: [
      {
        heading: "What each model needs",
        blocks: [
          { table: { head: ["Model family", "Scaling", "Skew and outliers"], rows: [
            ["Linear and logistic regression, SVM, KNN, neural networks, PCA, K-means", "Required", "Log or power transform long tails; robust scaling for outliers"],
            ["Decision trees, random forests, gradient boosting", "Not needed", "Usually not needed: splits only use the order of values"],
            ["Naive Bayes (Gaussian)", "Not needed", "Helps if a column is far from bell-shaped"],
          ] } },
        ],
      },
      {
        heading: "Transform a long-tailed column",
        blocks: [
          { program: {
            goal: "Log, power transform, capping and robust scaling on an income column",
            code: r`import numpy as np
import pandas as pd
from sklearn.preprocessing import FunctionTransformer, PowerTransformer, RobustScaler, StandardScaler

rng = np.random.default_rng(0)
income = pd.Series(rng.lognormal(10, 1, 1000), name="income")
income.iloc[0] = 5e7

print(f"raw: mean {income.mean():,.0f}, median {income.median():,.0f}, skew {income.skew():.1f}")
logged = np.log1p(income)
print(f"log1p: skew {logged.skew():.2f}")
yj = PowerTransformer(method="yeo-johnson").fit_transform(income.to_frame()).ravel()
print(f"Yeo-Johnson: skew {pd.Series(yj).skew():.2f}")

lo, hi = income.quantile([0.01, 0.99])
clipped = income.clip(lo, hi)
print(f"clipped to the 1st-99th percentile: max {clipped.max():,.0f}")

for scaler in [StandardScaler(), RobustScaler()]:
    z = scaler.fit_transform(income.to_frame()).ravel()
    print(f"{type(scaler).__name__:15s} typical value range {np.percentile(z, 5):.2f} to {np.percentile(z, 95):.2f}, outlier at {z[0]:.0f}")

# Output:
# raw: mean 83,569, median 20,439, skew 31.6
# log1p: skew 0.37
# Yeo-Johnson: skew -0.04
# clipped to the 1st-99th percentile: max 214,880
# StandardScaler  typical value range -0.05 to 0.01, outlier at 32
# RobustScaler    typical value range -0.53 to 2.67, outlier at 1668`,
            walk: [
              { line: "income.iloc[0] = 5e7", say: "Add one extreme value, as real income data often has." },
              { line: "logged = np.log1p(income)", say: "`log1p` = log(1 + x): works with zeros and pulls in the long right tail. Skew drops from 31.6 to 0.4." },
              { line: "yj = PowerTransformer(method=\"yeo-johnson\").fit_transform(income.to_frame()).ravel()", say: "A fitted power transform finds the best shape automatically and also works with negative values." },
              { line: "clipped = income.clip(lo, hi)", say: "Capping at the 1st and 99th percentiles keeps the row but limits its pull. Learn the limits on training data." },
              { line: "print(f\"{type(scaler).__name__:15s} typical value range {np.percentile(z, 5):.2f} to {np.percentile(z, 95):.2f}, outlier at {z[0]:.0f}\")", say: "StandardScaler squeezes normal values into a tiny range because the outlier inflates the spread; RobustScaler keeps them spread out." },
            ],
          } },
          { table: { head: ["Do this", "When", "Do not"], rows: [
            ["`np.log1p` or `PowerTransformer`", "Long right tail (income, counts, prices) and a linear or distance-based model", "Transform for tree models; it changes nothing for them"],
            ["`RobustScaler`", "Outliers you must keep", "Use min-max scaling when outliers exist"],
            ["Capping (`clip`)", "Extremes that are real but rare, for linear models", "Cap the target, or cap values that are the very events you predict"],
            ["Nothing", "Tree-based models", "Add preprocessing steps \"just in case\""],
          ] } },
        ],
      },
    ],
  },

  "categorical-features": {
    slug: "categorical-features",
    title: "Encode categorical features",
    summary: "One-hot, ordinal and target encoding; rare categories; and what happens when production data brings a category you never saw.",
    sections: [
      {
        heading: "Pick the encoder",
        blocks: [
          { table: { head: ["Column", "Encoder", "Why"], rows: [
            ["No natural order, few levels (city, colour)", "`OneHotEncoder(handle_unknown=\"ignore\")`", "One 0/1 column per level; no false order"],
            ["Real order (S < M < L, low < high)", "`OrdinalEncoder(categories=[[...]])`", "Keeps the order in one column; give the order explicitly"],
            ["Many levels (pincode, product ID)", "`TargetEncoder` or one-hot with `min_frequency`", "One-hot would create hundreds of sparse columns"],
            ["Tree models", "`OrdinalEncoder` is often enough", "Trees can split on arbitrary codes; or use HistGradientBoosting's `categorical_features`"],
          ] } },
        ],
      },
      {
        heading: "Encoders in practice",
        blocks: [
          { program: {
            goal: "Rare and unseen categories, ordered sizes, and a high-cardinality column",
            code: r`import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, TargetEncoder

train = pd.DataFrame({
    "city": ["Pune", "Mysuru", "Pune", "Delhi", "Mysuru", "Pune", "Agra", "Pune"],
    "size": ["S", "M", "L", "M", "S", "L", "M", "S"],
})
new = pd.DataFrame({"city": ["Pune", "Kochi"], "size": ["XL", "M"]})

ohe = OneHotEncoder(handle_unknown="infrequent_if_exist", min_frequency=2, sparse_output=False).fit(train[["city"]])
print("one-hot columns:", list(ohe.get_feature_names_out()))
print("new rows (Pune, unseen Kochi):\n", ohe.transform(new[["city"]]))

ordinal = OrdinalEncoder(categories=[["S", "M", "L"]], handle_unknown="use_encoded_value", unknown_value=-1)
print("ordinal sizes:", ordinal.fit(train[["size"]]).transform(new[["size"]]).ravel())

rng = np.random.default_rng(0)
many = pd.DataFrame({"pincode": rng.integers(560000, 560400, 2000).astype(str)})
y = (many["pincode"].astype(int) % 7 == 0).astype(int) | (rng.random(2000) < 0.1)
te = TargetEncoder(target_type="binary", random_state=0)
encoded = te.fit_transform(many, y)
print(f"{many['pincode'].nunique()} pincodes -> 1 column; encoded values range {encoded.min():.2f} to {encoded.max():.2f}")

# Output:
# one-hot columns: ['city_Mysuru', 'city_Pune', 'city_infrequent_sklearn']
# new rows (Pune, unseen Kochi):
#  [[0. 1. 0.]
#  [0. 0. 1.]]
# ordinal sizes: [-1.  1.]
# 398 pincodes -> 1 column; encoded values range 0.00 to 1.00`,
            walk: [
              { line: "ohe = OneHotEncoder(handle_unknown=\"infrequent_if_exist\", min_frequency=2, sparse_output=False).fit(train[[\"city\"]])", say: "Cities seen fewer than 2 times are grouped as \"infrequent\"; unseen cities in production go to the same column instead of crashing." },
              { line: "print(\"one-hot columns:\", list(ohe.get_feature_names_out()))", say: "Delhi and Agra (one row each) are merged into `city_infrequent_sklearn`." },
              { line: "ordinal = OrdinalEncoder(categories=[[\"S\", \"M\", \"L\"]], handle_unknown=\"use_encoded_value\", unknown_value=-1)", say: "Give the order explicitly. An unknown size (XL) becomes −1 instead of an error." },
              { line: "te = TargetEncoder(target_type=\"binary\", random_state=0)", say: "Replaces each pincode with a smoothed average of the target." },
              { line: "encoded = te.fit_transform(many, y)", say: "`fit_transform` uses internal cross-fitting, so a row's own label is never used to encode it. Always use it this way on training data." },
            ],
          } },
          { list: [
            "Never `pd.get_dummies` on the full dataset before splitting: train and test may get different columns, and you cannot handle new categories later.",
            "Ordinal codes (0, 1, 2) for an unordered column mislead linear and distance-based models.",
            "Check the number of columns after encoding with `get_feature_names_out()`.",
          ] },
        ],
      },
    ],
  },

  "text-data": {
    slug: "text-data",
    title: "Prepare text data",
    summary: "Turn text into numbers with TF-IDF, choose word or character n-grams, and build a text classifier pipeline.",
    sections: [
      {
        heading: "The standard text pipeline",
        blocks: [
          { list: [
            "**Normalise**: lower-case, replace numbers, strip symbols. Keep it simple; do not remove words that carry meaning (\"not\").",
            "**Vectorise**: `TfidfVectorizer` turns each text into weights for words (or character pieces) that are frequent in it but rare overall.",
            "**Model**: logistic regression or linear SVM are strong, fast baselines; Naive Bayes for very small data.",
            "**Upgrade** only if the baseline is not good enough: pretrained sentence embeddings or fine-tuned transformers.",
          ] },
        ],
      },
      {
        heading: "A support-ticket classifier",
        blocks: [
          { program: {
            goal: "Words, word pairs or character pieces: which handles new and misspelled messages?",
            code: r`import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

texts = [
    "Refund not received for my order", "I want my money back, order cancelled", "Charged twice, please refund",
    "Payment failed but amount deducted", "Refund status still pending after a week", "Return the money for the broken item",
    "App crashes when I open settings", "Login button does nothing on Android", "Screen goes blank after the update",
    "Cannot reset my password, the link is broken", "The app freezes on the payment page", "Notifications stopped working",
    "Where is my parcel?", "Delivery is late by three days", "Courier marked delivered but nothing arrived",
    "Track my shipment please", "Package stuck at the warehouse", "Wrong address on my delivery",
]
labels = ["billing"] * 6 + ["bug"] * 6 + ["delivery"] * 6
new_texts = ["money not refunded yet", "double charge on my card", "app keeps crashing",
             "password reset email never works", "my parcel is late", "order shows delivered but I have nothing"]
new_labels = ["billing", "billing", "bug", "bug", "delivery", "delivery"]


def normalise(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\d+", " NUM ", text)
    return re.sub(r"[^a-z\s]", " ", text)


for name, vec in [
    ("words", TfidfVectorizer(preprocessor=normalise)),
    ("words + pairs", TfidfVectorizer(preprocessor=normalise, ngram_range=(1, 2), sublinear_tf=True)),
    ("character 3-5 grams", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5))),
]:
    model = make_pipeline(vec, LogisticRegression(max_iter=2000)).fit(texts, labels)
    print(f"{name:20s} correct on 6 new messages: {(model.predict(new_texts) == new_labels).sum()}")

model = make_pipeline(TfidfVectorizer(preprocessor=normalise, ngram_range=(1, 2)), LogisticRegression(max_iter=2000)).fit(texts, labels)
for msg in ["refnd not recieved", "app keeps crashing", "parcel late"]:
    print(f"{msg!r} -> {model.predict([msg])[0]}")
vocab = model[0].get_feature_names_out()
coefs = model[-1].coef_[list(model[-1].classes_).index("bug")]
print("strongest 'bug' words:", [vocab[i] for i in coefs.argsort()[::-1][:5]])

# Output:
# words                correct on 6 new messages: 5
# words + pairs        correct on 6 new messages: 5
# character 3-5 grams  correct on 6 new messages: 6
# 'refnd not recieved' -> billing
# 'app keeps crashing' -> bug
# 'parcel late' -> delivery
# strongest 'bug' words: ['app', 'working', 'stopped', 'notifications', 'stopped working']`,
            walk: [
              { line: "def normalise(text: str) -> str:", say: "A small, predictable cleaning function, passed to the vectoriser so it runs the same way at training and prediction time." },
              { line: "(\"words + pairs\", TfidfVectorizer(preprocessor=normalise, ngram_range=(1, 2), sublinear_tf=True)),", say: "Adds two-word phrases (\"not working\"); `sublinear_tf` dampens repeated words." },
              { line: "(\"character 3-5 grams\", TfidfVectorizer(analyzer=\"char_wb\", ngram_range=(3, 5))),", say: "Pieces of 3–5 letters: robust to typos and word endings. It gets all 6 new messages right." },
              { line: "print(f\"{name:20s} correct on 6 new messages: {(model.predict(new_texts) == new_labels).sum()}\")", say: "Test on messages written differently from the training ones." },
              { line: "print(\"strongest 'bug' words:\", [vocab[i] for i in coefs.argsort()[::-1][:5]])", say: "Read the largest weights to check the model learned sensible words." },
            ],
          } },
          { table: { head: ["Setting", "Tune it when", "Leave it when"], rows: [
            ["`ngram_range`", "Phrases matter (\"not good\")", "Very little data: (1, 1) is safer"],
            ["`min_df` / `max_df`", "Vocabulary is huge or full of noise", "Small data: `min_df=2` may drop useful words"],
            ["`analyzer=\"char_wb\"`", "Typos, short texts, many word forms", "Long clean documents: words are enough"],
            ["`C` of the classifier", "Always, with cross-validation", ""],
          ] } },
          { p: "With real data, split so that near-identical messages (same customer, same template) are not in both train and test." },
        ],
      },
    ],
  },

  "dates-time-series": {
    slug: "dates-time-series",
    title: "Dates and time series",
    summary: "Calendar features, lags and rolling averages without peeking at the future, and validation that respects time.",
    sections: [
      {
        heading: "Rules for time data",
        blocks: [
          { list: [
            "Every feature must be known **at the moment of prediction**. Yesterday's sales: yes. Today's actual weather: no, unless you predict after the day.",
            "Lags and rolling windows use `shift` so a row never sees its own target.",
            "Validate with `TimeSeriesSplit`: always train on the past and test on the future. Never shuffle.",
            "Always compare with a naive forecast (same value as last week). Many models do not beat it.",
          ] },
        ],
      },
      {
        heading: "Forecast daily demand",
        blocks: [
          { program: {
            goal: "Calendar, cyclical, lag and rolling features with time-based validation",
            code: r`import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import TimeSeriesSplit

rng = np.random.default_rng(0)
days = pd.date_range("2024-01-01", periods=730, freq="D")
demand = 100 + 20 * np.sin(2 * np.pi * days.dayofyear / 365) + 15 * (days.dayofweek >= 5) + np.arange(730) * 0.05 + rng.normal(0, 5, 730)
df = pd.DataFrame({"date": days, "demand": demand})


def make_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["dow"] = out["date"].dt.dayofweek
    out["is_weekend"] = (out["dow"] >= 5).astype(int)
    out["doy_sin"] = np.sin(2 * np.pi * out["date"].dt.dayofyear / 365)
    out["doy_cos"] = np.cos(2 * np.pi * out["date"].dt.dayofyear / 365)
    out["lag_7"] = out["demand"].shift(7)
    out["rolling_mean_7"] = out["demand"].shift(1).rolling(7).mean()
    return out.dropna()


data = make_features(df)
features = ["dow", "is_weekend", "doy_sin", "doy_cos", "lag_7", "rolling_mean_7"]
X, y = data[features], data["demand"]

model_mae, naive_mae = [], []
for train_idx, test_idx in TimeSeriesSplit(n_splits=5, test_size=60).split(X):
    model = HistGradientBoostingRegressor(random_state=0).fit(X.iloc[train_idx], y.iloc[train_idx])
    model_mae.append(mean_absolute_error(y.iloc[test_idx], model.predict(X.iloc[test_idx])))
    naive_mae.append(mean_absolute_error(y.iloc[test_idx], X["lag_7"].iloc[test_idx]))
print("model MAE per fold:      ", np.round(model_mae, 1))
print("same-day-last-week MAE:  ", np.round(naive_mae, 1))
print("last training day of fold 1:", data["date"].iloc[next(TimeSeriesSplit(n_splits=5, test_size=60).split(X))[0][-1]].date())

# Output:
# model MAE per fold:       [8.  4.4 5.6 5.2 4.9]
# same-day-last-week MAE:   [5.5 5.2 5.2 6.5 5.2]
# last training day of fold 1: 2025-03-05`,
            walk: [
              { line: "out[\"is_weekend\"] = (out[\"dow\"] >= 5).astype(int)", say: "Calendar features from the date itself are always known in advance." },
              { line: "out[\"doy_sin\"] = np.sin(2 * np.pi * out[\"date\"].dt.dayofyear / 365)", say: "Day of year on a circle, so 31 December and 1 January are neighbours." },
              { line: "out[\"lag_7\"] = out[\"demand\"].shift(7)", say: "Demand on the same day last week." },
              { line: "out[\"rolling_mean_7\"] = out[\"demand\"].shift(1).rolling(7).mean()", say: "`shift(1)` first, so the average covers the 7 days *before* today and never includes today's answer." },
              { line: "for train_idx, test_idx in TimeSeriesSplit(n_splits=5, test_size=60).split(X):", say: "Five folds, each testing the next 60 days after its training period." },
              { line: "naive_mae.append(mean_absolute_error(y.iloc[test_idx], X[\"lag_7\"].iloc[test_idx]))", say: "The naive forecast to beat. In fold 1 the model loses: it has not yet seen a full year of seasons." },
            ],
          } },
        ],
      },
    ],
  },

  "image-data": {
    slug: "image-data",
    title: "Prepare image data",
    summary: "Images as arrays, scaling pixels, flattening for classic models, and why convolutional networks exist.",
    sections: [
      {
        heading: "From pixels to features",
        blocks: [
          { program: {
            goal: "Classify 8 × 8 digit images, then see how fragile flattened pixels are",
            code: r`import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

digits = load_digits()
print("images:", digits.images.shape, "| pixel values", digits.images.min(), "to", digits.images.max())

X = digits.images.reshape(len(digits.images), -1) / 16.0
X_train, X_test, y_train, y_test = train_test_split(X, digits.target, test_size=0.25, stratify=digits.target, random_state=0)
print("flattened:", X.shape)

for name, model in [("logistic regression", LogisticRegression(max_iter=2000)), ("SVM (rbf)", SVC(gamma="scale"))]:
    print(f"{name:20s} test accuracy {model.fit(X_train, y_train).score(X_test, y_test):.3f}")

shifted = np.roll(digits.images[:, :, :], 1, axis=2).reshape(len(X), -1) / 16.0
_, X_shift_test, _, _ = train_test_split(shifted, digits.target, test_size=0.25, stratify=digits.target, random_state=0)
print("SVM on the same test images moved 1 pixel right:", round(SVC(gamma="scale").fit(X_train, y_train).score(X_shift_test, y_test), 3))

# Output:
# images: (1797, 8, 8) | pixel values 0.0 to 16.0
# flattened: (1797, 64)
# logistic regression  test accuracy 0.969
# SVM (rbf)            test accuracy 0.987
# SVM on the same test images moved 1 pixel right: 0.509`,
            walk: [
              { line: "print(\"images:\", digits.images.shape, \"| pixel values\", digits.images.min(), \"to\", digits.images.max())", say: "1,797 images of 8 × 8 pixels, each pixel 0 to 16." },
              { line: "X = digits.images.reshape(len(digits.images), -1) / 16.0", say: "Flatten each image into 64 numbers and scale pixels to 0–1." },
              { line: "(\"SVM (rbf)\", SVC(gamma=\"scale\"))", say: "On small, centred images, classic models work well: about 99% accuracy." },
              { line: "shifted = np.roll(digits.images[:, :, :], 1, axis=2).reshape(len(X), -1) / 16.0", say: "Move every test image one pixel to the right." },
              { line: "print(\"SVM on the same test images moved 1 pixel right:\", round(SVC(gamma=\"scale\").fit(X_train, y_train).score(X_shift_test, y_test), 3))", say: "Accuracy collapses to about 50%: flattened pixels have no idea that neighbouring pixels belong together." },
            ],
          } },
          { table: { head: ["Situation", "Use"], rows: [
            ["Small, aligned images (digits, icons)", "Scaled, flattened pixels with SVM or logistic regression"],
            ["Real photos", "A pretrained convolutional network (transfer learning), fine-tuned on your images"],
            ["Few labelled images", "Transfer learning plus augmentation (flips, crops, colour changes that keep the label true)"],
            ["Always", "Split by source (patient, camera, site), not by image, when several images come from one source"],
          ] } },
        ],
      },
    ],
  },

  pipelines: {
    slug: "pipelines",
    title: "Pipelines and ColumnTransformer",
    summary: "Put cleaning, encoding, scaling and the model into one object that is tuned, validated, saved and served as a unit.",
    sections: [
      {
        heading: "Why pipelines",
        blocks: [
          { list: [
            "**No leakage**: every learned step is refitted inside each cross-validation fold.",
            "**One object** to tune (`GridSearchCV` reaches any step's settings with `step__setting`).",
            "**Same code in production**: the saved pipeline applies identical preprocessing to new rows.",
            "**Different columns, different treatment** with `ColumnTransformer`.",
          ] },
        ],
      },
      {
        heading: "A production-style pipeline",
        blocks: [
          { program: {
            goal: "Numeric, skewed, nominal and ordinal columns in one pipeline, tuned across two model types",
            code: r`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, OrdinalEncoder, StandardScaler

rng = np.random.default_rng(0)
n = 2000
df = pd.DataFrame({
    "age": rng.integers(18, 75, n).astype(float),
    "monthly_spend": rng.lognormal(7, 0.8, n),
    "tenure_months": rng.integers(1, 60, n).astype(float),
    "city": rng.choice(["Bengaluru", "Mysuru", "Pune", "Delhi", "Kochi"], n),
    "plan": rng.choice(["basic", "standard", "premium"], n),
})
df.loc[rng.random(n) < 0.1, "age"] = np.nan
df.loc[rng.random(n) < 0.05, "city"] = np.nan
logit = -0.04 * df["tenure_months"] + 0.6 * (df["plan"] == "basic") + 0.5 * (np.log(df["monthly_spend"]) - 7) + 0.3
y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)

numeric = ["age", "tenure_months"]
skewed = ["monthly_spend"]
nominal = ["city"]
ordinal = ["plan"]

preprocess = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median", add_indicator=True)), ("scale", StandardScaler())]), numeric),
    ("skew", Pipeline([("log", FunctionTransformer(np.log1p, feature_names_out="one-to-one")), ("scale", StandardScaler())]), skewed),
    ("nom", Pipeline([("impute", SimpleImputer(strategy="constant", fill_value="missing")),
                      ("onehot", OneHotEncoder(handle_unknown="ignore", min_frequency=0.02))]), nominal),
    ("ord", OrdinalEncoder(categories=[["basic", "standard", "premium"]]), ordinal),
], verbose_feature_names_out=False)

pipe = Pipeline([("prep", preprocess), ("model", LogisticRegression(max_iter=2000))])
grid = [{"model": [LogisticRegression(max_iter=2000)], "model__C": [0.1, 1, 10]},
        {"model": [HistGradientBoostingClassifier(random_state=0)], "model__learning_rate": [0.05, 0.1]}]

X_train, X_test, y_train, y_test = train_test_split(df, y, test_size=0.2, stratify=y, random_state=0)
search = GridSearchCV(pipe, grid, cv=5, scoring="roc_auc").fit(X_train, y_train)
print("best:", type(search.best_params_["model"]).__name__, {k: v for k, v in search.best_params_.items() if k != "model"})
print(f"CV ROC-AUC {search.best_score_:.3f} | test ROC-AUC {search.score(X_test, y_test):.3f}")
print("model inputs after preprocessing:", list(search.best_estimator_["prep"].get_feature_names_out()))

new_customer = pd.DataFrame([{"age": np.nan, "monthly_spend": 900.0, "tenure_months": 3.0, "city": "Jaipur", "plan": "basic"}])
print("churn probability for a new customer (unseen city, missing age):", search.predict_proba(new_customer)[0, 1].round(3))

# Output:
# best: LogisticRegression {'model__C': 0.1}
# CV ROC-AUC 0.713 | test ROC-AUC 0.682
# model inputs after preprocessing: ['age', 'tenure_months', 'missingindicator_age', 'monthly_spend', 'city_Bengaluru', 'city_Delhi', 'city_Kochi', 'city_Mysuru', 'city_Pune', 'city_missing', 'plan']
# churn probability for a new customer (unseen city, missing age): 0.688`,
            walk: [
              { line: "numeric = [\"age\", \"tenure_months\"]", say: "List columns by how they should be treated. These lists are the contract between your data and your model." },
              { line: "(\"num\", Pipeline([(\"impute\", SimpleImputer(strategy=\"median\", add_indicator=True)), (\"scale\", StandardScaler())]), numeric),", say: "Numbers: fill gaps with the median, add a missing flag, scale." },
              { line: "(\"skew\", Pipeline([(\"log\", FunctionTransformer(np.log1p, feature_names_out=\"one-to-one\")), (\"scale\", StandardScaler())]), skewed),", say: "Long-tailed spend: log, then scale." },
              { line: "(\"onehot\", OneHotEncoder(handle_unknown=\"ignore\", min_frequency=0.02))]), nominal),", say: "Cities: missing becomes its own category; one-hot; unknown cities are ignored safely." },
              { line: "grid = [{\"model\": [LogisticRegression(max_iter=2000)], \"model__C\": [0.1, 1, 10]},", say: "The search can swap the whole model as well as tune it." },
              { line: "search = GridSearchCV(pipe, grid, cv=5, scoring=\"roc_auc\").fit(X_train, y_train)", say: "Every candidate pipeline is fitted and scored inside 5 folds: no step ever sees validation rows." },
              { line: "print(\"model inputs after preprocessing:\", list(search.best_estimator_[\"prep\"].get_feature_names_out()))", say: "Check exactly which columns the model receives." },
              { line: "new_customer = pd.DataFrame([{\"age\": np.nan, \"monthly_spend\": 900.0, \"tenure_months\": 3.0, \"city\": \"Jaipur\", \"plan\": \"basic\"}])", say: "A new customer with a missing age and an unseen city still gets a prediction." },
            ],
          } },
        ],
      },
    ],
  },

  "save-and-serve": {
    slug: "save-and-serve",
    title: "Save, serve and monitor a model",
    summary: "Package the model with its metadata, validate inputs, return predictions with warnings, and know what to monitor.",
    sections: [
      {
        heading: "A predictor with input checks",
        blocks: [
          { program: {
            goal: "Save a model bundle, then load it in a small predictor class",
            code: r`import json

import joblib
import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
model = RandomForestClassifier(n_estimators=200, random_state=0).fit(X, y)

bundle = {"model": model, "features": list(X.columns), "threshold": 0.5,
          "train_stats": X.describe().loc[["min", "max"]].to_dict(), "version": "2026-11-21"}
joblib.dump(bundle, "model_bundle.joblib")


class Predictor:
    def __init__(self, path: str):
        b = joblib.load(path)
        self.model, self.features, self.threshold = b["model"], b["features"], b["threshold"]
        self.stats, self.version = b["train_stats"], b["version"]

    def validate(self, record: dict) -> list[str]:
        problems = [f"missing field: {f}" for f in self.features if f not in record]
        for f, v in record.items():
            if f in self.stats and not (self.stats[f]["min"] <= v <= self.stats[f]["max"]):
                problems.append(f"{f}={v} is outside the training range")
        return problems

    def predict(self, record: dict) -> dict:
        problems = self.validate(record)
        if any(p.startswith("missing") for p in problems):
            return {"error": problems}
        row = pd.DataFrame([record])[self.features]
        p = float(self.model.predict_proba(row)[0, 1])
        return {"probability": round(p, 3), "label": int(p >= self.threshold),
                "warnings": problems, "model_version": self.version}


predictor = Predictor("model_bundle.joblib")
good = X.iloc[0].to_dict()
print(json.dumps(predictor.predict(good)))
odd = {**good, "mean radius": 80.0}
print(json.dumps(predictor.predict(odd)))
result = predictor.predict({"mean radius": 14.0})
print(len(result["error"]), "problems, first two:", result["error"][:2])

# Output:
# {"probability": 0.015, "label": 0, "warnings": [], "model_version": "2026-11-21"}
# {"probability": 0.015, "label": 0, "warnings": ["mean radius=80.0 is outside the training range"], "model_version": "2026-11-21"}
# 29 problems, first two: ['missing field: mean texture', 'missing field: mean perimeter']`,
            walk: [
              { line: "bundle = {\"model\": model, \"features\": list(X.columns), \"threshold\": 0.5,", say: "Save more than the model: the expected columns, the decision threshold, the training ranges and a version." },
              { line: "problems = [f\"missing field: {f}\" for f in self.features if f not in record]", say: "Reject requests that do not have every expected field." },
              { line: "problems.append(f\"{f}={v} is outside the training range\")", say: "Warn when a value is outside anything seen in training: the model is guessing there." },
              { line: "return {\"probability\": round(p, 3), \"label\": int(p >= self.threshold),", say: "Return the probability, the decision and any warnings, plus the model version for tracing." },
              { line: "odd = {**good, \"mean radius\": 80.0}", say: "An extreme input gets the same prediction (trees cannot extrapolate) but now carries a warning." },
            ],
          } },
        ],
      },
      {
        heading: "Serving it",
        blocks: [
          { program: {
            goal: "Expose the predictor as a web API with FastAPI",
            code: r`from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
predictor = Predictor("model_bundle.joblib")


class Request(BaseModel):
    features: dict[str, float]


@app.post("/predict")
def predict(req: Request) -> dict:
    return predictor.predict(req.features)

# run with: uvicorn app:app --reload`,
            walk: [
              { line: "predictor = Predictor(\"model_bundle.joblib\")", say: "Load the model once when the server starts, not on every request." },
              { line: "class Request(BaseModel):", say: "Pydantic validates the request body and returns a clear error for malformed input." },
              { line: "@app.post(\"/predict\")", say: "One endpoint that takes features and returns the predictor's answer." },
            ],
          } },
          { table: { head: ["Monitor", "Why", "How"], rows: [
            ["Input distributions", "Data drifts away from training data", "Compare means, ranges and missing rates per week with training statistics"],
            ["Prediction distribution", "A sudden shift often means a broken input", "Track the share of positive predictions"],
            ["Performance on labelled outcomes", "The real test, once labels arrive", "Recompute the metric on recent data; alert below a threshold"],
            ["Errors and latency", "Operational health", "Log failed requests and response times"],
          ] } },
          { p: "Retrain on a schedule or when monitoring shows drift, and compare the new model with the current one on the same recent data before switching." },
        ],
      },
    ],
  },
};
