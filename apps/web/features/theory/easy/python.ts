import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Python, NumPy & pandas. */
export const NUMPY_PANDAS: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "NumPy gives you fast arrays of numbers; pandas gives you tables with column names. Most ML bugs are shape bugs or axis bugs, so each idea below comes with a tiny example you can check by eye.",
      examples: [
        {
          at: 0,
          title: "Shapes you will meet",
          blocks: [
            { table: { head: ["Data", "Shape"], rows: [["One student's 3 features", "`(3,)`"], ["100 students × 3 features", "`(100, 3)`"], ["32 colour photos of 64 × 64 pixels", "`(32, 64, 64, 3)`"]] } },
          ],
        },
        {
          at: 1,
          kind: "idea",
          title: "Loop versus vectorised",
          blocks: [
            { p: "Adding 5% to one million prices with a Python `for` loop visits each number one by one in Python. `prices * 1.05` does the same work inside NumPy's compiled code, typically dozens of times faster, and is one line." },
          ],
        },
        {
          at: 2,
          title: "Which axis?",
          blocks: [
            { p: "Marks of 3 students (rows) in 2 subjects (columns): `[[70, 80], [60, 90], [80, 70]]`." },
            { list: ["`mean(axis=0)` = (70, 80): the average of each **subject** (down each column).", "`mean(axis=1)` = (75, 75, 75): the average of each **student** (across each row)."] },
          ],
        },
        {
          at: 4,
          title: "Broadcasting by shape",
          blocks: [
            { list: ["`(3, 2)` minus `(2,)`: shapes line up from the right (2 and 2), so the vector is subtracted from every row. Works.", "`(3, 2)` minus `(3,)`: 2 and 3 do not match, so NumPy raises an error.", "`(3, 2)` minus `(3, 1)`: the 1 stretches to 2, so each row gets its own number subtracted. Works, but it is a different operation."] },
          ],
        },
        {
          at: 5,
          title: "`.loc` versus `.iloc`",
          blocks: [
            { p: "A table indexed by roll number 101, 102, 103: `df.loc[102]` is the student with roll number 102; `df.iloc[0]` is whichever row is first. After sorting, `.iloc[0]` changes but `.loc[102]` does not." },
          ],
        },
      ],
    },
    "NumPy arrays": {
      plain: "An array is a grid of numbers of one type. Arithmetic on an array happens to every element at once.",
    },
    "Broadcasting": {
      plain: "When two arrays have different shapes, NumPy stretches the smaller one to fit, if the shapes are compatible. It is how one line can standardise every column.",
    },
    "pandas DataFrames": {
      plain: "A DataFrame is a spreadsheet in Python: named columns, one row per record. You clean data in pandas, then hand NumPy arrays to the model.",
    },
    "3.1.1 Python data structures and functions": {
      plain: "Pick the container that matches the job: a list for an ordered sequence, a dict to look things up by a key, a set for unique items. Write functions that take everything they need as arguments instead of reading hidden globals.",
      examples: [
        {
          at: 1,
          kind: "idea",
          title: "Why pass the cutoff in",
          blocks: [
            { p: "`build_features(events)` that secretly uses today's date gives different answers tomorrow, so last month's backtest cannot be repeated. `build_features(events, cutoff=date(2026, 1, 15))` gives the same answer every time you run it with that date." },
          ],
        },
      ],
    },
    "3.1.3 Tables, joins, and ingestion contracts": {
      plain: "Reading a file is only step one: check the row count, column types, duplicates and dates. When joining a small table (one row per branch-week) to a big one (many events), aggregate the big one first, or rows multiply.",
      examples: [
        {
          at: 2,
          title: "How a join multiplies rows",
          blocks: [
            { p: "Two branch-weeks, and branch B1 has 3 checkout events. Joining the events directly gives 3 rows for B1's week instead of 1. Count first (B1: 3 checkouts), then join the count: still 2 rows." },
          ],
        },
      ],
    },
    "3.1.4 Exploratory analysis with a decision in mind": {
      plain: "Explore with a question in mind. Look at one variable at a time, then pairs, then over time, and write down what each plot can and cannot tell you.",
      examples: [
        {
          at: 2,
          kind: "idea",
          title: "Question first, then plot",
          blocks: [
            { table: { head: ["Question", "Plot"], rows: [["Are returns usually small with a few huge weeks?", "Histogram of weekly returns"], ["Do bigger branches return more?", "Scatter: branch size vs returns"], ["Did something change mid-year?", "Line plot of returns over time, one line per branch"]] } },
          ],
        },
      ],
    },
    "Textbook case: Python Data Contracts and Exploratory Workflows": {
      plain: "A worked case about water-quality sensors: read the records safely, keep real zeros separate from missing values, and only use readings that had arrived before the prediction time.",
    },
    "3.2.1 Python structures, functions, iterators, and safe abstractions": {
      plain: "A zero is a real measurement; `None` means missing. Test for missing with `is None`, never with `if not value`, or every zero will be thrown away.",
    },
    "3.2.2 CSV, JSON, schemas, timestamps, and errors at ingestion": {
      plain: "A CSV gives you text, not numbers or dates. Convert each field on purpose, reject impossible values, and keep two times for each reading: when it was measured and when it arrived.",
      examples: [
        {
          at: 2,
          kind: "idea",
          title: "Measured early, arrived late",
          blocks: [
            { table: { head: ["Reading", "Measured", "Arrived", "Usable for a 06:00 forecast?"], rows: [["R1", "05:55", "06:20", "No: we did not have it at 06:00"], ["R2", "05:40", "05:45", "Yes"]] } },
          ],
        },
      ],
    },
    "3.2.3 Inspect distributions, missingness, and relationships": {
      plain: "Start with counts, missing values and impossible values, then look at the shape of each variable. Compare rates, not raw counts, when groups are different sizes.",
    },
    "3.2.4 Joins, encoding, and leakage-free feature building": {
      plain: "Learn your encodings and fill-in values from the training rows only, then reuse exactly those on new rows. One-hot encoding turns a category into 0/1 columns.",
      examples: [
        {
          at: 1,
          title: "One-hot encoding by hand",
          blocks: [
            { table: { head: ["device_type", "is_optical", "is_thermal"], rows: [["thermal", "0", "1"], ["optical", "1", "0"], ["thermal", "0", "1"]] } },
            { p: "No order is implied, unlike coding thermal = 1 and optical = 2, which would tell a linear model that optical is \"twice\" thermal." },
          ],
        },
      ],
    },
    "3.2.5 Exceptions, tests, and a reproducible ML handoff": {
      plain: "Split the work into small functions (read, check, build features, fit, score) and make each one fail loudly on bad input. Record exactly which data, code and settings produced the model.",
    },
    "Textbook case: Tabular Data Workflows That Preserve Meaning": {
      plain: "A depot-demand dataset used to practise loading typed tables, counting with the right denominator, joining safely and building time-safe features.",
    },
    "3.6.1 Read files with an explicit schema": {
      plain: "Tell pandas the type of every column when you read the file. Then check the row count, missing values and duplicate keys before using it.",
    },
    "3.6.2 Explore distributions with denominators": {
      plain: "Every average has a denominator. \"Average per depot\" and \"average per row\" are different numbers when depots have different numbers of rows.",
      examples: [
        {
          at: 2,
          title: "Two averages from the same data",
          blocks: [
            { p: "Depot X: 9 days averaging 10 requests. Depot Y: 1 day with 50 requests." },
            { list: ["Average of all 10 rows: $(9 \\times 10 + 50)/10 = 14$.", "Average of the two depot averages: $(10 + 50)/2 = 30$.", "Both are correct; they answer different questions."] },
          ],
        },
      ],
    },
    "3.6.3 Join a dimension table with a checked relationship": {
      plain: "When you join daily rows to a table with one row per depot, tell pandas to check that relationship (`validate='many_to_one'`). A duplicated depot key would silently double rows.",
    },
    "3.6.4 Time-safe rolling summaries": {
      plain: "A rolling feature may only use days that were finished before the forecast was made. \"The previous three rows\" is not the same as \"the previous three days\" if a day is missing.",
      examples: [
        {
          at: 0,
          title: "A missing day changes the window",
          blocks: [
            { p: "Requests on April 1, 2 and 4 (April 3 missing): 4, 6, 8. For a forecast of April 5, the previous three rows average $(4 + 6 + 8)/3 = 6$, but the previous three calendar days (April 2, 3, 4) contain only two values: $(6 + 8)/2 = 7$. Say which one you mean." },
          ],
        },
      ],
    },
    "3.6.5 From exploratory table to model handoff": {
      plain: "Before handing data to modelling, write down the contract: what one row is, the target, which features are allowed, how gaps are filled and how the data are split.",
    },
    "2.25.1 Read structured files without confusing syntax with meaning": {
      plain: "A file format tells you how to split the text, not what it means. `0017` may be an ID whose zeros matter; `17` may be a measurement.",
    },
    "2.25.2 Start EDA with population and data quality, then distributions": {
      plain: "First check what you have (rows, sites, dates, duplicates, gaps), then summarise each variable. One extreme value can move the mean a lot while the median stays put.",
    },
    "2.25.3 Associations, conditioning, and the trap of a pooled average": {
      plain: "A pattern in the combined data can reverse inside every group (Simpson's paradox). Always check the groups.",
      examples: [
        {
          at: 1,
          title: "The reversal as a table",
          blocks: [
            { table: { head: ["", "Site A", "Site B", "Both sites"], rows: [["new", "9/10 = 90%", "1/100 = 1%", "10/110 = 9.1%"], ["old", "80/100 = 80%", "0/10 = 0%", "80/110 = 72.7%"]] } },
            { p: "`new` has the higher rate at each site, yet the lower rate overall, because `new` was mostly used at site B, where rates are low." },
          ],
        },
      ],
    },
    "Textbook case: Reproducible Python Work for Data Projects": {
      plain: "A bicycle-counting project used to practise clean Python: parse carefully, validate, and make every result reproducible.",
    },
    "3.3.1 Plan the project around a measurable prediction": {
      plain: "Decide what you are predicting, for which unit and when, before writing code. Run your notebook from top to bottom before trusting its output.",
    },
    "3.3.2 Pure functions, comprehensions, iteration, and formatting": {
      plain: "A pure function only uses its inputs and only returns an output, so it is easy to test. Keep \"empty\" and \"zero\" apart when parsing.",
    },
    "3.3.3 Classes, assertions, and explicit invalid input": {
      plain: "A class can bundle what was learned (`fit`) with how it is used (`predict`). It should refuse to predict before it has been fitted, and refuse bad input.",
    },
    "3.3.4 APIs, pagination, retries, and historical data integrity": {
      plain: "APIs return data in pages. Follow the page cursor to the end, drop duplicates by a stable ID, and keep the latest version of each record.",
      examples: [
        {
          at: 2,
          kind: "idea",
          title: "Why duplicates appear",
          blocks: [
            { p: "Page 1 returns events A and B. While you fetch, a new event arrives and shifts the list, so page 2 starts with B again, then C. Without de-duplicating by ID you would count B twice." },
          ],
        },
      ],
    },
    "3.3.5 Scraping as a fragile data extraction process": {
      plain: "Scraping reads data out of a web page's HTML. Pages change without warning, so check that every expected field is there and fail loudly when it is not.",
    },
    "3.3.6 Scale and profile work without hiding the computation": {
      plain: "Measure before optimising. Often the biggest saving is simply loading fewer columns or using smaller number types.",
      examples: [
        {
          at: 2,
          title: "Memory, worked out",
          blocks: [
            { list: ["2,000,000 rows × 200 columns × 8 bytes = 3.2 GB.", "Only the 20 allowed columns: 2,000,000 × 20 × 8 = 320 MB.", "Same 20 columns as 4-byte floats: 160 MB."] },
          ],
        },
      ],
    },
    "3.3.7 Make a notebook experiment reproducible across runtimes": {
      plain: "Record the data's fingerprint (hash), the code version, the package versions and the random seed. With those four, anyone can rerun the experiment and get the same numbers.",
    },
  },
  code: {
    "NumPy arrays#0": {
      goal: "Create arrays, do element-wise arithmetic, slice and filter",
      code: r`import numpy as np

a = np.array([1.0, 2.0, 3.0])
print("a * 2:", a * 2)                     # every element doubled, no loop
print("a + a:", a + a)
print("mean, sum, max:", a.mean(), a.sum(), a.max())

M = np.arange(6).reshape(2, 3)             # numbers 0..5 arranged as 2 rows x 3 columns
print("M:")
print(M)
print("shape:", M.shape)
print("column 1, M[:, 1]:", M[:, 1])       # ':' means every row
print("values above 2, M[M > 2]:", M[M > 2])   # boolean mask
print("mean of each column:", M.mean(axis=0))

# Output:
# a * 2: [2. 4. 6.]
# a + a: [2. 4. 6.]
# mean, sum, max: 2.0 6.0 3.0
# M:
# [[0 1 2]
#  [3 4 5]]
# shape: (2, 3)
# column 1, M[:, 1]: [1 4]
# values above 2, M[M > 2]: [3 4 5]
# mean of each column: [1.5 2.5 3.5]`,
      walk: [
        { line: "print(\"a * 2:\", a * 2)", say: "Multiplies every element by 2. No loop needed." },
        { line: "M = np.arange(6).reshape(2, 3)", say: "`arange(6)` makes 0 to 5; `reshape(2, 3)` arranges them as 2 rows × 3 columns." },
        { line: "M[:, 1]", say: "`:` means all rows, `1` means column 1 (counting from 0)." },
        { line: "M[M > 2]", say: "`M > 2` is a True/False grid; using it as an index keeps only the True positions." },
        { line: "print(\"mean of each column:\", M.mean(axis=0))", say: "`axis=0` collapses the rows, giving one mean per column." },
      ],
    },
    "Broadcasting#0": {
      goal: "Standardise every column in one line with broadcasting",
      code: r`import numpy as np

X = np.array([[1., 200.],
              [2., 300.],
              [3., 400.]])                 # 3 rows, 2 features on very different scales
print("column means:", X.mean(axis=0))     # shape (2,)
print("column stds: ", X.std(axis=0).round(3))

X_scaled = (X - X.mean(axis=0)) / X.std(axis=0)   # (3, 2) minus (2,): broadcasts to every row
print("standardised:")
print(X_scaled.round(3))
print("new means:", X_scaled.mean(axis=0).round(6) + 0.0, "| new stds:", X_scaled.std(axis=0).round(6))

# Output:
# column means: [  2. 300.]
# column stds:  [ 0.816 81.65 ]
# standardised:
# [[-1.225 -1.225]
#  [ 0.     0.   ]
#  [ 1.225  1.225]]
# new means: [0. 0.] | new stds: [1. 1.]`,
      walk: [
        { line: "X_scaled = (X - X.mean(axis=0)) / X.std(axis=0)", say: "The (2,) vector of means is stretched to every row, then the (2,) vector of standard deviations divides every row." },
        { line: "print(\"new means:\", X_scaled.mean(axis=0).round(6) + 0.0, \"| new stds:\", X_scaled.std(axis=0).round(6))", say: "Check: every column now has mean 0 and standard deviation 1, so 200 vs 2 scales no longer matter." },
      ],
    },
    "pandas DataFrames#0": {
      goal: "Load a table, inspect it, filter, group, fill gaps and get arrays for a model",
      code: r`import pandas as pd

# In real work: df = pd.read_csv("students.csv"). Here we build the same table inline.
df = pd.DataFrame({
    "name":       ["Asha", "Ben", "Chen", "Dev", "Ela"],
    "section":    ["A", "A", "B", "B", "B"],
    "hours":      [5.0, 2.0, None, 4.0, 1.0],
    "attendance": [95, 70, 88, 92, 60],
    "marks":      [78, 45, 66, 72, 31],
})
print(df.head())                            # first rows
print("missing per column:")
print(df.isna().sum())

df["passed"] = df["marks"] >= 40            # new True/False column
print("students who study more than 3 hours:")
print(df[df["hours"] > 3][["name", "hours"]])
print("average marks per section:")
print(df.groupby("section")["marks"].mean())

df["hours"] = df["hours"].fillna(df["hours"].median())   # fill the gap with the median (3.0)
X = df[["hours", "attendance"]].to_numpy()  # features for a model
y = df["passed"].to_numpy()                 # target
print("X shape:", X.shape, "| y:", y)

# Output:
#    name section  hours  attendance  marks
# 0  Asha       A    5.0          95     78
# 1   Ben       A    2.0          70     45
# 2  Chen       B    NaN          88     66
# 3   Dev       B    4.0          92     72
# 4   Ela       B    1.0          60     31
# missing per column:
# name          0
# section       0
# hours         1
# attendance    0
# marks         0
# dtype: int64
# students who study more than 3 hours:
#    name  hours
# 0  Asha    5.0
# 3   Dev    4.0
# average marks per section:
# section
# A    61.500000
# B    56.333333
# Name: marks, dtype: float64
# X shape: (5, 2) | y: [ True  True  True  True False]`,
      walk: [
        { line: "df = pd.DataFrame({", say: "Build a table from a dict of columns. With a file you would write `pd.read_csv(\"students.csv\")`." },
        { line: "print(df.isna().sum())", say: "Count missing values per column: one student has no hours recorded." },
        { line: "df[\"passed\"] = df[\"marks\"] >= 40", say: "A new True/False column computed for every row at once." },
        { line: "print(df[df[\"hours\"] > 3][[\"name\", \"hours\"]])", say: "Filter rows with a condition, then pick two columns to show." },
        { line: "print(df.groupby(\"section\")[\"marks\"].mean())", say: "Split by section, average the marks in each group." },
        { line: "df[\"hours\"] = df[\"hours\"].fillna(df[\"hours\"].median())", say: "Fill the gap with the median of the known hours (3.0)." },
        { line: "X = df[[\"hours\", \"attendance\"]].to_numpy()", say: "Hand the model a plain NumPy array of features, shape (5, 2)." },
      ],
    },
    "3.1.3 Tables, joins, and ingestion contracts#0": {
      goal: "Build one branch-week's features using only data available at the issue date",
      code: r`from datetime import date, timedelta


def branch_week_features(branch, issue_date, checkouts, inventories):
    start = issue_date - timedelta(days=14)
    eligible = [row for row in checkouts if row["branch"] == branch
                and start <= row["checkout_date"] < issue_date
                and row["arrived_date"] < issue_date]
    past_returns = sum(start <= row["return_date"] < issue_date
                       for row in eligible if row["return_date"] is not None)
    choices = [row for row in inventories if row["branch"] == branch
               and row["effective_date"] <= issue_date]
    if not choices:
        raise ValueError("No inventory record available at issue time")
    latest = max(choices, key=lambda row: row["effective_date"])
    if sum(row["effective_date"] == latest["effective_date"]
           for row in choices) != 1:
        raise ValueError("Ambiguous same-date inventory records")
    return {"branch": branch, "issue_date": issue_date,
            "checkout_count_14d": len(eligible),
            "return_count_14d": past_returns,
            "available_copies": latest["copies"]}


issue = date(2026, 1, 15)
checkouts = [
    {"branch": "B1", "checkout_date": date(2026,1,2),
     "arrived_date": date(2026,1,2), "return_date": date(2026,1,17)},
    {"branch": "B1", "checkout_date": date(2026,1,10),
     "arrived_date": date(2026,1,10), "return_date": date(2026,1,13)},
    {"branch": "B1", "checkout_date": date(2026,1,14),
     "arrived_date": date(2026,1,20), "return_date": date(2026,1,18)},
]
inventories = [
    {"branch": "B1", "effective_date": date(2026,1,1), "copies": 100},
    {"branch": "B1", "effective_date": date(2026,1,20), "copies": 120},
]
features = branch_week_features("B1", issue, checkouts, inventories)
assert features["checkout_count_14d"] == 2
assert features["return_count_14d"] == 1
assert features["available_copies"] == 100
print("All checks passed.")

# Output:
# All checks passed.`,
      walk: [
        { line: "start = issue_date - timedelta(days=14)", say: "The look-back window: the 14 days before the forecast is issued." },
        { line: "and row[\"arrived_date\"] < issue_date]", say: "Keep a checkout only if it had reached the system before the issue date. The January 14 checkout arrived on January 20, so it is excluded." },
        { line: "and row[\"effective_date\"] <= issue_date]", say: "Use only inventory records that were already in effect. The January 20 record (120 copies) is in the future." },
        { line: "latest = max(choices, key=lambda row: row[\"effective_date\"])", say: "Of the eligible inventory records, take the most recent one." },
        { line: "assert features[\"checkout_count_14d\"] == 2", say: "Two checkouts, not three: the hand calculation in the text, checked." },
      ],
    },
    "3.2.1 Python structures, functions, iterators, and safe abstractions#0": {
      goal: "Filter readings with a generator, keeping real zeros",
      code: r`def eligible_readings(records, cutoff, *, require_station=None):
    for row in records:
        if row["arrived_at"] > cutoff:
            continue
        if require_station is not None and row["station_id"] != require_station:
            continue
        if row["conductivity"] is None:
            continue  # The zero reading is allowed; only None means missing.
        yield row


records = [
    {"station_id": "R1", "arrived_at": 8, "conductivity": 0.0},
    {"station_id": "R2", "arrived_at": 9, "conductivity": None},
    {"station_id": "R1", "arrived_at": 10, "conductivity": 8.5},
]
stream = eligible_readings(records, 9, require_station="R1")
assert iter(stream) is stream  # A generator is its own one-pass iterator.
assert [row["conductivity"] for row in stream] == [0.0]
assert list(stream) == []  # It has already been consumed.
print("All checks passed.")

# Output:
# All checks passed.`,
      walk: [
        { line: "def eligible_readings(records, cutoff, *, require_station=None):", say: "The `*` forces `require_station` to be named when called, so it cannot be swapped with `cutoff` by accident." },
        { line: "if row[\"conductivity\"] is None:", say: "Skip only truly missing readings. A reading of 0.0 passes." },
        { line: "yield row", say: "`yield` makes this a generator: it hands back one row at a time instead of building a list." },
        { line: "assert list(stream) == []  # It has already been consumed.", say: "A generator can be read only once. The second read is empty." },
      ],
    },
    "3.2.2 CSV, JSON, schemas, timestamps, and errors at ingestion#0": {
      goal: "Parse a CSV safely: check headers, types, timestamps, duplicates and impossible values",
      code: r`import csv
import io
import math
from datetime import datetime, timezone


class ReadingError(ValueError):
    pass


def read_measurements(csv_text):
    parsed = []
    seen = set()
    reader = csv.DictReader(io.StringIO(csv_text))
    required = {"station_id", "measured_at", "arrived_at", "conductivity"}
    if reader.fieldnames is None or not required.issubset(reader.fieldnames):
        raise ReadingError("Missing required CSV header")
    for line_number, row in enumerate(reader, start=2):
        try:
            station = row["station_id"].strip()
            measured = datetime.fromisoformat(row["measured_at"])
            arrived = datetime.fromisoformat(row["arrived_at"])
            if (not station or measured.tzinfo is None
                    or arrived.tzinfo is None
                    or measured.utcoffset() != timezone.utc.utcoffset(None)
                    or arrived.utcoffset() != timezone.utc.utcoffset(None)):
                raise ValueError("Expected station and explicit UTC timestamps")
            raw = row["conductivity"].strip()
            value = None if raw == "" else float(raw)
            if value is not None and (not math.isfinite(value) or value < 0):
                raise ValueError("Conductivity must be finite and nonnegative")
            if arrived < measured:
                raise ValueError("Arrival before measurement needs investigation")
            key = (station, measured)
            if key in seen:
                raise ValueError("Duplicate station and measurement time")
            seen.add(key)
            parsed.append({"station_id": station, "measured_at": measured,
                           "arrived_at": arrived, "conductivity": value})
        except (AttributeError, TypeError, ValueError) as error:
            raise ReadingError(f"Line {line_number}: {error}") from error
    return parsed


sample_csv = """station_id,measured_at,arrived_at,conductivity
R1,2026-05-03T05:55:00+00:00,2026-05-03T06:20:00+00:00,0
R2,2026-05-03T05:40:00+00:00,2026-05-03T05:45:00+00:00,
"""
readings = read_measurements(sample_csv)
cutoff = datetime.fromisoformat("2026-05-03T06:00:00+00:00")
available = [r for r in readings if r["arrived_at"] <= cutoff]
assert len(available) == 1 and available[0]["conductivity"] is None
assert readings[0]["conductivity"] == 0.0
print("All checks passed.")

# Output:
# All checks passed.`,
      walk: [
        { line: "if reader.fieldnames is None or not required.issubset(reader.fieldnames):", say: "Stop at once if a required column is missing from the header." },
        { line: "measured = datetime.fromisoformat(row[\"measured_at\"])", say: "Turn the text into a real timestamp; the code then insists it is in UTC." },
        { line: "value = None if raw == \"\" else float(raw)", say: "An empty field becomes `None` (missing); \"0\" becomes the number 0.0." },
        { line: "if key in seen:", say: "Reject a second reading for the same station and time." },
        { line: "raise ReadingError(f\"Line {line_number}: {error}\") from error", say: "Errors say which line failed, so the bad record can be found." },
        { line: "available = [r for r in readings if r[\"arrived_at\"] <= cutoff]", say: "Only readings that had arrived by 06:00 can be used for the 06:00 forecast." },
      ],
    },
    "3.2.3 Inspect distributions, missingness, and relationships#0": {
      goal: "Compute a quantile by hand with linear interpolation",
      code: r`import math


def interpolated_quantile(values, q):
    if not values or not 0 <= q <= 1:
        raise ValueError("Need values and q in [0, 1]")
    ordered = sorted(values)
    if any(not math.isfinite(x) for x in ordered):
        raise ValueError("Values must be finite")
    position = (len(ordered)-1)*q
    low = math.floor(position)
    high = math.ceil(position)
    return ordered[low]+(position-low)*(ordered[high]-ordered[low])


sample = [0, 2, 2, 4, 100]
assert interpolated_quantile(sample, 0.5) == 2
assert interpolated_quantile(sample, 0.75) == 4
assert abs(interpolated_quantile(sample, 0.9)-61.6) < 1e-12
print("All checks passed.")

# Output:
# All checks passed.`,
      walk: [
        { line: "position = (len(ordered)-1)*q", say: "Where the quantile sits in the sorted list: for q = 0.9 and 5 values, position 3.6." },
        { line: "return ordered[low]+(position-low)*(ordered[high]-ordered[low])", say: "Go 60% of the way from the value at index 3 (4) to the value at index 4 (100): 4 + 0.6 × 96 = 61.6." },
      ],
    },
    "3.2.4 Joins, encoding, and leakage-free feature building#0": {
      goal: "Learn a category list and a fill-in value on training rows, then apply them to new rows",
      code: r`def fit_feature_contract(train):
    categories = tuple(sorted({row["device_type"] for row in train}))
    measured = [row["conductivity"] for row in train
                if row["conductivity"] is not None]
    if not categories or not measured:
        raise ValueError("Need observed training categories and measurements")
    return {"categories": categories, "conductivity_mean":
            sum(measured)/len(measured)}


def transform_features(rows, contract):
    result = []
    for row in rows:
        category = row["device_type"]
        if category not in contract["categories"]:
            raise ValueError(f"Unknown device type: {category}")
        missing = row["conductivity"] is None
        value = contract["conductivity_mean"] if missing else row["conductivity"]
        result.append([value, int(missing)] +
                      [int(category == known) for known in contract["categories"]])
    return result


development = [{"device_type": "thermal", "conductivity": 0.0},
               {"device_type": "optical", "conductivity": 8.0}]
future = [{"device_type": "thermal", "conductivity": None}]
contract = fit_feature_contract(development)
assert contract["conductivity_mean"] == 4
assert transform_features(future, contract) == [[4, 1, 0, 1]]
print("contract:", contract)
print("future row ->", transform_features(future, contract))

# Output:
# contract: {'categories': ('optical', 'thermal'), 'conductivity_mean': 4.0}
# future row -> [[4.0, 1, 0, 1]]`,
      walk: [
        { line: "categories = tuple(sorted({row[\"device_type\"] for row in train}))", say: "The known categories, learned from training rows only, in a fixed (alphabetical) order." },
        { line: "sum(measured)/len(measured)}", say: "The fill-in value: the training mean of the measured readings (here 4.0)." },
        { line: "raise ValueError(f\"Unknown device type: {category}\")", say: "A category never seen in training is refused rather than silently mis-encoded." },
        { line: "result.append([value, int(missing)] +", say: "Each output row: the value (filled if missing), a 0/1 \"was missing\" flag, then the one-hot columns." },
      ],
    },
    "3.2.5 Exceptions, tests, and a reproducible ML handoff#0": {
      goal: "Validate a prediction batch and test that bad input is rejected",
      code: r`import csv
import io
import math
from datetime import datetime, timezone


class ReadingError(ValueError):
    pass


def read_measurements(csv_text):
    parsed = []
    seen = set()
    reader = csv.DictReader(io.StringIO(csv_text))
    required = {"station_id", "measured_at", "arrived_at", "conductivity"}
    if reader.fieldnames is None or not required.issubset(reader.fieldnames):
        raise ReadingError("Missing required CSV header")
    for line_number, row in enumerate(reader, start=2):
        try:
            station = row["station_id"].strip()
            measured = datetime.fromisoformat(row["measured_at"])
            arrived = datetime.fromisoformat(row["arrived_at"])
            if (not station or measured.tzinfo is None
                    or arrived.tzinfo is None
                    or measured.utcoffset() != timezone.utc.utcoffset(None)
                    or arrived.utcoffset() != timezone.utc.utcoffset(None)):
                raise ValueError("Expected station and explicit UTC timestamps")
            raw = row["conductivity"].strip()
            value = None if raw == "" else float(raw)
            if value is not None and (not math.isfinite(value) or value < 0):
                raise ValueError("Conductivity must be finite and nonnegative")
            if arrived < measured:
                raise ValueError("Arrival before measurement needs investigation")
            key = (station, measured)
            if key in seen:
                raise ValueError("Duplicate station and measurement time")
            seen.add(key)
            parsed.append({"station_id": station, "measured_at": measured,
                           "arrived_at": arrived, "conductivity": value})
        except (AttributeError, TypeError, ValueError) as error:
            raise ReadingError(f"Line {line_number}: {error}") from error
    return parsed


sample_csv = """station_id,measured_at,arrived_at,conductivity
R1,2026-05-03T05:55:00+00:00,2026-05-03T06:20:00+00:00,0
R2,2026-05-03T05:40:00+00:00,2026-05-03T05:45:00+00:00,
"""
readings = read_measurements(sample_csv)
cutoff = datetime.fromisoformat("2026-05-03T06:00:00+00:00")
available = [r for r in readings if r["arrived_at"] <= cutoff]
assert len(available) == 1 and available[0]["conductivity"] is None
assert readings[0]["conductivity"] == 0.0

# ---- this step ----
def require_prediction_inputs(rows):
    if not rows:
        raise ReadingError("No rows arrived; invoke the documented fallback")
    keys = set()
    for row in rows:
        key = (row["station_id"], row["measured_at"])
        if key in keys:
            raise ReadingError("Duplicate station/time key in prediction batch")
        keys.add(key)
        if row["conductivity"] is not None and row["conductivity"] < 0:
            raise ReadingError("Negative conductivity is not valid here")
    return len(rows)


assert require_prediction_inputs(readings) == 2
try:
    require_prediction_inputs([])
except ReadingError as error:
    assert "fallback" in str(error)
else:
    raise AssertionError("Empty batch should have been rejected")
print("All checks passed.")

# Output:
# All checks passed.`,
      walk: [
        { line: "raise ReadingError(\"No rows arrived; invoke the documented fallback\")", say: "An empty batch is an error with a clear message, not a silent zero." },
        { line: "raise ReadingError(\"Duplicate station/time key in prediction batch\")", say: "Two rows for the same station and time would double-count." },
        { line: "require_prediction_inputs([])", say: "A test that feeds bad input on purpose and checks that the right error appears." },
      ],
    },
    "3.6.1 Read files with an explicit schema#0": {
      goal: "Read a CSV with declared column types and check it",
      code: r`import io
import pandas as pd

raw=io.StringIO("""depot_id,day,requests,open_flag
A,2026-04-01,4,true
A,2026-04-02,0,true
B,2026-04-01,7,true
B,2026-04-02,,false
""")
frame=pd.read_csv(raw,dtype={'depot_id':'string',
                             'requests':'Int64',
                             'open_flag':'boolean'},
                  parse_dates=['day'])
assert len(frame)==4
assert frame['depot_id'].dtype.name=='string'
assert frame['requests'].isna().sum()==1
assert not frame.loc[3,'open_flag']
assert frame[['depot_id','day']].duplicated().sum()==0
assert (frame['requests'].dropna()>=0).all()
print(frame)
print(frame.dtypes)

# Output:
#   depot_id        day  requests  open_flag
# 0        A 2026-04-01         4       True
# 1        A 2026-04-02         0       True
# 2        B 2026-04-01         7       True
# 3        B 2026-04-02      <NA>      False
# depot_id             string
# day          datetime64[us]
# requests              Int64
# open_flag           boolean
# dtype: object`,
      walk: [
        { line: "frame=pd.read_csv(raw,dtype={'depot_id':'string',", say: "Declare types instead of letting pandas guess: IDs as text, counts as nullable integers, flags as booleans." },
        { line: "parse_dates=['day'])", say: "Turn the day column into real dates." },
        { line: "assert frame['requests'].isna().sum()==1", say: "Exactly one request count is missing: depot B on a closed day." },
        { line: "assert frame[['depot_id','day']].duplicated().sum()==0", say: "No depot appears twice on the same day." },
      ],
    },
    "3.6.3 Join a dimension table with a checked relationship#0": {
      goal: "Join depot details safely and summarise open days per depot",
      code: r`import io
import pandas as pd

raw=io.StringIO("""depot_id,day,requests,open_flag
A,2026-04-01,4,true
A,2026-04-02,0,true
B,2026-04-01,7,true
B,2026-04-02,,false
""")
frame=pd.read_csv(raw,dtype={'depot_id':'string',
                             'requests':'Int64',
                             'open_flag':'boolean'},
                  parse_dates=['day'])
assert len(frame)==4
assert frame['depot_id'].dtype.name=='string'
assert frame['requests'].isna().sum()==1
assert not frame.loc[3,'open_flag']
assert frame[['depot_id','day']].duplicated().sum()==0
assert (frame['requests'].dropna()>=0).all()

# ---- this step ----
metadata=pd.DataFrame({
    'depot_id':pd.Series(['A','B'],dtype='string'),
    'zone':['east','west'],
    'capacity':[10,20]
})
assert metadata['depot_id'].is_unique
joined=frame.merge(metadata,on='depot_id',how='left',
                   validate='many_to_one',indicator=True)
assert len(joined)==len(frame)
assert (joined['_merge']=='both').all()
assert joined['capacity'].notna().all()
active=joined[joined['open_flag']].copy()
assert active['requests'].sum()==11
per_depot=active.groupby('depot_id',observed=True)['requests'].agg(
    rows='size',mean='mean',total='sum')
assert per_depot.loc['A','rows']==2
assert per_depot.loc['B','rows']==1
print(per_depot)

# Output:
#           rows  mean  total
# depot_id                   
# A            2   2.0      4
# B            1   7.0      7`,
      walk: [
        { line: "validate='many_to_one',indicator=True)", say: "pandas checks that each depot appears once in the metadata, and adds a `_merge` column showing which rows matched." },
        { line: "assert len(joined)==len(frame)", say: "The join must not change the number of daily rows." },
        { line: "active=joined[joined['open_flag']].copy()", say: "Keep only open days before summarising demand." },
        { line: "rows='size',mean='mean',total='sum')", say: "Per depot: how many rows, the average and the total. Always show the count next to the average." },
      ],
    },
    "2.25.1 Read structured files without confusing syntax with meaning#0": {
      goal: "Read a CSV with the standard library and keep IDs as text",
      walk: [
        { line: "for row in csv.DictReader(raw):", say: "Each row becomes a dict keyed by the column names." },
        { line: "if amount < 0:", say: "A negative concentration is physically impossible, so stop and investigate." },
        { line: "assert [e['site_id'] for e in events] == ['0017', '0018']", say: "The IDs keep their leading zeros because they were never converted to numbers." },
      ],
    },
    "3.3.2 Pure functions, comprehensions, iteration, and formatting#0": {
      goal: "Parse counts, keep empty separate from zero, and format a summary",
      walk: [
        { line: "if value == '':", say: "An empty string means \"not recorded\", returned as `None`." },
        { line: "parsed = list(map(parse_count, raw))", say: "`map` applies the function to every item." },
        { line: "present = list(filter(lambda n: n is not None, parsed))", say: "`filter` keeps the measured days only." },
        { line: "message = f'{len(present)} measured days; average {rate:.1f} cyclists'", say: "An f-string; `:.1f` shows one decimal place." },
      ],
    },
    "3.3.3 Classes, assertions, and explicit invalid input#0": {
      goal: "Write a tiny model class with fit and predict",
      walk: [
        { line: "self.mean_ = None", say: "Nothing learned yet. The trailing underscore marks a fitted value, as in scikit-learn." },
        { line: "self.mean_ = sum(clean) / len(clean)", say: "`fit` learns one number: the training mean." },
        { line: "raise RuntimeError('fit before prediction')", say: "Calling `predict` before `fit` is a clear error." },
        { line: "return [self.mean_] * count", say: "The baseline predicts the training mean for every future day." },
      ],
    },
    "3.3.4 APIs, pagination, retries, and historical data integrity#0": {
      goal: "Follow pages to the end and drop duplicates by ID",
      walk: [
        { line: "if event['id'] not in seen:", say: "Skip an event already collected from an earlier page." },
        { line: "cursor = page['next']", say: "Move to the next page; `None` means there are no more." },
      ],
    },
    "3.3.4 APIs, pagination, retries, and historical data integrity#1": {
      goal: "Collect paged records safely: stop on loops, keep the newest version",
      walk: [
        { line: "if cursor in visited:", say: "A cursor seen before means the API is looping, so stop instead of running forever." },
        { line: "if previous is None or row['version'] > previous['version']:", say: "Keep the newest version of each record (B version 2 replaces version 1)." },
        { line: "raise ValueError('conflicting versions')", say: "Same version number with different content is a data problem worth stopping for." },
      ],
    },
    "3.3.5 Scraping as a fragile data extraction process#0": {
      goal: "Extract table rows from HTML and fail if a field is missing",
      walk: [
        { line: "if tag == 'tr' and 'data-unit' in attributes:", say: "A table row with a `data-unit` attribute starts a new record." },
        { line: "self.field = attributes.get('class')", say: "Remember which field the next text belongs to, from the cell's class name." },
        { line: "raise ValueError('required field missing or renamed')", say: "If the site renames a class, the scraper stops instead of returning half-empty rows." },
      ],
    },
    "3.3.7 Make a notebook experiment reproducible across runtimes#0": {
      goal: "Fingerprint the data and save a run manifest",
      walk: [
        { line: "data_hash = hashlib.sha256(data).hexdigest()", say: "A SHA-256 hash: change one byte of the data and this 64-character string changes completely." },
        { line: "manifest = {'input_sha256':data_hash, 'python':platform.python_version(),", say: "Record the data hash, Python version, seed and split rule together." },
        { line: "assert restored['input_sha256'] == hashlib.sha256(data).hexdigest()", say: "Reading the manifest back confirms the same data was used." },
      ],
    },
  },
};

