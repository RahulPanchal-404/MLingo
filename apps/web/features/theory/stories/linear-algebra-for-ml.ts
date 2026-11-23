export const story = String.raw`
## A photo editor that bends space

Open any photo editor on your phone and try the "transform" tool. You can stretch the picture wider, squash it shorter, tilt it, rotate it, or flip it like a mirror. Every pixel moves, but in an orderly way: straight lines stay straight, and the centre stays in place.

Here's the surprising part. Every one of those moves can be described by a small grid of four numbers. Stretching twice as wide is one grid. Rotating by 30° is another. Doing one move after another is just combining their grids. That grid of numbers is a **matrix**, and the idea that a matrix is a *way of moving space* is the key to everything on this page: rank, inverses, eigenvectors and the SVD.

In the Vectors lesson you met a matrix as a table of data. Here we look at the other side of the same coin: a matrix as an action that takes in a vector and gives out a new one.

## A matrix is a machine that moves arrows

Take the 2 × 2 matrix with rows (2, 0) and (0, 1). Feed it the arrow (1, 1). Multiplying gives (2 × 1 + 0 × 1, 0 × 1 + 1 × 1) = (2, 1). The arrow got stretched sideways: its first entry doubled, its second stayed the same. Feed it any arrow and the same happens. This matrix's whole personality is "stretch everything sideways by 2".

A neat trick to read any matrix: look at its **columns**. The first column tells you where the arrow (1, 0) lands, and the second tells you where (0, 1) lands. Everything else follows from those two, because every arrow is a mix of them. So the matrix with columns (2, 0) and (0, 1) sends the sideways arrow to twice its length and leaves the upward arrow alone, exactly as we found.

In machine learning, this happens constantly. When a neural network layer multiplies its input by a weight matrix, it's moving the data into a new space where the next step is easier. When PCA rotates data onto new axes, that's a matrix. When we compute ŷ = Xw, the matrix X takes the weight vector w and turns it into a list of predictions.

## Rank: how many directions survive

Now try a stranger matrix, with columns (1, 2) and (2, 4). Notice the second column is exactly twice the first. Where does it send arrows?

Feed it (1, 0) and you get (1, 2). Feed it (0, 1) and you get (2, 4), which points in the same direction. In fact, every arrow you feed in lands somewhere on one single line through the centre. The whole flat plane has been squashed onto a line. One direction of information has been completely lost.

The **rank** of a matrix is the number of independent directions that survive. Our first matrix kept both directions, so its rank is 2. This one squashed everything onto a line, so its rank is 1.

Why care? In machine learning, the columns of your data matrix X are your features. If one feature is an exact copy or combination of others, like a flat's area in square feet and the same area in square metres, the columns aren't independent. The data matrix has lower rank than it looks, and the model can't tell how to split the credit between those duplicate features. The weights become unstable or impossible to compute. This is the problem called **multicollinearity**, and rank is its mathematical name.

## The inverse: undoing a move

If a matrix stretches everything sideways by 2, the move can be undone: just squash sideways by half. That undoing matrix is called the **inverse**.

But what about the matrix that squashed the plane onto a line? Many different arrows landed on the same point, and once they're squashed together there's no way to tell them apart again. That move **cannot** be undone. A matrix with no inverse is called **singular**.

There's a single number that tells you whether a 2 × 2 or larger square matrix can be undone: the **determinant**. Geometrically, it's how much the matrix scales areas. Our stretching matrix doubles every area, so its determinant is 2. The squashing matrix flattens every area to zero, so its determinant is 0, and that's the sign: **determinant zero means no inverse**.

This matters directly for linear regression. The exact formula for the best weights needs the inverse of XᵀX. If your features are duplicates, XᵀX is singular and the formula breaks. Ridge regression's trick of adding λ to the diagonal makes the matrix invertible again, which is one more reason it's so useful.

## Eigenvectors: directions that only stretch

When a matrix moves space, most arrows change direction. But for many matrices, a few special directions don't turn at all. Arrows along them just get longer or shorter.

Picture stretching a rubber sheet horizontally. An arrow pointing diagonally gets tilted towards the horizontal. But an arrow pointing exactly horizontally stays horizontal; it just gets longer. And an arrow pointing exactly vertically stays vertical. Those unturned directions are the matrix's **eigenvectors**, and the amount each one stretches by is its **eigenvalue**.

Eigenvectors reveal the natural axes of a transformation. That's exactly what PCA uses: the eigenvectors of the data's covariance matrix are the directions along which the data is most spread out, and their eigenvalues say how much spread each direction holds. The first principal component is simply the eigenvector with the biggest eigenvalue. Google's original PageRank was also an eigenvector: the "importance" scores of web pages that stay unchanged when you follow links.

## The SVD: eigenvectors for any matrix

Eigenvectors only make sense for square matrices, and not every square matrix has a full set of them. Real data matrices are rarely square: a dataset might have 10,000 rows and 50 columns.

The **singular value decomposition (SVD)** solves this. It says that **any** matrix, of any shape, can be broken into three simple moves in a row:

- a rotation,
- a stretch along the axes, by amounts called the **singular values**,
- another rotation.

It's like discovering that every complicated dance is really just "turn, stretch, turn". The singular values, sorted from largest to smallest, tell you how important each direction is. Keep only the biggest few and you get the best possible simpler version of the matrix.

That single fact powers a lot of machine learning:

- **PCA** is usually computed with the SVD of the centred data.
- **Compression**: an image stored as a matrix can be rebuilt surprisingly well from its top few singular values.
- **Recommendation systems** find hidden "taste" directions in the giant user-by-movie ratings table using the same idea.
- **Rank**, again: the number of non-zero singular values is exactly the rank of the matrix.

## What to remember

A matrix is a machine that moves arrows: read its columns to see where the basic directions land. Rank counts how many independent directions survive; duplicate features lower it and make weights unstable. An inverse undoes a move, and it exists only when the determinant isn't zero. Eigenvectors are the directions a matrix only stretches, and they're the axes PCA finds. The SVD breaks any matrix into rotate, stretch, rotate, and it's behind PCA, compression and recommendations.
`;
