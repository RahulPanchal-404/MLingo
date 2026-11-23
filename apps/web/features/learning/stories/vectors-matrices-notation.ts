export const story = String.raw`
## A shopkeeper with a notebook

Meet Ravi. He runs a small electronics shop, and every evening he writes down what happened that day in a notebook. For every customer who walked in, he notes three things: how many minutes they spent in the shop, how many products they picked up to look at, and how much money they finally spent.

One page of his notebook looks like this:

| Customer | Minutes in shop | Products picked up | Money spent (₹) |
| --- | --- | --- | --- |
| Anita | 12 | 3 | 1,500 |
| Bilal | 4 | 1 | 0 |
| Chitra | 25 | 6 | 7,200 |

Without knowing it, Ravi has already done the most important thing in machine learning. He has turned real people, with all their moods and stories, into **lists of numbers**. Anita is no longer just "the lady who liked the headphones". To his notebook, she is the list 12, 3, 1,500.

Computers cannot understand a person, a house, a photo or a song directly. They can only work with numbers. So the very first step in every machine learning project is exactly what Ravi did: describe each thing you care about as an ordered list of numbers. That ordered list has a name, and it is the first word of this lesson.

## So what is a vector?

A **vector** is simply an ordered list of numbers. That's it. Nothing more mysterious than that.

Anita's row, (12, 3, 1500), is a vector. The word "ordered" is important. The first number always means minutes, the second always means products, the third always means money. If you shuffled them to (3, 1500, 12), the numbers would be the same but the meaning would be destroyed. A vector is like a form with fixed boxes: box 1 is always age, box 2 is always height, and so on.

Each number inside a vector is called an **entry** or a **component**. How many entries a vector has is called its **dimension**. Anita's vector has 3 entries, so it is a 3-dimensional vector.

You meet vectors everywhere, even if nobody calls them that:

- A cricket player's season can be written as (matches, runs, wickets, catches), for example (14, 512, 3, 9). That's a 4-dimensional vector.
- A colour on your phone screen is stored as (red, green, blue), for example (255, 140, 0) for orange. That's a 3-dimensional vector.
- A location on Google Maps is (latitude, longitude), for example (12.31, 76.65) for Mysuru. That's a 2-dimensional vector.
- A tiny 28 × 28 black-and-white photo of a handwritten digit has 784 pixels. List every pixel's brightness one after another and the photo becomes a single vector with 784 entries.

The last example is worth pausing on. A vector can have 784 entries, or a million. We can't draw a million-dimensional picture, but the computer doesn't care. To it, a long list is just as easy to handle as a short one.

## Why people draw vectors as arrows

With only two entries, like a map location (3, 2), you can draw a vector on graph paper. Start at the corner (0, 0), walk 3 steps right and 2 steps up, and put a dot. Often people draw an **arrow** from the corner to that dot.

The arrow picture gives us two useful ideas:

- **Direction**: which way the arrow points. The vectors (3, 2) and (6, 4) point in exactly the same direction; the second is just twice as long.
- **Length**: how far the tip is from the corner. By Pythagoras, the length of (3, 2) is √(3² + 2²) = √13 ≈ 3.6.

In machine learning we use both ideas constantly. Two customers whose vectors point in similar directions behave similarly. Two houses whose vectors are close together are similar houses. Length and distance are how a computer measures "similar".

## Distance: how a computer decides two things are alike

Imagine Ravi wants to know which customer behaves most like Anita. Look at Bilal (4, 1, 0) and Chitra (25, 6, 7200).

To measure the gap between two vectors, subtract them entry by entry, square each difference, add the squares and take the square root. This is the ordinary straight-line distance you learned in school, just with more entries. It is called the **Euclidean distance**.

For Anita and Bilal, using only the first two entries to keep the arithmetic small: the differences are 12 − 4 = 8 and 3 − 1 = 2, so the distance is √(8² + 2²) = √68 ≈ 8.2.

This one calculation powers whole families of methods. K-nearest neighbours classifies a new point by finding the training points at the smallest distance. K-Means groups customers by distance to a centre. Recommendation systems suggest the movies whose vectors are closest to the ones you liked.

> A warning that will save you hours later: if one entry is measured in thousands (money spent) and another in single digits (products picked up), the big one dominates every distance. Two customers who spent ₹1,500 and ₹1,600 look "far apart" even if everything else about them is identical. This is why we rescale features before using distances, which you'll meet as *feature scaling*.

## The dot product: the most important calculation in this course

Now suppose Ravi wants a rough rule to *guess* how much a new customer will spend. He has a hunch: every minute in the shop is worth about ₹100 of spending, and every product picked up is worth about ₹800.

For a new customer who stays 10 minutes and picks up 2 products, his guess would be:

10 × 100 + 2 × 800 = 1,000 + 1,600 = ₹2,600.

Look at what he did. He took two vectors, the customer (10, 2) and his "importance" numbers (100, 800), multiplied the matching entries, and added the results. That operation is called the **dot product**, written with a dot:

x · w = x₁w₁ + x₂w₂ + … + x_d w_d

Here x is the customer and w is the list of importances. In machine learning, w is called the **weight vector**, because each entry says how much weight that feature gets in the final answer. A big weight means "this feature matters a lot". A weight of zero means "ignore this feature". A negative weight means "more of this feature pulls the answer down".

Almost every model you'll learn starts with a dot product. Linear regression is a dot product plus a constant. Logistic regression is a dot product squeezed into a probability. A neural network is thousands of dot products stacked in layers. When people say a model has "learned", they mean it has found good numbers for w.

## From one customer to the whole notebook: matrices

Ravi doesn't have one customer, he has hundreds. Writing a separate vector for each one is fine, but there's a neater way: stack all the customer vectors on top of each other, one per row. The result is a rectangle of numbers, and a rectangle of numbers is called a **matrix**.

Ravi's notebook page, keeping just the two inputs, is the matrix:

| | minutes | products |
| --- | --- | --- |
| Anita | 12 | 3 |
| Bilal | 4 | 1 |
| Chitra | 25 | 6 |

In machine learning this matrix is almost always called **X** (a capital letter, because it's a whole table). The convention everyone follows is:

- Each **row** is one example: one customer, one house, one photo.
- Each **column** is one feature: one thing we measured about every example.

We describe the size of a matrix by its **shape**: number of rows × number of columns. This X has 3 rows and 2 columns, so its shape is 3 × 2. In general we say the data has shape **n × d**: n examples, d features.

The money each customer actually spent is a separate list, one number per customer: (1500, 0, 7200). This is the thing we want to predict, so it's called the **target** and written **y**.

## Predicting everyone at once

Here is where matrices earn their keep. Ravi's rule, "minutes × 100 + products × 800", has to be applied to every row. Instead of doing it customer by customer, we can write the whole thing in one line:

ŷ = X w

Read it as: "multiply the data matrix by the weight vector". It means: take each row of X, compute its dot product with w, and write the answers in a column. The little hat on ŷ ("y-hat") means *predicted* y, to keep it separate from the real y.

For Ravi's notebook:

- Anita: 12 × 100 + 3 × 800 = 3,600
- Bilal: 4 × 100 + 1 × 800 = 1,200
- Chitra: 25 × 100 + 6 × 800 = 7,300

So ŷ = (3600, 1200, 7300) while the real spending was y = (1500, 0, 7200). His rule is decent for Chitra and too generous for Anita and Bilal. Comparing ŷ with y, and adjusting w to close the gap, is exactly what *training* means. You'll do that properly in the Foundations chapter.

## The shape rule that catches most bugs

Matrix multiplication only works when the shapes line up. Multiplying a matrix of shape (n × d) by a vector of length d gives a result of length n. The inner numbers (the two d's) must match, and they disappear; the outer number survives.

- X is 3 × 2 and w has 2 entries: the 2's match, so X w has 3 entries, one prediction per customer.
- If you accidentally gave w three entries, the shapes wouldn't match and NumPy would stop with an error.

This sounds dry, but it's the most practical idea in the lesson. When real code breaks, the error message is very often a shape mismatch. If you can read shapes, you can find the bug.

## Writing it down: the notation you'll see everywhere

Machine learning books and papers use the same shorthand again and again. Now that you know the ideas, the symbols are just labels:

| Symbol | Read it as | What it means |
| --- | --- | --- |
| x | "x" | one example, as a vector of features |
| xⱼ | "x sub j" | the j-th feature of that example |
| X | "capital X" | the whole dataset, one row per example |
| n, d | "n", "d" | number of examples, number of features |
| w | "w" | the weight vector, one weight per feature |
| b | "b" | the bias: a constant added to every prediction |
| y, ŷ | "y", "y-hat" | the real answer and the model's prediction |
| x · w | "x dot w" | multiply matching entries and add them up |
| ‖x‖ | "norm of x" | the length of the vector |

When you see a formula like ŷ = Xw + b, you can now read it as a sentence: "for every example, take a weighted sum of its features and add a constant".

## What to remember

A vector is an ordered list of numbers that describes one thing. A matrix is a stack of those lists, one row per example. Distance between vectors measures how alike two things are. The dot product combines features with weights into a single number, and doing it for every row at once is a matrix–vector product. That one operation, ŷ = Xw, is the beating heart of the models in the rest of this course.
`;