/** Easy layer: Plotting & scikit-learn. */
export const PLOTTING_SKLEARN: EasyTopic = {
  sections: {
    "Always plot first": {
      plain: "Three plots answer most first questions: a histogram (what values does one column take?), a scatter plot (do two columns move together?) and a line plot (is the training loss going down?).",
    },
    "Explained in depth": {
      plain: "First how to look at data, then scikit-learn's common interface (fit, transform, predict), then pipelines, then how to make results repeatable.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Same numbers, different pictures",
          blocks: [
            { p: "In Anscombe's quartet, four small datasets all have mean x = 9, mean y ≈ 7.5 and correlation ≈ 0.82. Plotted, one is a straight line with noise, one is a curve, one is a perfect line with a single outlier, and one is a vertical stack with one far point. Only the plots show the difference." },
          ],
        },
        {
          at: 3,
          title: "The interface in four lines",
          blocks: [
            { list: ["`scaler.fit(X_train)` learns each column's mean and standard deviation.", "`scaler.transform(X_test)` applies those same numbers to new rows.", "`model.fit(X_train_scaled, y_train)` learns the weights.", "`model.predict(X_test_scaled)` returns labels; `predict_proba` returns probabilities."] },
          ],
        },
        {
          at: 4,
          kind: "idea",
          title: "What a pipeline saves you from",
          blocks: [
            { p: "Without a pipeline, it is easy to scale all 1,000 rows and then split. The test rows have then helped set the mean and standard deviation, so the test score is slightly too optimistic. `make_pipeline(StandardScaler(), model)` refits the scaler on the training part of every split automatically." },
          ],
        },
      ],
    },
    "The scikit-learn pattern": {
      plain: "Split, preprocess, fit, predict, evaluate. Every scikit-learn model follows these five steps, so learning them once means you can use any model.",
    },
    "Why the pipeline matters": {
      examples: [
        {
          title: "Leakage in numbers",
          blocks: [
            { p: "Training rows have heights averaging 160 cm; the test rows average 175 cm. Scaling with the overall mean (say 163) quietly tells the model something about the test set. Scaling with the training mean (160) keeps the test set unseen, which is what happens in real use." },
          ],
        },
      ],
    },
    "Swapping models": {
      plain: "Because every model has `fit` and `predict`, trying a different algorithm is one changed line.",
    },
    "1.24.3 A plot is a view with a defined denominator": {
      plain: "Every plot hides choices: which rows went in, how bins were drawn, how many points overlap. Say what each mark counts.",
    },
    "1.24.4 Explain the difference between profiling and hypothesis testing": {
      plain: "Profiling lists what is in the data. It can suggest questions but cannot prove anything; a test needs a question decided before looking.",
      examples: [
        {
          at: 2,
          title: "Same rate, very different certainty",
          blocks: [
            { p: "Site A: 20 positives in 100 (20%). Site B: 2 in 10 (20%). Same rate, but one more or one fewer positive at site B moves its rate to 30% or 10%, while at site A it only moves to 21% or 19%. Always show the counts next to the rates." },
          ],
        },
      ],
    },
    "1.24.5 Select distribution and relationship plots by the question": {
      plain: "Pick the plot from the question: one number's spread (histogram, box plot), two numbers together (scatter), a number across groups (box or violin), counts per group (bar chart).",
      examples: [
        {
          at: 5,
          title: "Reading a box plot",
          blocks: [
            { p: "Wait times 4, 5, 7, 8, 9, 11, 30 minutes. Median 8. Quartiles about 6 and 10, so the box spans 6 to 10 (IQR = 4). Whiskers reach values within 1.5 × 4 = 6 of the box, so up to 16. The 30 is drawn as a separate dot: unusual, but the plot cannot say whether it is an error." },
          ],
        },
      ],
    },
    "Textbook case: A Reproducible Tabular Workflow in Python": {
      plain: "A library-branch dataset used to practise reading data, profiling it, building a pipeline and validating by whole branches.",
    },
    "3.5.1 Parse CSV, JSON, and SQL with explicit keys and units": {
      plain: "Whatever the source (CSV, JSON or a database), declare the types, keep IDs as text and check that keys are unique after every step.",
    },
    "3.5.2 Inspect a dataframe with counts, denominators, and cohort structure": {
      plain: "Start every report with counts: rows, unique keys, missing values per column, duplicates. Rates without their counts can mislead.",
      examples: [
        {
          at: 1,
          title: "Two kinds of missing",
          blocks: [
            { p: "10 rows × 4 feature columns = 40 cells, of which 3 are blank. That is 3/40 = 7.5% of cells. If the 3 blanks are in 3 different rows, 30% of rows have at least one gap. Both statements are true; say which one you mean." },
          ],
        },
      ],
    },
    "3.5.3 Fit distinct numeric and categorical transforms within a model": {
      plain: "Numbers and categories need different preparation: fill and scale numbers, fill and one-hot encode categories. `ColumnTransformer` does both inside one pipeline.",
    },
    "3.5.4 Cross-validation and threshold choice remain separate decisions": {
      plain: "Cross-validation estimates how well the model works on unseen groups. Choosing the probability cut-off (for example 0.5 or 0.3) is a separate decision made from those out-of-fold predictions.",
      examples: [
        {
          at: 2,
          title: "Moving the threshold",
          blocks: [
            { table: { head: ["Threshold", "Flagged", "Positives caught (of 2)", "Precision", "Recall"], rows: [["0.5", "0.6, 0.9", "1 (0.9)", "1/2", "1/2"], ["0.3", "0.4, 0.6, 0.9", "2", "2/3", "2/2"]] } },
            { p: "Lowering the threshold catches every positive at the cost of one more false alarm." },
          ],
        },
      ],
    },
    "3.5.5 Debug the whole chain with explicit checks": {
      plain: "Put a check at each hand-off: unique keys when reading, earlier-than-cutoff timestamps when building features, separate groups when splitting, sensible probabilities when predicting.",
    },
    "2.25.4 Profiling, reproducible exploration, and a handoff to modeling": {
      plain: "Automatic profiles are a to-do list for questions, not answers. Every number in a report needs its filter and denominator.",
    },
    "2.25.5 Build a profiling report with explicit checks and failure thresholds": {
      plain: "A good profile reports problems instead of hiding them: duplicates, blanks and impossible values each get counted and named.",
    },
    "3.4.1 Data and experiment discovery are provenance tasks": {
      plain: "Before using a dataset, find out what one row is, how the label was made, which years and places it covers, and whether you are allowed to use it.",
    },
    "3.4.2 Automated EDA tools should generate questions, not conclusions": {
      plain: "Interactive tools are great for spotting oddities. Reproduce anything important in code, and note any rows the tool filtered out.",
      examples: [
        {
          at: 1,
          title: "A silent filter",
          blocks: [
            { p: "120 records, 30 without a site ID. If 18 of the remaining 90 are positive, the tool shows 20%. That is a rate among records **with** a site, not among all 120 records." },
          ],
        },
      ],
    },
    "3.4.4 Interpretability tools answer distinct questions": {
      plain: "Explanation tools describe the model, not the world. A local explanation is about one prediction; a global one summarises the whole model. Neither proves cause and effect.",
    },
    "3.4.5 Interfaces are a test of the contract, not a test of accuracy": {
      plain: "A demo app shows the model runs on valid input. It says nothing about accuracy; that comes from held-out evaluation.",
    },
    "3.4.6 A compact tool-selection record": {
      plain: "Before adding a library, write down what it does, what it learns from data, how it handles odd input, and how you will maintain it.",
    },
    "3.4.7 Reconstruct a suggested visualization from its data contract": {
      plain: "Chart recommenders rank plots by simple scores such as correlation. Check the ranking against the raw rows before believing it.",
    },
    "3.4.8 Compare image transfer models through one inference contract": {
      plain: "To compare two image models fairly, give each its own correct preprocessing and score both on the same labelled images.",
      examples: [
        {
          at: 1,
          title: "Softmax by hand",
          blocks: [
            { p: "Logits $(3, 1, 0)$. Subtract the largest (3): $(0, -2, -3)$. Exponentiate: $(1, 0.135, 0.050)$, sum $1.185$. Probabilities: $(0.844, 0.114, 0.042)$. Subtracting the maximum does not change the answer but avoids overflow for big logits." },
          ],
        },
      ],
    },
  },
  code: {
    "Always plot first#0": {
      goal: "Draw the three first-look plots: histogram, scatter, training curve",
      code: r`import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
hours = rng.uniform(0, 8, 200)
df = pd.DataFrame({"hours": hours, "marks": (35 + 6 * hours + rng.normal(0, 8, 200)).clip(0, 100)})
losses = 2.0 * np.exp(-np.arange(30) / 8) + 0.2          # a made-up training curve

fig, axes = plt.subplots(1, 3, figsize=(12, 3.5))
axes[0].hist(df["marks"], bins=20)                       # distribution of one feature
axes[0].set(xlabel="marks", ylabel="students", title="One feature")
axes[1].scatter(df["hours"], df["marks"], s=10)          # relationship between two
axes[1].set(xlabel="hours studied", ylabel="marks", title="Two features")
axes[2].plot(losses)                                     # a training curve
axes[2].set(xlabel="epoch", ylabel="loss", title="Training curve")
fig.tight_layout()
fig.savefig("plot_first.png")                            # in a notebook, plt.show() instead
print("rows:", len(df), "| mean marks:", round(df["marks"].mean(), 1), "| correlation:", round(df["hours"].corr(df["marks"]), 2))

# Output:
# rows: 200 | mean marks: 60.2 | correlation: 0.86`,
      figure: { src: "/theory/figures/code/plot_first.svg", alt: "Three panels: a histogram of marks, a scatter of hours vs marks rising together, and a training loss curve falling and levelling off." },
      walk: [
        { line: "df = pd.DataFrame({\"hours\": hours, \"marks\": (35 + 6 * hours + rng.normal(0, 8, 200)).clip(0, 100)})", say: "Make 200 fake students: marks rise with hours, plus noise." },
        { line: "axes[0].hist(df[\"marks\"], bins=20)", say: "Histogram: how many students fall in each band of marks." },
        { line: "axes[1].scatter(df[\"hours\"], df[\"marks\"], s=10)", say: "Scatter: one dot per student. An upward cloud means the two columns rise together." },
        { line: "axes[2].plot(losses)", say: "Line plot of the loss per epoch: it should fall and then flatten." },
        { line: "fig.savefig(\"plot_first.png\")", say: "Save to a file. In a notebook you would call `plt.show()` instead." },
      ],
    },
    "The scikit-learn pattern#0": {
      goal: "The five-step scikit-learn pattern on a real dataset",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

X, y = load_breast_cancer(return_X_y=True)          # 569 tumours, 30 measurements each
print("X shape:", X.shape, "| classes:", sorted(set(y.tolist())))

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)   # 1. split

model = make_pipeline(StandardScaler(), LogisticRegression())  # 2. preprocess + model
model.fit(X_train, y_train)                         # 3. fit (scaler learns from train only)

pred = model.predict(X_test)                        # 4. predict
print("accuracy:", round(accuracy_score(y_test, pred), 3))  # 5. evaluate
print(classification_report(y_test, pred, digits=3))

# Output:
# X shape: (569, 30) | classes: [0, 1]
# accuracy: 0.982
#               precision    recall  f1-score   support
# 
#            0      0.976     0.976     0.976        42
#            1      0.986     0.986     0.986        72
# 
#     accuracy                          0.982       114
#    macro avg      0.981     0.981     0.981       114
# weighted avg      0.982     0.982     0.982       114`,
      walk: [
        { line: "X, y = load_breast_cancer(return_X_y=True)", say: "A dataset that ships with scikit-learn: 569 tumours, 30 measurements each, label 0 (malignant) or 1 (benign)." },
        { line: "X, y, test_size=0.2, random_state=42, stratify=y)   # 1. split", say: "Keep 20% aside for testing. `stratify=y` keeps the class mix the same in both parts." },
        { line: "model = make_pipeline(StandardScaler(), LogisticRegression())  # 2. preprocess + model", say: "Scaling and the model joined into one object." },
        { line: "model.fit(X_train, y_train)", say: "Fits the scaler and then the model, both on the training rows only." },
        { line: "print(classification_report(y_test, pred, digits=3))", say: "Precision, recall and F1 for each class on the unseen test rows." },
      ],
    },
    "Swapping models#0": {
      goal: "Try three different models with the same five steps",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

for clf in [LogisticRegression(), KNeighborsClassifier(5), DecisionTreeClassifier(max_depth=4, random_state=0)]:
    m = make_pipeline(StandardScaler(), clf).fit(X_train, y_train)   # same steps, different model
    print(f"{type(clf).__name__:<24} test accuracy {m.score(X_test, y_test):.3f}")

# Output:
# LogisticRegression       test accuracy 0.982
# KNeighborsClassifier     test accuracy 0.956
# DecisionTreeClassifier   test accuracy 0.947`,
      walk: [
        { line: "for clf in [LogisticRegression(), KNeighborsClassifier(5), DecisionTreeClassifier(max_depth=4, random_state=0)]:", say: "Three algorithms; nothing else in the code changes." },
        { line: "m = make_pipeline(StandardScaler(), clf).fit(X_train, y_train)   # same steps, different model", say: "Same pipeline, different final step." },
        { line: "print(f\"{type(clf).__name__:<24} test accuracy {m.score(X_test, y_test):.3f}\")", say: "`score` gives accuracy for classifiers. With one split, small differences may just be luck; use cross-validation to compare properly." },
      ],
    },
    "1.24.3 A plot is a view with a defined denominator#0": {
      goal: "Plot two periods and the forecast cutoff, with labelled axes",
      figure: { src: "/theory/figures/code/period_plot.svg", alt: "Visitors by day: training period days 1-4, later period days 5-6, a dotted vertical line at the cutoff." },
      walk: [
        { line: "ax.plot(times[:4],counts[:4],marker='o',label='training period')", say: "The first four days, drawn as one labelled line." },
        { line: "ax.axvline(4.5,color='gray',linestyle=':',label='forecast cutoff')", say: "A vertical line marks where training data ends." },
        { line: "ax.set(xlabel='day index',ylabel='visitors (people)',title='Observed visits by period')", say: "Always label axes with units." },
        { line: "fig.savefig(buffer,format='png',dpi=80)", say: "Save into memory instead of a file, so the example runs anywhere." },
      ],
    },
    "1.24.5 Select distribution and relationship plots by the question#0": {
      goal: "Draw six plot types for six different questions",
      figure: { src: "/theory/figures/code/six_views.svg", alt: "Six panels: a histogram of wait times, two scatter plots, a bar chart of counts per site, a bar chart of mean wait per site, and box plots of wait by site." },
      walk: [
        { line: "axes[0,0].hist(wait_min,bins=[0,4,8,12,16],edgecolor='black')", say: "Histogram with explicit bin edges, so the picture is reproducible." },
        { line: "axes[0,1].scatter(temperature_c[mask],visitors[mask],marker=marker,label=f'{label} (n={mask.sum()})')", say: "Scatter per site with different markers; the legend shows how many points each site has." },
        { line: "axes[1,0].bar(['North','South'],[6,4],color=['#3b74a5','#df923e'])", say: "Bar chart of counts: how many site-days each site contributed." },
        { line: "axes[1,1].bar(['North','South'],[wait_min[site==label].mean() for label in ['North','South']])", say: "Bar chart of a statistic (mean wait). The title must say it is a mean." },
        { line: "axes[1,2].boxplot([wait_min[site==label] for label in ['North','South']],tick_labels=['North','South'])", say: "Box plots compare the whole spread of waits at each site." },
      ],
    },
    "3.5.1 Parse CSV, JSON, and SQL with explicit keys and units#0": {
      goal: "Read the same records from CSV, JSON and SQLite, keeping IDs as text",
      code: r`from io import StringIO
import json
import sqlite3
import pandas as pd

raw = StringIO('branch,hour,seats\n0012,2026-05-01T09:00:00,12\n0013,2026-05-01T09:00:00,8\n')
frame = pd.read_csv(raw, dtype={'branch': str}, parse_dates=['hour'])
assert list(frame['branch']) == ['0012', '0013']
assert frame['seats'].sum() == 20

payload = frame.assign(hour=frame['hour'].dt.strftime('%Y-%m-%dT%H:%M:%S')).to_dict(orient='records')
decoded = pd.DataFrame(json.loads(json.dumps(payload)))
assert decoded['branch'].tolist() == ['0012', '0013']

db = sqlite3.connect(':memory:')
frame.assign(hour=frame['hour'].astype(str)).to_sql('hours', db, index=False)
from_sql = pd.read_sql_query('SELECT branch, seats FROM hours ORDER BY branch', db)
assert from_sql['seats'].tolist() == [12, 8]
db.close()
print(frame)
print("branch ids stay text:", frame["branch"].tolist(), "| from SQL:", from_sql.values.tolist())

# Output:
#   branch                hour  seats
# 0   0012 2026-05-01 09:00:00     12
# 1   0013 2026-05-01 09:00:00      8
# branch ids stay text: ['0012', '0013'] | from SQL: [['0012', 12], ['0013', 8]]`,
      walk: [
        { line: "frame = pd.read_csv(raw, dtype={'branch': str}, parse_dates=['hour'])", say: "`dtype={'branch': str}` keeps \"0012\" as text instead of the number 12." },
        { line: "payload = frame.assign(hour=frame['hour'].dt.strftime('%Y-%m-%dT%H:%M:%S')).to_dict(orient='records')", say: "Convert to a list of dicts (JSON-friendly), turning timestamps into text first." },
        { line: "db = sqlite3.connect(':memory:')", say: "A throwaway in-memory database, so no server is needed." },
        { line: "from_sql = pd.read_sql_query('SELECT branch, seats FROM hours ORDER BY branch', db)", say: "Read back with SQL and check the values survived the round trip." },
      ],
    },
    "3.5.2 Inspect a dataframe with counts, denominators, and cohort structure#0": {
      goal: "Count rows, missing values and alert rates per branch",
      code: r`import pandas as pd

events = pd.DataFrame({
    'branch': ['a','a','b','b','b'],
    'hour': [1,2,1,2,3],
    'seats': [12.0,None,8.0,11.0,None],
    'queue_alert': [1,0,0,1,0],
})
assert len(events) == 5
assert events[['branch','hour']].duplicated().sum() == 0
assert events['seats'].isna().sum() == 2
by_branch = events.groupby('branch')['queue_alert'].agg(['size','sum','mean'])
assert by_branch.loc['a','size'] == 2
assert abs(by_branch.loc['b','mean'] - 1/3) < 1e-12
print(by_branch)

# Output:
#         size  sum      mean
# branch                     
# a          2    1  0.500000
# b          3    1  0.333333`,
      walk: [
        { line: "assert events[['branch','hour']].duplicated().sum() == 0", say: "Each branch-hour appears once." },
        { line: "by_branch = events.groupby('branch')['queue_alert'].agg(['size','sum','mean'])", say: "Per branch: number of rows, number of alerts, and alert rate. The size column is the denominator." },
      ],
    },
    "3.5.3 Fit distinct numeric and categorical transforms within a model#0": {
      goal: "Build a ColumnTransformer pipeline and validate on unseen branches",
      code: r`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import GroupKFold

data = pd.DataFrame({
    'branch': [f'b{i//4}' for i in range(24)],
    'seats': [4., 8., np.nan, 16.] * 6,
    'event': ['quiet', 'reading', 'quiet', 'workshop'] * 6,
    'queue_alert': [0, 0, 0, 1] * 6,
})
X = data[['seats', 'event']]
y = data['queue_alert']
groups = data['branch']
preprocess = ColumnTransformer([
    ('numeric', Pipeline([('fill', SimpleImputer(strategy='median')),
                          ('scale', StandardScaler())]), ['seats']),
    ('nominal', Pipeline([('fill', SimpleImputer(strategy='most_frequent')),
                          ('encode', OneHotEncoder(handle_unknown='ignore'))]), ['event']),
])
model = Pipeline([('prepare', preprocess),
                  ('classifier', LogisticRegression(max_iter=200))])
train, valid = next(GroupKFold(n_splits=3).split(X, y, groups))
assert set(groups.iloc[train]).isdisjoint(set(groups.iloc[valid]))
model.fit(X.iloc[train], y.iloc[train])
probs = model.predict_proba(X.iloc[valid])[:, 1]
assert probs.shape == (len(valid),)
assert np.isfinite(probs).all()
assert ((probs >= 0) & (probs <= 1)).all()
print("validation branches:", sorted(set(groups.iloc[valid])))
print("predicted alert probabilities:", probs.round(3))

# Output:
# validation branches: ['b2', 'b5']
# predicted alert probabilities: [0.022 0.086 0.081 0.81  0.022 0.086 0.081 0.81 ]`,
      walk: [
        { line: "('numeric', Pipeline([('fill', SimpleImputer(strategy='median')),", say: "Numbers: fill gaps with the training median, then standardise." },
        { line: "('encode', OneHotEncoder(handle_unknown='ignore'))]), ['event']),", say: "Categories: fill gaps with the most common value, then one-hot encode. Unknown categories become all zeros instead of an error." },
        { line: "train, valid = next(GroupKFold(n_splits=3).split(X, y, groups))", say: "Split by branch, so every row of a branch is on one side only." },
        { line: "assert set(groups.iloc[train]).isdisjoint(set(groups.iloc[valid]))", say: "Check that no branch appears in both training and validation." },
        { line: "probs = model.predict_proba(X.iloc[valid])[:, 1]", say: "Probability of an alert for each validation row." },
      ],
    },
    "2.25.5 Build a profiling report with explicit checks and failure thresholds#0": {
      goal: "Write a small profiler that reports duplicates, blanks and impossible values",
      code: r`from collections import Counter, defaultdict
from statistics import median
from datetime import date

records = [
    {'event':'e1','site':'North','collected':'2026-02-01','finalized':'2026-02-03','value':'0.8'},
    {'event':'e2','site':'North','collected':'2026-02-02','finalized':'','value':'1.2'},
    {'event':'e3','site':'South','collected':'2026-02-03','finalized':'2026-02-06','value':''},
    {'event':'e3','site':'South','collected':'2026-02-03','finalized':'2026-02-06','value':''},
    {'event':'e4','site':'','collected':'2026-02-04','finalized':'2026-02-07','value':'-1'},
]
required = ('event','site','collected','finalized','value')
n = len(records)
missing = {column: sum(not row[column].strip() for row in records) for column in required}
duplicates = {key: count for key, count in Counter(row['event'] for row in records).items() if count>1}
invalid = []
valid_values = []
by_site = defaultdict(lambda: {'rows':0,'missing_value':0})
for row in records:
    date.fromisoformat(row['collected'])
    if row['finalized']:
        assert date.fromisoformat(row['finalized']) >= date.fromisoformat(row['collected'])
    by_site[row['site']]['rows'] += 1
    by_site[row['site']]['missing_value'] += not bool(row['value'])
    if row['value']:
        value = float(row['value'])
        if value < 0:
            invalid.append(row['event'])
        else:
            valid_values.append(value)
profile = {'rows':n, 'missing_count':missing, 'missing_rate':{k:v/n for k,v in missing.items()},
           'duplicate_event_ids':duplicates, 'negative_measurement_events':invalid,
           'observed_median':median(valid_values), 'by_site':dict(by_site)}
assert profile['missing_rate']['value'] == 2/5
assert profile['duplicate_event_ids'] == {'e3':2}
assert profile['negative_measurement_events'] == ['e4']
assert profile['by_site']['South']['missing_value'] == 2
for key in ("rows", "missing_rate", "duplicate_event_ids", "negative_measurement_events", "observed_median"):
    print(key, "->", profile[key])

# Output:
# rows -> 5
# missing_rate -> {'event': 0.0, 'site': 0.2, 'collected': 0.0, 'finalized': 0.2, 'value': 0.4}
# duplicate_event_ids -> {'e3': 2}
# negative_measurement_events -> ['e4']
# observed_median -> 1.0`,
      walk: [
        { line: "missing = {column: sum(not row[column].strip() for row in records) for column in required}", say: "Count blank fields per column." },
        { line: "duplicates = {key: count for key, count in Counter(row['event'] for row in records).items() if count>1}", say: "Event IDs that appear more than once (e3 twice)." },
        { line: "invalid.append(row['event'])", say: "Negative measurements are listed, not silently dropped." },
        { line: "'observed_median':median(valid_values)", say: "The median of the valid values only (0.8 and 1.2, so 1.0)." },
      ],
    },
    "3.4.7 Reconstruct a suggested visualization from its data contract#0": {
      goal: "Rank candidate scatter plots by correlation, as a chart recommender would",
      code: r`from math import sqrt, isfinite

observations = [
    {'hour':1, 'bikes':4,  'temperature':18, 'wind':12},
    {'hour':2, 'bikes':7,  'temperature':20, 'wind':11},
    {'hour':3, 'bikes':10, 'temperature':24, 'wind':8},
    {'hour':4, 'bikes':6,  'temperature':21, 'wind':13},
    {'hour':5, 'bikes':12, 'temperature':27, 'wind':9},
]
def correlation(x, y):
    assert len(x)==len(y) and len(x)>1
    mx, my = sum(x)/len(x), sum(y)/len(y)
    xx, yy = [a-mx for a in x], [b-my for b in y]
    denominator = sqrt(sum(a*a for a in xx)*sum(b*b for b in yy))
    return None if denominator == 0 else sum(a*b for a,b in zip(xx,yy))/denominator

outcome = [row['bikes'] for row in observations]
candidates = {column: correlation([row[column] for row in observations],outcome)
              for column in ('temperature','wind')}
ranked = sorted(((name,abs(score)) for name,score in candidates.items() if score is not None),
                key=lambda item:(-item[1],item[0]))
assert len(ranked)==2 and all(isfinite(score) and score<=1 for _,score in ranked)
print("correlation with bikes:", {k: round(v, 3) for k, v in candidates.items()})
print("ranked by |r|:", [(name, round(s, 3)) for name, s in ranked])

# Output:
# correlation with bikes: {'temperature': 0.974, 'wind': -0.846}
# ranked by |r|: [('temperature', 0.974), ('wind', 0.846)]`,
      walk: [
        { line: "denominator = sqrt(sum(a*a for a in xx)*sum(b*b for b in yy))", say: "The bottom of Pearson's formula; if a column never varies it is 0, and correlation is undefined." },
        { line: "ranked = sorted(((name,abs(score)) for name,score in candidates.items() if score is not None),", say: "Rank by the size of the correlation, ignoring its sign: temperature (0.97) beats wind (0.85)." },
      ],
    },
    "3.4.8 Compare image transfer models through one inference contract#0": {
      goal: "Turn logits into probabilities and compare two models on the same images",
      code: r`import numpy as np

labels = np.array([0,1,2])
outputs = {
  'candidate_A': np.array([[3.,1.,0.],[1.,2.,0.],[0.,2.,1.]]),
  'candidate_B': np.array([[2.,1.,0.],[2.,3.,0.],[0.,1.,3.]]),
}
def softmax(logits):
    centered = logits-logits.max(axis=1,keepdims=True)
    exponent = np.exp(centered)
    return exponent/exponent.sum(axis=1,keepdims=True)
results = {}
for name, logits in outputs.items():
    probabilities = softmax(logits)
    guesses = probabilities.argmax(axis=1)
    correct = int((guesses==labels).sum())
    results[name] = {'correct':correct,'denominator':len(labels),
                     'per_class_correct':[int(guesses[i]==labels[i]) for i in range(len(labels))]}
    assert np.allclose(probabilities.sum(axis=1),1.)
assert results['candidate_A']['correct']==2
assert results['candidate_B']['correct']==3
for name, r in results.items():
    print(name, "correct:", r["correct"], "of", r["denominator"], "| per image:", r["per_class_correct"])

# Output:
# candidate_A correct: 2 of 3 | per image: [1, 1, 0]
# candidate_B correct: 3 of 3 | per image: [1, 1, 1]`,
      walk: [
        { line: "centered = logits-logits.max(axis=1,keepdims=True)", say: "Subtract each row's largest logit for numerical safety." },
        { line: "return exponent/exponent.sum(axis=1,keepdims=True)", say: "Divide by the row total so each row's probabilities add to 1." },
        { line: "guesses = probabilities.argmax(axis=1)", say: "The predicted class is the one with the highest probability." },
      ],
    },
  },
};

