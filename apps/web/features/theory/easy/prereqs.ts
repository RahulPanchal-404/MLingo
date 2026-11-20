import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Vectors, Matrices & Notation. Every number below was checked in Python. */
export const VECTORS: EasyTopic = {
  sections: {
    "Why you need this": {
      plain: "A dataset is a table. Linear algebra is a short way of writing \"do the same calculation on every row\". Instead of a loop over 10,000 rows you write one symbol, $\\mathbf{X}\\mathbf{w}$.",
      examples: [
        {
          title: "Predict marks for three students at once",
          blocks: [
            { p: "Each student has two features: hours studied and hours slept. Our (made-up) model says marks = 5 × study + 3 × sleep." },
            { table: { head: ["Student", "Study", "Sleep", "5 × study + 3 × sleep"], rows: [["A", "2", "7", "10 + 21 = **31**"], ["B", "4", "6", "20 + 18 = **38**"], ["C", "6", "8", "30 + 24 = **54**"]] } },
            { p: "Written with matrices, all three rows are one calculation:" },
            { math: r`\mathbf{X}\mathbf{w} = \begin{bmatrix} 2 & 7 \\ 4 & 6 \\ 6 & 8 \end{bmatrix}\begin{bmatrix} 5 \\ 3 \end{bmatrix} = \begin{bmatrix} 31 \\ 38 \\ 54 \end{bmatrix}` },
          ],
        },
      ],
    },
    "Explained in depth": {
      plain: "We go through the vocabulary one piece at a time: shapes, notation, the operations table, the dot product, the determinant and inverse, rank, and eigenvectors. Each piece has a small example right under it.",
      examples: [
        {
          at: 0,
          title: "Reading a matrix",
          blocks: [
            { p: "Use the student table above: $\\mathbf{X} = \\begin{bmatrix} 2 & 7 \\\\ 4 & 6 \\\\ 6 & 8 \\end{bmatrix}$." },
            { list: ["Shape: 3 rows (students) × 2 columns (features), so $n = 3$, $d = 2$.", "Row 2 is one student: $\\mathbf{x}_2 = (4, 6)$.", "Column 1 is one feature for everyone: study hours $(2, 4, 6)$.", "$\\mathbf{w}$ has length $d = 2$, so $\\mathbf{X}\\mathbf{w}$ has length $n = 3$: one prediction per student."] },
          ],
        },
        {
          at: 1,
          title: "Notation in practice",
          blocks: [
            { list: ["$x_{21}$ = row 2, column 1 = **4**.", "$x_{12}$ = row 1, column 2 = **7**.", "$\\mathbf{w}^\\top\\mathbf{x}_2 = 5 \\cdot 4 + 3 \\cdot 6 = 38$, a single number (a scalar)."] },
          ],
        },
        {
          at: 2,
          title: "Transpose and element-wise product",
          blocks: [
            { p: "Transpose flips rows and columns, so a 3 × 2 matrix becomes 2 × 3:" },
            { math: r`\begin{bmatrix} 2 & 7 \\ 4 & 6 \\ 6 & 8 \end{bmatrix}^\top = \begin{bmatrix} 2 & 4 & 6 \\ 7 & 6 & 8 \end{bmatrix}` },
            { p: "Element-wise multiplies matching entries and keeps the shape: $(1, 2, 3) \\odot (4, 5, 6) = (4, 10, 18)$. A dot product would add these up instead: $4 + 10 + 18 = 32$." },
          ],
        },
        {
          at: 3,
          title: "Cosine similarity of two movie fans",
          blocks: [
            { p: "Ratings for three movies: Asha $\\mathbf{a} = (5, 4, 0)$, Ben $\\mathbf{b} = (4, 5, 1)$." },
            {
              steps: [
                { title: "Dot product", body: "Multiply matching ratings and add.", math: r`\mathbf{a}^\top\mathbf{b} = 5\cdot4 + 4\cdot5 + 0\cdot1 = 40` },
                { title: "Lengths", body: "", math: r`\lVert\mathbf{a}\rVert = \sqrt{25+16+0} = 6.403, \qquad \lVert\mathbf{b}\rVert = \sqrt{16+25+1} = 6.481` },
                { title: "Cosine", body: "Close to 1, so their tastes point the same way. Perpendicular vectors such as (1, 0) and (0, 1) would give 0.", math: r`\cos\theta = \frac{40}{6.403 \times 6.481} = 0.964` },
              ],
            },
          ],
        },
        {
          at: 5,
          title: "What a determinant actually measures",
          blocks: [
            { p: "Take $\\mathbf{A} = \\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$. Its columns are where the two basic arrows land: $(1, 0) \\to (3, 0)$ and $(0, 1) \\to (1, 2)$. So the unit square (area 1) is turned into a slanted box." },
            { figure: { src: "/theory/figures/easy_determinant.svg", alt: "Left: the unit square becomes a parallelogram with corners (0,0), (3,0), (4,2), (1,2), area 6. Right: a matrix whose columns lie on one line flattens the square into a line segment.", caption: "Left: $\\det A = 6$, so every area gets 6 times bigger. Right: both columns of B lie on one line, the square is flattened, area 0, and there is no way back." } },
            {
              steps: [
                { title: "Determinant", body: "ad − bc. The slanted box has base 3 and height 2, area 6: the same number.", math: r`\det\mathbf{A} = 3 \cdot 2 - 1 \cdot 0 = 6` },
                { title: "Inverse", body: "Swap the diagonal, flip the signs of the other two, divide by the determinant.", math: r`\mathbf{A}^{-1} = \frac{1}{6}\begin{bmatrix} 2 & -1 \\ 0 & 3 \end{bmatrix} = \begin{bmatrix} 0.333 & -0.167 \\ 0 & 0.5 \end{bmatrix}` },
                { title: "Check", body: "Row 1 of A times column 1 of the inverse: 3 × 0.333 + 1 × 0 = 1. Row 1 times column 2: 3 × (−0.167) + 1 × 0.5 = 0. The product is the identity, so the inverse is right." },
                { title: "A matrix with no inverse", body: "For B = [[2, 4], [1, 2]], det = 2·2 − 4·1 = 0. Column 2 is twice column 1, so both land on the same line. Many different inputs land on the same output, so you cannot tell which one you started from: no inverse." },
              ],
            },
          ],
        },
        {
          at: 6,
          title: "Rank drops when a feature is repeated",
          blocks: [
            { p: "Height in centimetres and height in metres for three people:" },
            { math: r`\mathbf{X} = \begin{bmatrix} 170 & 1.70 \\ 160 & 1.60 \\ 180 & 1.80 \end{bmatrix}` },
            { p: "Column 1 is exactly 100 × column 2, so there is only **one** independent column: rank 1, not 2. NumPy confirms $\\det(\\mathbf{X}^\\top\\mathbf{X}) = 0$, so the normal equation cannot be solved. The fix is to drop one of the two columns." },
          ],
        },
        {
          at: 7,
          title: "Find the eigenvectors of the same matrix",
          blocks: [
            { p: "Again $\\mathbf{A} = \\begin{bmatrix} 3 & 1 \\\\ 0 & 2 \\end{bmatrix}$." },
            {
              steps: [
                { title: "Try (1, 0)", body: "It comes out as 3 × itself: same direction, stretched 3 times. Eigenvector, λ = 3.", math: r`\mathbf{A}\begin{bmatrix}1\\0\end{bmatrix} = \begin{bmatrix}3\\0\end{bmatrix} = 3\begin{bmatrix}1\\0\end{bmatrix}` },
                { title: "Try (1, −1)", body: "Same direction, stretched 2 times. Eigenvector, λ = 2.", math: r`\mathbf{A}\begin{bmatrix}1\\-1\end{bmatrix} = \begin{bmatrix}2\\-2\end{bmatrix} = 2\begin{bmatrix}1\\-1\end{bmatrix}` },
                { title: "Try (0, 1)", body: "(1, 2) is not a multiple of (0, 1): the arrow turned. Not an eigenvector.", math: r`\mathbf{A}\begin{bmatrix}0\\1\end{bmatrix} = \begin{bmatrix}1\\2\end{bmatrix}` },
              ],
            },
            { p: "Notice the eigenvalues 3 and 2 multiply to 6, the determinant. That is always true: the determinant is the product of the eigenvalues." },
          ],
        },
      ],
    },
    "Scalars, vectors and matrices": {
      examples: [
        {
          kind: "idea",
          title: "One house, then three houses",
          blocks: [
            { list: ["Scalar: the price of one house, $y = 72$ (lakh).", "Vector: one house's features (size in 100 m², rooms, age in years): $\\mathbf{x} = (1.2, 3, 15)$, so $d = 3$.", "Matrix: three houses stacked as rows give a 3 × 3 matrix $\\mathbf{X}$; $x_{23}$ is the age of house 2."] },
          ],
        },
      ],
    },
    "The dot product": {
      examples: [
        {
          title: "A linear model is one dot product",
          blocks: [
            { p: "Weights $\\mathbf{w} = (3, 1, -0.5)$ for (size, rooms, age) and a house $\\mathbf{x} = (1.2, 3, 10)$:" },
            { math: r`\mathbf{w}^\top\mathbf{x} = 3(1.2) + 1(3) + (-0.5)(10) = 3.6 + 3 - 5 = 1.6` },
            { p: "The negative weight on age pulls the score down by 5. Each term tells you how much one feature contributed." },
          ],
        },
      ],
    },
    "Matrix multiplication and shapes": {
      examples: [
        {
          title: "Multiply a 2 × 3 by a 3 × 2",
          blocks: [
            { p: "Inner sizes match (3 and 3), so the answer is 2 × 2. Each entry is a row of the first matrix dotted with a column of the second." },
            { math: r`\begin{bmatrix} 1 & 2 & 0 \\ 0 & 1 & 3 \end{bmatrix}\begin{bmatrix} 1 & 0 \\ 2 & 1 \\ 0 & 4 \end{bmatrix} = \begin{bmatrix} 1+4+0 & 0+2+0 \\ 0+2+0 & 0+1+12 \end{bmatrix} = \begin{bmatrix} 5 & 2 \\ 2 & 13 \end{bmatrix}` },
            { p: "**Shape check that fails:** a 3 × 2 matrix times a 3 × 1 vector. Inner sizes are 2 and 3, so NumPy raises an error. This is the most common bug in model code." },
          ],
        },
        {
          title: "Order matters",
          blocks: [
            { math: r`\begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix}\begin{bmatrix} 1 & 0 \\ 1 & 1 \end{bmatrix} = \begin{bmatrix} 2 & 1 \\ 1 & 1 \end{bmatrix}, \qquad \begin{bmatrix} 1 & 0 \\ 1 & 1 \end{bmatrix}\begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix} = \begin{bmatrix} 1 & 1 \\ 1 & 2 \end{bmatrix}` },
            { p: "Same two matrices, different order, different answers: $\\mathbf{A}\\mathbf{B} \\neq \\mathbf{B}\\mathbf{A}$." },
          ],
        },
      ],
    },
    "Norms: the size of a vector": {
      examples: [
        {
          title: "L2, L1 and distance",
          blocks: [
            { list: ["$\\mathbf{x} = (3, -4)$: L2 norm $\\sqrt{9 + 16} = 5$; L1 norm $3 + 4 = 7$.", "Distance between points $(1, 2)$ and $(4, 6)$: the difference is $(3, 4)$, so the distance is $\\sqrt{9 + 16} = 5$. This is the distance KNN and K-Means use.", "Ridge would add $\\lVert\\mathbf{w}\\rVert_2^2 = 25$ to the loss for $\\mathbf{w} = (3, -4)$; Lasso would add $\\lVert\\mathbf{w}\\rVert_1 = 7$."] },
          ],
        },
      ],
    },
    "1.24.1 Arrays, shape, broadcasting, and missing values": {
      plain: "An array's shape says how many rows and columns it has, not what they mean. `axis=0` means \"go down the rows\" (one answer per column); `axis=1` means \"go across a row\" (one answer per row). NumPy will happily do arithmetic that runs but means the wrong thing, so check shapes and meaning.",
      examples: [
        {
          at: 1,
          title: "A broadcasting mistake that runs without an error",
          blocks: [
            { p: "Two records, two features: $\\mathbf{X} = \\begin{bmatrix} 1 & 10 \\\\ 2 & 20 \\end{bmatrix}$. We want to centre each feature." },
            {
              steps: [
                { title: "Right: subtract column means", body: "X.mean(axis=0) = (1.5, 15). Each column now averages 0.", math: r`\begin{bmatrix} 1-1.5 & 10-15 \\ 2-1.5 & 20-15 \end{bmatrix} = \begin{bmatrix} -0.5 & -5 \\ 0.5 & 5 \end{bmatrix}` },
                { title: "Wrong: subtract row means", body: "X.mean(axis=1) = (5.5, 11) also has length 2, so NumPy subtracts it from each row without complaint. The result is meaningless.", math: r`\begin{bmatrix} 1-5.5 & 10-11 \\ 2-5.5 & 20-11 \end{bmatrix} = \begin{bmatrix} -4.5 & -1 \\ -3.5 & 9 \end{bmatrix}` },
              ],
            },
            { p: "**Missing values:** for $(1, \\text{NaN}, 3)$, `np.mean` gives NaN, `np.nanmean` gives 2 (skips the gap), and replacing NaN with 0 gives 1.33, which invents a measurement that never happened." },
          ],
        },
      ],
    },
    "1.24.2 Linear algebra checks for numerical regression": {
      plain: "Least squares finds the line (or plane) closest to the data. If two columns of the design matrix carry the same information, there are endless equally good answers, so the coefficients stop meaning anything even though the predictions look fine.",
      examples: [
        {
          at: 1,
          title: "Three ways to split the same slope",
          blocks: [
            { p: "Fit $y = (1, 3, 5)$ on $x = (0, 1, 2)$, but put $x$ in the design twice: columns (1, $x$, $x$)." },
            { table: { head: ["Coefficients (intercept, $x$, copy of $x$)", "Predictions"], rows: [["(1, 2, 0)", "(1, 3, 5)"], ["(1, 1, 1)", "(1, 3, 5)"], ["(1, 0, 2)", "(1, 3, 5)"]] } },
            { p: "All three fit perfectly. Asking \"what is the effect of $x$?\" has no single answer. Drop the copy and the only solution is intercept 1, slope 2." },
          ],
        },
      ],
    },
    "3.1.2 Array shapes and vectorized computation": {
      plain: "Vectorized code works on a whole column at once instead of looping. It is fast, but you still have to choose the axis from what the numbers mean.",
      examples: [
        {
          title: "Answer to the exercise",
          blocks: [
            { list: ["X has shape (64, 12): 64 branches, 12 features.", "Its per-feature mean `X.mean(axis=0)` has shape (12,).", "`X - mean` has shape (64, 12): the mean is subtracted from every row.", "A boolean mask of shape (64,) picks rows. If 20 entries are True, `X[mask]` has shape (20, 12)."] },
          ],
        },
      ],
    },
  },
  code: {
    "1.24.1 Arrays, shape, broadcasting, and missing values#0": {
      goal: "Check shapes, take means along each axis, centre the data, and handle missing values",
      code: r`import numpy as np

# 3 records (rows) x 2 features (columns)
readings = np.array([[1., 10.],
                     [2., 20.],
                     [3., 30.]])
print("shape:", readings.shape)

col_means = readings.mean(axis=0)   # down the rows: one mean per feature
row_means = readings.mean(axis=1)   # across a row: one mean per record (mixes units!)
print("mean per feature (axis=0):", col_means)
print("mean per record  (axis=1):", row_means)

centered = readings - col_means     # broadcasting: (3, 2) - (2,) subtracts from every row
print("centered:")
print(centered)
print("column sums after centering:", centered.sum(axis=0))

# Missing values: NaN is "unknown", not zero
v = np.array([1., np.nan, 3.])
print("mean:", np.mean(v), "| nanmean:", np.nanmean(v), "| NaN treated as 0:", round(np.nan_to_num(v).mean(), 3))

# Output:
# shape: (3, 2)
# mean per feature (axis=0): [ 2. 20.]
# mean per record  (axis=1): [ 5.5 11.  16.5]
# centered:
# [[ -1. -10.]
#  [  0.   0.]
#  [  1.  10.]]
# column sums after centering: [0. 0.]
# mean: nan | nanmean: 2.0 | NaN treated as 0: 1.333`,
      walk: [
        { line: "readings = np.array([[1., 10.],", say: "A 3 × 2 array: each inner list is one record (row), each position is one feature (column)." },
        { line: "col_means = readings.mean(axis=0)", say: "`axis=0` runs down the rows, giving one mean per feature: (2, 20)." },
        { line: "row_means = readings.mean(axis=1)", say: "`axis=1` runs across each row, giving one mean per record. It mixes the two features' units, so it is rarely what you want." },
        { line: "centered = readings - col_means", say: "Broadcasting: a (3, 2) array minus a (2,) vector subtracts the vector from every row." },
        { line: "print(\"column sums after centering:\", centered.sum(axis=0))", say: "After centering, every column adds up to 0. This is a quick check that you used the right axis." },
        { line: "np.nanmean(v)", say: "`nanmean` skips missing values. Plain `mean` returns NaN, and filling with 0 pretends a reading of 0 happened." },
      ],
    },
    "1.24.2 Linear algebra checks for numerical regression#0": {
      goal: "Fit least squares, check the rank, and see what a duplicate column does",
      code: r`import numpy as np

x = np.array([0., 1., 2.])
y = np.array([1., 3., 5.])                      # exactly y = 1 + 2x

design = np.column_stack([np.ones(len(x)), x])  # columns: intercept, x
print("design matrix:")
print(design)

beta, _, rank, sv = np.linalg.lstsq(design, y, rcond=None)
print("beta (intercept, slope):", beta.round(6))
print("rank:", rank, "| singular values:", sv.round(3))
print("residuals:", (y - design @ beta).round(6))

# Add a duplicate x column: rank drops, the slope can be split any way
dup = np.column_stack([design, x])
print("rank with a duplicate column:", np.linalg.matrix_rank(dup))
for split in ([1, 2, 0], [1, 1, 1], [1, 0, 2]):
    print("coefficients", split, "-> predictions", dup @ np.array(split, dtype=float))

# Output:
# design matrix:
# [[1. 0.]
#  [1. 1.]
#  [1. 2.]]
# beta (intercept, slope): [1. 2.]
# rank: 2 | singular values: [2.676 0.915]
# residuals: [0. 0. 0.]
# rank with a duplicate column: 2
# coefficients [1, 2, 0] -> predictions [1. 3. 5.]
# coefficients [1, 1, 1] -> predictions [1. 3. 5.]
# coefficients [1, 0, 2] -> predictions [1. 3. 5.]`,
      walk: [
        { line: "design = np.column_stack([np.ones(len(x)), x])", say: "Build the design matrix: a column of 1s (for the intercept) next to the feature." },
        { line: "beta, _, rank, sv = np.linalg.lstsq(design, y, rcond=None)", say: "Solve least squares without forming an inverse. It also returns the rank and the singular values." },
        { line: "print(\"residuals:\", (y - design @ beta).round(6))", say: "Compute residuals yourself: actual minus predicted. Here they are 0 because the data lie exactly on y = 1 + 2x." },
        { line: "dup = np.column_stack([design, x])", say: "Add the same feature again. There are now 3 columns but only 2 independent ones." },
        { line: "for split in ([1, 2, 0], [1, 1, 1], [1, 0, 2]):", say: "Three different coefficient vectors give identical predictions, so the coefficients are not unique." },
      ],
    },
    "In Python#0": {
      goal: "Matrix basics in NumPy: products, transpose, norms, determinant and inverse",
      code: r`import numpy as np

X = np.array([[1.2, 3.0],    # house 1: size (100 m^2), rooms
              [0.8, 2.0]])   # house 2
w = np.array([3.0, 1.0])     # one weight per feature

print("X shape:", X.shape, "| w shape:", w.shape)
print("predictions X @ w:", X @ w)
print("transpose X.T:")
print(X.T)
print("dot product w . w:", w @ w)
print("L2 norm of w:", round(np.linalg.norm(w), 4))
print("L1 norm of w:", np.abs(w).sum())

A = np.array([[3.0, 1.0],
              [0.0, 2.0]])
print("det(A):", round(np.linalg.det(A), 6))
print("inverse of A:")
print(np.linalg.inv(A).round(4))
print("A @ inv(A):")
print((A @ np.linalg.inv(A)).round(6))

# Output:
# X shape: (2, 2) | w shape: (2,)
# predictions X @ w: [6.6 4.4]
# transpose X.T:
# [[1.2 0.8]
#  [3.  2. ]]
# dot product w . w: 10.0
# L2 norm of w: 3.1623
# L1 norm of w: 4.0
# det(A): 6.0
# inverse of A:
# [[ 0.3333 -0.1667]
#  [ 0.      0.5   ]]
# A @ inv(A):
# [[1. 0.]
#  [0. 1.]]`,
      walk: [
        { line: "X = np.array([[1.2, 3.0],", say: "Two houses (rows) with two features each (columns)." },
        { line: "print(\"predictions X @ w:\", X @ w)", say: "`@` is matrix multiplication: each row of X dotted with w, one prediction per house." },
        { line: "print(X.T)", say: "`.T` transposes: rows become columns." },
        { line: "print(\"L2 norm of w:\", round(np.linalg.norm(w), 4))", say: "Length of w: the square root of 3² + 1² = √10." },
        { line: "print(\"det(A):\", round(np.linalg.det(A), 6))", say: "Determinant 6: A scales every area by 6, so it has an inverse." },
        { line: "print((A @ np.linalg.inv(A)).round(6))", say: "Multiplying A by its inverse gives the identity matrix: the check that the inverse is right." },
      ],
    },
  },
};