/** Easy layer: Statistics: Inference & Testing. */
export const STATS_INFERENCE: EasyTopic = {
  sections: {
    "The idea": {
      plain: "If you measured a different handful of orders, you would get a different average. Inference asks how much that average could wobble, and whether a difference you see is bigger than the wobble.",
    },
    "Step 1: a sample mean is itself random": {
      examples: [
        {
          kind: "idea",
          title: "Two samples, two averages",
          blocks: [
            { p: "Monday's 8 orders average 31.75 minutes. Suppose Tuesday's 8 average 30.6. Neither is \"the\" true average; both are estimates. The standard error (about 1 minute here) says how far apart such estimates typically are." },
          ],
        },
      ],
    },
    "Step 2: confidence intervals": {
      examples: [
        {
          title: "Bigger sample, narrower interval",
          blocks: [
            { p: "Keep the same spread $s = 2.816$ but time 32 orders instead of 8: SE $= 2.816/\\sqrt{32} = 0.498$ and $t^* \\approx 2.04$, so the interval is about $31.75 \\pm 1.02$, half as wide as before." },
          ],
        },
      ],
    },
    "Step 3: hypothesis tests and p-values": {
      examples: [
        {
          kind: "idea",
          title: "A courtroom analogy",
          blocks: [
            { p: "The null hypothesis is \"innocent\". The p-value asks how surprising the evidence would be if the defendant were innocent. Weak evidence leads to \"not guilty\", which is not the same as \"proven innocent\": with p = 0.12 we have not shown the app keeps its promise, only that 8 orders are not enough to show it breaks it." },
          ],
        },
      ],
    },
    "Step 5: choosing the right test": {
      examples: [
        {
          title: "Match the question to the test",
          blocks: [
            { list: ["\"Is our model's accuracy above 90% on this test set?\" One proportion versus a target: one-sample proportion test or a confidence interval.", "\"Do customers in two cities spend different amounts?\" Two independent groups of numbers: Welch t-test.", "\"Did the same users spend more after the redesign?\" Before and after on the same people: paired t-test.", "\"Is the device type related to churn (yes/no)?\" Two categories: chi-square test."] },
          ],
        },
      ],
    },
    "Step 6: the bootstrap, when formulas run out": {
      code: [
        {
          goal: "Bootstrap a confidence interval for the median",
          code: r`import numpy as np

x = np.array([31, 28, 35, 30, 33, 29, 36, 32], dtype=float)   # delivery times (minutes)
rng = np.random.default_rng(0)

medians = []
for _ in range(10_000):
    resample = rng.choice(x, size=len(x), replace=True)   # same size, with replacement
    medians.append(np.median(resample))

low, high = np.percentile(medians, [2.5, 97.5])
print("sample median:", np.median(x))
print("bootstrap 95% interval for the median:", round(low, 2), "to", round(high, 2))

# Output:
# sample median: 31.5
# bootstrap 95% interval for the median: 29.0 to 34.51`,
          walk: [
            { line: "resample = rng.choice(x, size=len(x), replace=True)", say: "Draw 8 orders from our 8, with replacement: some repeat, some are left out." },
            { line: "medians.append(np.median(resample))", say: "Compute the statistic we care about on each resample." },
            { line: "low, high = np.percentile(medians, [2.5, 97.5])", say: "The middle 95% of the 10,000 resampled medians is the interval." },
          ],
        },
      ],
    },
    "Textbook case: Probability, Dependence, and Statistical Evidence": {
      plain: "Invented visits to cooling centres are used to practise conditional probability, distributions, entropy and statistical tests, with every number small enough to check by hand.",
    },
    "1.3.1 Events, conditionals, and the base-rate calculation": {
      plain: "Turn percentages into counts out of 10,000 and the answer becomes simple counting.",
      examples: [
        {
          at: 1,
          title: "The 10,000 visits as a table",
          blocks: [
            { table: { head: ["", "Flagged", "Not flagged", "Total"], rows: [["Needs outreach", "180", "20", "200"], ["Does not", "980", "8,820", "9,800"], ["Total", "1,160", "8,840", "10,000"]] } },
            { p: "Of the 1,160 flagged visits, only 180 really need outreach: $180/1{,}160 = 15.5\\%$." },
          ],
        },
      ],
    },
    "1.3.2 Density, distribution, and transformations of probability": {
      plain: "Discrete outcomes get probabilities that add to 1. Continuous ones get a density, and probabilities come from areas under it, never from the height at a single point.",
      examples: [
        {
          at: 2,
          title: "Mean and variance from a table",
          blocks: [
            { table: { head: ["Visits $x$", "0", "1", "2"], rows: [["$P(x)$", "0.2", "0.5", "0.3"], ["$x \\cdot P(x)$", "0", "0.5", "0.6"], ["$x^2 \\cdot P(x)$", "0", "0.5", "1.2"]] } },
            { p: "Mean = 0 + 0.5 + 0.6 = 1.1. Second moment = 1.7. Variance = 1.7 − 1.1² = 0.49." },
          ],
        },
      ],
    },
    "1.3.3 Entropy, information gain, and mutual information": {
      plain: "Entropy measures how unpredictable an outcome is: 1 bit for a fair coin, 0 bits when you already know the answer. Information gain is how much a feature reduces that unpredictability. Decision trees use it to choose splits.",
      examples: [
        {
          at: 0,
          title: "Entropy of three bags of marbles",
          blocks: [
            { list: ["All red: $H = 0$ bits. No surprise at all.", "Half red, half blue: $H = -(0.5\\log_2 0.5 + 0.5\\log_2 0.5) = 1$ bit.", "90% red, 10% blue: $H = -(0.9\\log_2 0.9 + 0.1\\log_2 0.1) = 0.469$ bits. Mostly predictable."] },
          ],
        },
      ],
      code: [
        {
          goal: "Compute entropy and mutual information from scratch",
          code: r`from collections import Counter
from math import log2

def entropy(labels):
    n = len(labels)
    return -sum((c / n) * log2(c / n) for c in Counter(labels).values())

def mutual_information(x, y):
    n = len(y)
    h_y_given_x = 0.0
    for value, count in Counter(x).items():
        subset = [yi for xi, yi in zip(x, y) if xi == value]   # rows with this feature value
        h_y_given_x += (count / n) * entropy(subset)            # weighted entropy inside the group
    return entropy(y) - h_y_given_x

y = [0, 0, 1, 1]
print("H(Y):", entropy(y))
print("I(X;Y) with X = A,A,B,B:", mutual_information(["A", "A", "B", "B"], y))
print("I(X;Y) with X = A,B,A,B:", mutual_information(["A", "B", "A", "B"], y))

# Output:
# H(Y): 1.0
# I(X;Y) with X = A,A,B,B: 1.0
# I(X;Y) with X = A,B,A,B: 0.0`,
          walk: [
            { line: "return -sum((c / n) * log2(c / n) for c in Counter(labels).values())", say: "Entropy: for each class, share × log₂(share), summed and negated." },
            { line: "subset = [yi for xi, yi in zip(x, y) if xi == value]   # rows with this feature value", say: "Group the labels by feature value." },
            { line: "h_y_given_x += (count / n) * entropy(subset)            # weighted entropy inside the group", say: "Entropy left after knowing the feature, weighted by group size." },
            { line: "return entropy(y) - h_y_given_x", say: "Mutual information: how much uncertainty the feature removes. 1 bit when the feature decides the label, 0 when it says nothing." },
          ],
        },
      ],
    },
    "1.3.4 Sampling variation, confidence intervals, and p values": {
      plain: "A rate from a sample wobbles; its standard error says by how much. A permutation test shuffles the group labels many times to see how big a difference luck alone produces.",
      examples: [
        {
          at: 0,
          title: "Standard error of a rate",
          blocks: [
            { p: "30 clicks in 200 visits: $\\hat p = 0.15$. SE $= \\sqrt{0.15 \\times 0.85/200} = 0.025$. A rough 95% interval is $0.15 \\pm 1.96 \\times 0.025 = [0.10, 0.20]$." },
          ],
        },
      ],
    },
    "1.3.5 Choose t, ANOVA, chi-square, or correlation by the question": {
      plain: "Means of one or two groups: t-test. Means of three or more: ANOVA. Two categorical variables: chi-square. Two numbers moving together: correlation.",
      examples: [
        {
          at: 1,
          title: "Chi-square step by step",
          blocks: [
            {
              steps: [
                { title: "Observed", body: "Schedule A: 6 flagged, 4 not. Schedule B: 2 flagged, 8 not." },
                { title: "Expected if unrelated", body: "Row total × column total ÷ grand total. Flagged: 10 × 8/20 = 4 in each row; not flagged: 10 × 12/20 = 6." },
                { title: "Statistic", body: "Sum of (observed − expected)² / expected over the four cells.", math: r`\chi^2 = \frac{2^2}{4} + \frac{2^2}{6} + \frac{2^2}{4} + \frac{2^2}{6} = 3.33` },
              ],
            },
          ],
        },
      ],
    },
    "Textbook case: Statistical Evidence and Decision Thresholds": {
      plain: "Two parcel-routing policies are compared to practise distributions, intervals, tests and contingency tables, and to see why the unit of assignment (route, not parcel) matters.",
    },
    "1.4.1 Distributions, quantiles, and uncertainty": {
      plain: "A percentile describes where values fall (90% of deliveries arrive within $t_{0.90}$ minutes). It is not a statement about uncertainty in an estimate.",
      replace: {
        2: { p: "Sample mean $\\bar t = \\sum_i t_i/n$; sample median is a middle ordered value. The mean can move substantially under a few extreme delays. A sample variance with denominator $n - 1$ is $\\sum_i (t_i - \\bar t)^2/(n-1)$, while a population variance uses a population expectation. Robust summaries such as the median and interquartile range can be preferable for skewed delays, but the mean still matters for total cost." },
        3: { p: "A z-score $z = (t - \\mu)/\\sigma$ is a standardized difference from a specified mean and standard deviation. Standardizing arbitrary data does not make them normally distributed. A long-tailed travel-time distribution can have many legitimate large z-scores." },
      },
      examples: [
        {
          at: 4,
          title: "Answer to the exercise",
          blocks: [
            { p: "Times 10, 12, 13, 15, 50: mean $= 100/5 = 20$, median $= 13$. Four of five deliveries took 15 minutes or less, so 13 describes a typical delivery better. The 50 still matters for a service agreement because it is exactly the kind of late delivery the agreement is about." },
          ],
        },
      ],
    },
    "1.4.2 Confidence intervals and sampling design": {
      plain: "An interval is only as good as its sampling assumptions. If parcels on one route share delays, 10,000 parcels from 20 routes carry far less information than 10,000 independent parcels.",
      replace: {
        1: { p: "Suppose the average delivery-time difference between two policies is $-2$ minutes, with estimated standard error 0.75 minutes. A rough symmetric 95% interval using 1.96 as a large-sample critical value is $-2 \\pm 1.47$, approximately $[-3.47, -0.53]$ minutes. If its assumptions hold, both endpoints suggest a reduction; the interval still does not establish that the reduction is worth the cost." },
        3: { p: "For a binary late-delivery rate, the familiar Wald interval $\\hat p \\pm 1.96\\sqrt{\\hat p(1-\\hat p)/n}$ can perform poorly when the event count is small or near zero, even with independent Bernoulli observations. A Wilson score interval is often more reliable for a single proportion under that model." },
      },
      examples: [
        {
          at: 3,
          title: "When the simple interval breaks",
          blocks: [
            { p: "0 late deliveries in 100: the Wald interval is $0 \\pm 0$, claiming certainty that the rate is exactly 0. The Wilson interval is $[0, 0.037]$: we have not seen a late delivery, but a rate up to about 3.7% is still plausible." },
          ],
        },
      ],
    },
    "1.4.3 Hypothesis tests and error tradeoffs": {
      plain: "A test asks whether the observed difference is bigger than chance would usually produce. Making false alarms rarer makes missed effects more common, unless you collect more data.",
      examples: [
        {
          at: 3,
          title: "All six ways to assign the policy",
          blocks: [
            { table: { head: ["Routes given policy B", "B mean − A mean"], rows: [["10, 12", "11 − 15 = −4"], ["10, 14", "12 − 14 = −2"], ["10, 16", "13 − 13 = 0"], ["12, 14", "13 − 13 = 0"], ["12, 16", "14 − 12 = 2"], ["**14, 16 (observed)**", "**15 − 11 = 4**"]] } },
            { p: "Two of the six (−4 and 4) are at least as extreme as what we saw, so p = 2/6 = 1/3. With only four routes, even the biggest possible difference is not convincing." },
          ],
        },
      ],
    },
    "1.4.4 Contingency tables and categorical association": {
      plain: "Put two categorical variables in a table of counts, compare the counts with what you would expect if the variables were unrelated, and always report the rates too.",
      replace: {
        0: { p: "For two categorical variables, a contingency table counts observations in each category pair. Under a null of independence in a table with row totals $R_i$, column totals $C_j$ and grand total $N$, the expected count for cell $(i, j)$ is $E_{ij} = R_i C_j/N$. A Pearson chi-square statistic sums $(O_{ij} - E_{ij})^2/E_{ij}$ over cells, where $O_{ij}$ is the observed count. Expected counts that are too small can make the usual approximation unreliable." },
      },
      examples: [
        {
          at: 1,
          title: "Finish the calculation",
          blocks: [
            { p: "Expected late count under independence: $50 \\times 15/100 = 7.5$ for each policy; expected on time: 42.5." },
            { math: r`\chi^2 = \frac{(10 - 7.5)^2}{7.5} + \frac{(5 - 7.5)^2}{7.5} + \frac{(40 - 42.5)^2}{42.5} + \frac{(45 - 42.5)^2}{42.5} = 0.833 + 0.833 + 0.147 + 0.147 = 1.96` },
            { p: "With 1 degree of freedom the 5% critical value is 3.84, so this difference is not statistically clear with 50 routes per policy." },
          ],
        },
      ],
    },
    "1.4.5 Correlation, selection, and the scope of a model": {
      plain: "Correlation measures straight-line association in the data you have. Choose features inside each training fold, and do not trust individual coefficients when features are strongly correlated with each other.",
      replace: {
        0: { p: "Pearson correlation between numeric $X$ and $Y$ is $\\operatorname{cov}(X, Y)/(\\operatorname{sd}(X)\\operatorname{sd}(Y))$ when both standard deviations are nonzero. It ranges from $-1$ to 1 and describes linear association in the measured sample. A value near zero does not imply no nonlinear relationship, and a large value does not establish causation." },
      },
      examples: [
        {
          at: 0,
          title: "Zero correlation, perfect relationship",
          blocks: [
            { p: "$x = (-2, -1, 0, 1, 2)$ and $y = x^2 = (4, 1, 0, 1, 4)$. $y$ is completely determined by $x$, yet the correlation is exactly 0: the left half slopes down and the right half slopes up, and they cancel." },
          ],
        },
      ],
    },
    "Textbook case: Sampling, Intervals, and Statistical Decisions": {
      plain: "Pump-failure data are used to show that every estimate depends on how the units were sampled, and to compute intervals, tests and bootstraps for the right unit.",
    },
    "1.5.1 An estimate inherits its sampling design": {
      plain: "The $\\sigma/\\sqrt{n}$ rule only holds for independent observations from one population. Pumps inspected because an alert fired are not a random sample of all pumps.",
      examples: [
        {
          at: 2,
          title: "Standard error of a failure rate",
          blocks: [
            { p: "12 failures among 200 randomly chosen pumps: $\\hat p = 0.06$, SE $= \\sqrt{0.06 \\times 0.94/200} = 0.017$. Among 200 pumps inspected **after an alert**, 12 failures would describe alerted pumps only, not the whole fleet." },
          ],
        },
      ],
    },
    "1.5.2 Interpret a confidence interval correctly": {
      plain: "\"95% confidence\" describes the method: 95% of intervals built this way contain the truth. Any single interval either contains it or not.",
      examples: [
        {
          at: 1,
          title: "The five-region interval",
          blocks: [
            { p: "Mean 11, $s = \\sqrt 7 = 2.646$, $n = 5$, SE $= 1.183$, $t^*_4 = 2.776$. Interval: $11 \\pm 3.285 = [7.71, 14.29]$. Wide, because five values are very little data." },
          ],
        },
      ],
    },
    "1.5.3 Hypothesis tests ask a narrower question than effect size": {
      plain: "A p-value answers \"could this be luck?\", not \"how big is it?\" or \"is it worth doing?\". Testing many subgroups and reporting the best one creates false discoveries.",
      examples: [
        {
          at: 2,
          title: "Twenty subgroups",
          blocks: [
            { p: "Test 20 subgroups where nothing is really different, each at the 5% level. The chance that at least one looks \"significant\" is $1 - 0.95^{20} = 64\\%$. Decide the main comparison before looking, or correct for the number of tests." },
          ],
        },
      ],
    },
    "1.5.4 Bootstrap the right unit and the right procedure": {
      plain: "Resample whatever was sampled independently. If depots were sampled, resample whole depots with all their pumps, not individual pump records.",
    },
    "1.5.5 Compute a small interval and check assumptions": {
      plain: "The code repeats the five-region interval with SciPy so the numbers above can be checked.",
    },
    "1.5.6 Compare groups with a test whose sampling unit is explicit": {
      plain: "ANOVA asks whether group averages differ by more than the spread inside the groups would explain. F compares the two.",
    },
    "Explained in depth": {
      examples: [
        {
          at: 1,
          title: "Interval and test agree",
          blocks: [
            { p: "Test whether the true mean is 28 minutes instead: 28 lies outside [29.40, 34.10], so a test of $\\mu = 28$ rejects at the 5% level ($t = 3.75/0.996 = 3.77$, p ≈ 0.007)." },
          ],
        },
      ],
    },
  },
  code: {
    "1.3.5 Choose t, ANOVA, chi-square, or correlation by the question#0": {
      goal: "Compute expected counts and the chi-square statistic by hand",
      code: r`from math import isclose

observed = [[6, 4], [2, 8]]
row_totals = [sum(row) for row in observed]
col_totals = [sum(observed[i][j] for i in range(2)) for j in range(2)]
n = sum(row_totals)
expected = [[row_totals[i] * col_totals[j] / n for j in range(2)]
            for i in range(2)]
chi2 = sum((observed[i][j] - expected[i][j]) ** 2 / expected[i][j]
           for i in range(2) for j in range(2))
assert expected == [[4.0, 6.0], [4.0, 6.0]]
assert isclose(chi2, 10 / 3)
print("expected counts:", expected)
print("chi-square statistic:", round(chi2, 3))

# Output:
# expected counts: [[4.0, 6.0], [4.0, 6.0]]
# chi-square statistic: 3.333`,
      walk: [
        { line: "expected = [[row_totals[i] * col_totals[j] / n for j in range(2)]", say: "Expected count in each cell if the two variables were unrelated: row total × column total ÷ grand total." },
        { line: "chi2 = sum((observed[i][j] - expected[i][j]) ** 2 / expected[i][j]", say: "Add up (observed − expected)² / expected over all four cells: 10/3." },
      ],
    },
    "1.4.2 Confidence intervals and sampling design#0": {
      goal: "Code the Wilson interval for a proportion",
      code: r`import math


def wilson_interval(successes, total, z=1.96):
    if not isinstance(total, int) or total <= 0 or not 0 <= successes <= total:
        raise ValueError("Need a valid binomial count")
    phat = successes/total
    denom = 1+z*z/total
    center = (phat+z*z/(2*total))/denom
    half = z*math.sqrt(phat*(1-phat)/total+z*z/(4*total**2))/denom
    return center-half, center+half


low, high = wilson_interval(10, 100)
assert 0.054 < low < 0.057 and 0.173 < high < 0.176
assert wilson_interval(0, 100)[0] == 0.0
print("Wilson 95% interval for 10/100:", tuple(round(v, 4) for v in (low, high)))
print("Wilson 95% interval for 0/100:", tuple(round(v, 4) for v in wilson_interval(0, 100)))

# Output:
# Wilson 95% interval for 10/100: (0.0552, 0.1744)
# Wilson 95% interval for 0/100: (0.0, 0.037)`,
      walk: [
        { line: "center = (phat+z*z/(2*total))/denom", say: "Wilson pulls the centre slightly towards 0.5, which helps when counts are small." },
        { line: "half = z*math.sqrt(phat*(1-phat)/total+z*z/(4*total**2))/denom", say: "The half-width stays positive even when there are 0 events." },
      ],
    },
    "1.4.3 Hypothesis tests and error tradeoffs#0": {
      goal: "Exact randomization test: list every possible assignment",
      code: r`from itertools import combinations


def exact_route_randomization_pvalue(route_means, observed_b):
    n = len(route_means)
    k = len(observed_b)
    if n < 2 or not 0 < k < n or len(set(observed_b)) != k:
        raise ValueError("Need distinct assigned routes and both policy groups")
    def statistic(group):
        chosen = set(group)
        b = sum(route_means[i] for i in chosen)/k
        a = sum(route_means[i] for i in range(n) if i not in chosen)/(n-k)
        return b-a
    observed = abs(statistic(observed_b))
    possible = [statistic(group) for group in combinations(range(n), k)]
    extreme = sum(abs(value)+1e-12 >= observed for value in possible)
    return extreme/len(possible), sorted(possible)


pvalue, reference = exact_route_randomization_pvalue([10, 12, 14, 16], (2, 3))
assert reference == [-4, -2, 0, 0, 2, 4]
assert pvalue == 1/3
print("all possible differences:", reference)
print("p-value:", round(pvalue, 4))

# Output:
# all possible differences: [-4.0, -2.0, 0.0, 0.0, 2.0, 4.0]
# p-value: 0.3333`,
      walk: [
        { line: "possible = [statistic(group) for group in combinations(range(n), k)]", say: "Every way of choosing 2 of the 4 routes for policy B (6 ways), and the difference each would give." },
        { line: "extreme = sum(abs(value)+1e-12 >= observed for value in possible)", say: "Count assignments at least as extreme as the real one (the tiny 1e-12 guards against rounding)." },
      ],
    },
    "1.5.5 Compute a small interval and check assumptions#0": {
      goal: "A t interval for a mean with SciPy",
      code: r`import numpy as np
from scipy.stats import t

demand=np.array([8.,10.,10.,12.,15.])
n=len(demand)
mean=demand.mean()
sample_var=demand.var(ddof=1)
critical=t.ppf(.975,df=n-1)
halfwidth=critical*np.sqrt(sample_var/n)
lower,upper=mean-halfwidth,mean+halfwidth
assert np.isclose(mean,11.)
assert np.isclose(sample_var,7.)
assert np.isclose(critical,2.776445105,rtol=1e-8)
assert np.isclose(halfwidth,3.285,atol=.002)
assert lower<11<upper
print("mean:", mean, "| sample variance:", sample_var, "| t*:", round(critical, 3))
print("95% interval:", round(lower, 2), "to", round(upper, 2))

# Output:
# mean: 11.0 | sample variance: 7.0 | t*: 2.776
# 95% interval: 7.71 to 14.29`,
      walk: [
        { line: "sample_var=demand.var(ddof=1)", say: "Sample variance with $n - 1$: 7." },
        { line: "critical=t.ppf(.975,df=n-1)", say: "The 97.5th percentile of the t distribution with 4 degrees of freedom: 2.776." },
        { line: "halfwidth=critical*np.sqrt(sample_var/n)", say: "Critical value × standard error: 3.285." },
      ],
    },
    "1.5.6 Compare groups with a test whose sampling unit is explicit#0": {
      goal: "One-way ANOVA by hand, plus a permutation check",
      code: r`from random import Random

groups = [[5.,6.,7.,6.],[7.,8.,9.,8.],[9.,10.,11.,10.]]
values = [v for group in groups for v in group]
sizes = [len(group) for group in groups]
def anova_f(rows):
    count = sum(map(len, rows))
    grand = sum(sum(row) for row in rows)/count
    means = [sum(row)/len(row) for row in rows]
    between = sum(len(row)*(mu-grand)**2 for row,mu in zip(rows,means))
    within = sum(sum((v-mu)**2 for v in row) for row,mu in zip(rows,means))
    return between, within, (between/(len(rows)-1))/(within/(count-len(rows)))
between, within, observed = anova_f(groups)
assert (between, within, observed) == (32.,6.,24.)

rng = Random(2026)
at_least = 0
for _ in range(999):
    shuffled = values.copy()
    rng.shuffle(shuffled)
    candidate = [shuffled[:4], shuffled[4:8], shuffled[8:12]]
    at_least += anova_f(candidate)[2] >= observed
p_mc = (1+at_least)/1000
assert 0 < p_mc <= 1
print("SS_between:", between, "| SS_within:", within, "| F:", observed)
print("permutation p-value:", p_mc)

# Output:
# SS_between: 32.0 | SS_within: 6.0 | F: 24.0
# permutation p-value: 0.001`,
      walk: [
        { line: "between = sum(len(row)*(mu-grand)**2 for row,mu in zip(rows,means))", say: "Between-group sum of squares: how far each group mean is from the grand mean, weighted by group size (32)." },
        { line: "within = sum(sum((v-mu)**2 for v in row) for row,mu in zip(rows,means))", say: "Within-group sum of squares: spread inside each group (6)." },
        { line: "return between, within, (between/(len(rows)-1))/(within/(count-len(rows)))", say: "F = (32/2)/(6/9) = 24: the group means differ far more than the noise inside groups." },
        { line: "rng.shuffle(shuffled)", say: "Permutation check: shuffle the labels and recompute F 999 times." },
        { line: "p_mc = (1+at_least)/1000", say: "Share of shuffles at least as extreme, counting the real data as one of them." },
      ],
    },
    "In Python#0": {
      goal: "Confidence interval, t-test, A/B test and bootstrap for the delivery data",
      walk: [
        { line: "se = sd / np.sqrt(n)", say: "Standard error of the mean." },
        { line: "t_crit = stats.t.ppf(0.975, df=n - 1)", say: "Critical value for a 95% interval with 7 degrees of freedom." },
        { line: "t_stat, p = stats.ttest_1samp(x, 30)", say: "One-sample t-test against the promised 30 minutes: p = 0.12." },
        { line: "p_pool = conv.sum() / visitors.sum()", say: "A/B test: the conversion rate pooled across both groups, assuming no difference." },
        { line: "boot = [rng.choice(x, n, replace=True).mean() for _ in range(10_000)]", say: "Bootstrap: 10,000 resampled means; their middle 95% is the interval." },
      ],
    },
  },
};