/** Easy layer: Linear Algebra for ML. */
export const LINEAR_ALGEBRA: EasyTopic = {
  sections: {
    "The idea": {
      plain: "A matrix is a machine: put a vector in, a new vector comes out. This page asks four questions about the machine. What does it do to space? Does it lose information? Can it be undone? Which directions does it only stretch?",
    },
    "Step 1: a matrix transforms space": {
      examples: [
        {
          title: "Where does (2, −1) go?",
          blocks: [
            { p: "With $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$, multiply directly:" },
            { math: r`A\begin{bmatrix}2\\-1\end{bmatrix} = \begin{bmatrix} 2\cdot2 + 1\cdot(-1) \\ 1\cdot2 + 2\cdot(-1) \end{bmatrix} = \begin{bmatrix}3\\0\end{bmatrix}` },
            { p: "Or use the column picture: $(2, -1)$ means \"2 of the first direction, minus 1 of the second\", so it lands at 2 × column 1 − 1 × column 2 $= 2(2, 1) - (1, 2) = (3, 0)$. Same answer, and this is the idea to remember." },
          ],
        },
      ],
    },
    "Step 2: rank, how many directions survive": {
      examples: [
        {
          title: "Spot the rank",
          blocks: [
            { math: r`\begin{bmatrix} 1 & 3 \\ 2 & 6 \\ 3 & 9 \end{bmatrix}` },
            { p: "Column 2 is 3 × column 1, so only one direction survives: **rank 1**. In a dataset this happens with \"price in rupees\" and \"price in thousands of rupees\". The model cannot tell which column deserves the credit." },
          ],
        },
      ],
    },
    "Step 3: the inverse and the determinant": {
      examples: [
        {
          kind: "idea",
          title: "The determinant is an area",
          blocks: [
            { figure: { src: "/theory/figures/easy_determinant.svg", alt: "Unit square mapped to a parallelogram of area 6 by [[3,1],[0,2]], and flattened to a line by [[2,4],[1,2]].", caption: "The unit square goes in. A matrix with determinant 6 gives a box of area 6; a matrix with determinant 0 flattens it to a line." } },
          ],
        },
        {
          title: "Use the inverse to solve two equations",
          blocks: [
            { p: "Solve $2x + y = 5$ and $x + 2y = 4$. In matrix form that is $A\\mathbf v = (5, 4)$ with our $A$." },
            { math: r`\mathbf v = A^{-1}\begin{bmatrix}5\\4\end{bmatrix} = \frac{1}{3}\begin{bmatrix} 2 & -1 \\ -1 & 2 \end{bmatrix}\begin{bmatrix}5\\4\end{bmatrix} = \frac{1}{3}\begin{bmatrix} 6 \\ 3 \end{bmatrix} = \begin{bmatrix}2\\1\end{bmatrix}` },
            { p: "Check: $2(2) + 1 = 5$ and $2 + 2(1) = 4$. In practice code uses `np.linalg.solve`, which does the same thing more accurately." },
          ],
        },
      ],
    },
    "Step 4: eigenvectors, directions that only stretch": {
      examples: [
        {
          title: "Test a vector",
          blocks: [
            { list: ["$(1, 2)$: $A(1, 2) = (4, 5)$. Not a multiple of $(1, 2)$, so **not** an eigenvector.", "$(2, 2)$: $A(2, 2) = (6, 6) = 3 \\cdot (2, 2)$. **Yes**, λ = 3. Any multiple of an eigenvector is also an eigenvector.", "Eigenvalues 3 and 1 multiply to 3 = det A, and add to 4 = 2 + 2, the diagonal sum. Both checks always hold."] },
          ],
        },
      ],
    },
    "Step 5: the SVD, eigenvectors for any matrix": {
      plain: "Any matrix, of any shape, is three simple moves: turn, stretch, turn. The stretch amounts (singular values) say how much each direction matters.",
      examples: [
        {
          kind: "idea",
          title: "Compressing a photo",
          blocks: [
            { p: "A 100 × 100 grayscale photo is 10,000 numbers. Keep only the top 10 singular values with their vectors: $10 \\times (100 + 100 + 1) = 2{,}010$ numbers, about 20% of the original, and the picture still looks almost the same because the small singular values carry fine detail and noise." },
          ],
        },
      ],
    },
    "Textbook case: Matrix Geometry Behind Model Fitting": {
      plain: "The textbook uses a sensor table to show the same ideas on real-looking data: rows are measurements, columns are sensors, and linear algebra tells us when the fit is stable.",
    },
    "1.7.1 Distinguish scalar, vector, matrix, and tensor axes": {
      plain: "Keep track of what each axis means, not just its size. A weight only means something if the columns stay in the same order, and distances depend on the units each feature uses.",
      examples: [
        {
          title: "Swapped columns, same shape, wrong answer",
          blocks: [
            { p: "Weights $\\mathbf w = (2, 0.5)$ were learned for (rooms, size in m²). A house has 3 rooms and 80 m²." },
            { list: ["Right order $(3, 80)$: score $= 2 \\cdot 3 + 0.5 \\cdot 80 = 46$.", "Columns swapped $(80, 3)$: score $= 2 \\cdot 80 + 0.5 \\cdot 3 = 161.5$. No error, just a wrong prediction."] },
          ],
        },
        {
          title: "Units take over the distance",
          blocks: [
            { p: "Two houses: (1 room, 1000 sq ft) and (2 rooms, 1100 sq ft). Distance $= \\sqrt{1^2 + 100^2} = 100.005$. The room difference adds only 0.005, so a KNN model would ignore rooms entirely until the features are scaled." },
          ],
        },
      ],
    },
    "1.7.2 Least squares and rank": {
      plain: "Least squares picks the weights that make the squared errors smallest. Setting the slope of the error to zero gives the normal equations $X^\\top X w = X^\\top y$. They have one answer only when no column is a copy of the others.",
      examples: [
        {
          title: "Solve the normal equations by hand",
          blocks: [
            { p: "Data: $x = (0, 1, 2)$, $y = (1, 3, 4)$. Design columns: (1, $x$)." },
            {
              steps: [
                { title: "Build both sides", body: "Sum of 1s, sum of x and sum of x² on the left; sum of y and sum of xy on the right.", math: r`X^\top X = \begin{bmatrix} 3 & 3 \\ 3 & 5 \end{bmatrix}, \qquad X^\top y = \begin{bmatrix} 8 \\ 11 \end{bmatrix}` },
                { title: "Invert the 2 × 2", body: "Determinant 3·5 − 3·3 = 6.", math: r`w = \frac{1}{6}\begin{bmatrix} 5 & -3 \\ -3 & 3 \end{bmatrix}\begin{bmatrix} 8 \\ 11 \end{bmatrix} = \frac{1}{6}\begin{bmatrix} 7 \\ 9 \end{bmatrix} = \begin{bmatrix} 1.167 \\ 1.5 \end{bmatrix}` },
                { title: "Residuals", body: "Predictions 1.167, 2.667, 4.167. Residuals −0.167, 0.333, −0.167. They add to 0 (because of the intercept column) and 0·(−0.167) + 1·0.333 + 2·(−0.167) = 0: the residuals are orthogonal to x, exactly as the text says." },
              ],
            },
          ],
        },
      ],
    },
    "1.7.3 Singular values expose directions of weak evidence": {
      plain: "A tiny singular value means the data hardly tell two coefficients apart, so small noise can swing them a lot. PCA keeps the directions with the most spread, but spread is not the same as usefulness for predicting a label.",
      examples: [
        {
          kind: "idea",
          title: "Low variance, high importance",
          blocks: [
            { p: "A machine has a temperature sensor that swings by 20 °C with the weather, and a vibration sensor that barely moves, except for tiny spikes a day before each failure. PCA ranks temperature first because it varies more, yet for predicting failure the small vibration signal is the one that matters. Choose how many components to keep by checking the model's score, not just the explained variance." },
          ],
        },
      ],
    },
    "1.7.4 Hand calculation on a small matrix": {
      plain: "This section is already a worked example: four points, the covariance, the singular values and what is lost when you keep only one component. Follow it with a pencil, then open the code step in the next section to see the same numbers.",
    },
    "1.7.5 Verify rank, projection, and reconstruction": {
      plain: "The code repeats the hand calculation in NumPy so every number above can be checked.",
    },
  },
  code: {
    "1.7.5 Verify rank, projection, and reconstruction#0": {
      goal: "Check the hand calculation: covariance, eigenvalues, SVD, reconstruction, residuals",
      code: r`import numpy as np

# Four centered rows: big spread along x, small spread along y
X = np.array([[2., 0.], [-2., 0.], [0., 1.], [0., -1.]])
print("column means:", X.mean(axis=0))

cov = X.T @ X / (len(X) - 1)                  # sample covariance
eigenvalues = np.linalg.eigvalsh(cov)[::-1]   # largest first
print("covariance:")
print(cov.round(4))
print("eigenvalues:", eigenvalues.round(4))
print("share of variance on component 1:", round(eigenvalues[0] / eigenvalues.sum(), 3))

U, s, Vt = np.linalg.svd(X, full_matrices=False)
print("singular values:", s.round(4), "| squared:", (s ** 2).round(4))

rank_one = (U[:, :1] * s[:1]) @ Vt[:1, :]     # keep only the top component
print("rank-1 reconstruction:")
print(rank_one.round(4) + 0.0)
print("squared reconstruction error:", round(np.sum((X - rank_one) ** 2), 4))

# Least squares with an intercept: residuals are orthogonal to every column
y = np.array([0., 0., 1., 0.])
design = np.c_[np.ones(len(X)), X]
weights = np.linalg.lstsq(design, y, rcond=None)[0]
residual = y - design @ weights
print("weights:", weights.round(4) + 0.0)
print("design.T @ residual:", (design.T @ residual).round(10) + 0.0)

# Output:
# column means: [0. 0.]
# covariance:
# [[2.6667 0.    ]
#  [0.     0.6667]]
# eigenvalues: [2.6667 0.6667]
# share of variance on component 1: 0.8
# singular values: [2.8284 1.4142] | squared: [8. 2.]
# rank-1 reconstruction:
# [[ 2.  0.]
#  [-2.  0.]
#  [ 0.  0.]
#  [ 0.  0.]]
# squared reconstruction error: 2.0
# weights: [0.25 0.   0.5 ]
# design.T @ residual: [0. 0. 0.]`,
      walk: [
        { line: "cov = X.T @ X / (len(X) - 1)", say: "Sample covariance. The data are already centred (means are 0), so $X^\\top X/(n-1)$ is enough." },
        { line: "eigenvalues = np.linalg.eigvalsh(cov)[::-1]", say: "`eigvalsh` is for symmetric matrices like a covariance; `[::-1]` puts the largest first." },
        { line: "print(\"share of variance on component 1:\", round(eigenvalues[0] / eigenvalues.sum(), 3))", say: "First eigenvalue over the total: 0.8, so component 1 holds 80% of the spread." },
        { line: "U, s, Vt = np.linalg.svd(X, full_matrices=False)", say: "The SVD of the data. The squared singular values (8 and 2) are 3 times the eigenvalues, because 3 = n − 1." },
        { line: "rank_one = (U[:, :1] * s[:1]) @ Vt[:1, :]", say: "Rebuild X from the top component only." },
        { line: "print(\"squared reconstruction error:\", round(np.sum((X - rank_one) ** 2), 4))", say: "What was thrown away: 2, which equals the dropped squared singular value." },
        { line: "residual = y - design @ weights", say: "Least-squares residuals." },
        { line: "print(\"design.T @ residual:\", (design.T @ residual).round(10) + 0.0)", say: "All zeros: the residuals are perpendicular to every design column. That is what \"least squares\" means geometrically." },
      ],
    },
    "In Python#0": {
      goal: "Transformations, determinant, inverse, eigenvectors and SVD in NumPy",
      walk: [
        { line: "print(\"A @ [1, 1] =\", A @ np.array([1.0, 1.0]), \" <- same direction, stretched x3\")", say: "Multiply A by (1, 1): out comes (3, 3), the same direction stretched 3 times, so (1, 1) is an eigenvector." },
        { line: "print(\"det:\", round(np.linalg.det(A), 6), \" rank:\", np.linalg.matrix_rank(A))", say: "Determinant 3 (not 0) and rank 2: A loses no direction, so it can be inverted." },
        { line: "vals, vecs = np.linalg.eigh(A)", say: "Eigenvalues and eigenvectors. Use `eigh` for symmetric matrices: real results, perpendicular vectors." },
        { line: "X = np.array([[1.0, 2.0], [2.0, 4.1], [3.0, 6.0]])", say: "A 3 × 2 data matrix whose second column is almost twice the first." },
        { line: "U, s, Vt = np.linalg.svd(X, full_matrices=False)", say: "SVD works for this non-square matrix. `s` holds the singular values, largest first." },
        { line: "print(\"condition number:\", round(s[0] / s[1], 1), \" <- huge: the columns are nearly dependent\")", say: "Largest over smallest singular value. About 224 here, so small changes in the data can swing a regression fit a lot." },
      ],
    },
  },
};
