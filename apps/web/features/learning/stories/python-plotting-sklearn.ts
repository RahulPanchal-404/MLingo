export const story = String.raw`
## The doctor who looks before treating

A good doctor doesn't prescribe medicine the moment you walk in. First they look: your temperature, your blood pressure, an X-ray if needed. Only once they understand what's going on do they decide on a treatment. Skipping the looking step is how mistakes happen.

Building a model is the same. Before you train anything, you **look at your data**, and the fastest way to look is to draw it. Then, once you understand it, you use a toolbox to build, test and compare models. In Python, the drawing is done with **matplotlib**, and the toolbox is **scikit-learn**. This lesson is about using both the way professionals do.

## Why plots catch what numbers hide

There's a famous set of four small datasets called Anscombe's quartet. All four have the same average, the same spread and the same correlation. Judging only by those summary numbers, they're identical. But plot them and they look completely different: one is a neat line, one is a curve, one is a line with a single wild outlier, and one is a vertical stack with one far-away point.

The lesson is simple: **summary numbers can lie by leaving things out, and a picture shows you the shape**. A few minutes of plotting can save you days of confusion later.

## Plot 1: the histogram, for one column at a time

A **histogram** shows how the values of one feature are spread out. It chops the range into bins and draws a bar for how many values fall in each bin.

From a histogram you can see at a glance:

- the **range**: from what to what? If one feature goes up to 2,000 and another only up to 5, scaling will matter for any model that measures distances.
- the **shape**: balanced like a bell, or with a long tail to one side? Incomes and prices usually have long tails, and taking a logarithm often helps.
- **oddities**: a spike at exactly zero might mean "missing" was stored as 0. A value far away from the rest might be a typo.

## Plot 2: the scatter plot, for two columns together

A **scatter plot** puts one feature on the horizontal axis and another on the vertical axis, with one dot per example. Colour the dots by their label and it becomes a quick check of how hard the problem is.

If the colours form clearly separate groups, even a simple model will do well. If they're completely mixed, no model will separate them using just those two features. If the boundary between the colours is curved, a straight-line model will struggle and you should consider something more flexible.

You draw these with a figure and an axes: the figure is the whole canvas, and the axes is the box you draw in. Always label your axes. A plot without labels is a puzzle, not an explanation.

## scikit-learn: one toolbox, one way of working

Once you understand the data, you'll want to try models. There are dozens: linear regression, logistic regression, decision trees, random forests, k-nearest neighbours, support vector machines and more. If every one of them had a different way of being used, learning them would be exhausting.

scikit-learn solves this with one simple promise: **every object works the same way**. Once you know the pattern, you know all of them.

## The three verbs: fit, predict, transform

Every scikit-learn object uses a few methods with the same names:

- **fit** means "learn from this data". For a model, fit finds the weights or the tree. For a scaler, fit learns the average and spread of each column.
- **predict** means "give me answers for new rows". Only models have it.
- **transform** means "apply what you learned to these rows". Preprocessors like scalers and encoders have it.

Think of a tailor. Taking your measurements is fit. Cutting the cloth to those measurements is transform. The important part is that you measure once, on the training data, and then cut every piece, training and test alike, using those same measurements. That separation is what stops information from the test data leaking into training.

Anything a model or scaler learned during fit is stored in attributes that end with an underscore, like coef_ for the weights of a linear model, or mean_ for the averages a scaler learned. The underscore is a reminder: "this only exists after fit".

## The standard workflow

Almost every project follows the same five steps:

- **Split** the data into a training set and a test set. The test set is locked away and used only once, at the very end, to get an honest score.
- **Build a pipeline** that chains the preparation steps and the model together, so scaling and encoding happen automatically, and only learn from training data.
- **Compare models** with cross-validation on the training data, which tests each model several times on different slices and averages the results.
- **Tune** the most promising model's settings, again with cross-validation.
- **Test once** on the locked-away test set, and report that number.

Because every model has the same methods, you can put three different models in a loop and score them all with a few lines. Swapping one model for another is a one-line change. That's the real power of the shared interface.

## Pipelines: preparation that can't leak

A **pipeline** joins steps together into one object. For example: first scale the features, then train logistic regression. When you call fit on the pipeline, it fits the scaler on the training data, transforms it, and trains the model. When you call predict on new data, it applies the same scaling, using the averages learned from training, and then predicts.

This sounds like a small convenience, but it's one of the most important habits in machine learning. Without it, it's very easy to scale using the whole dataset before splitting, which quietly lets the test data influence training and makes your scores look better than they really are.

## Saving your work

When you're done, you save the whole fitted pipeline to a file, not just the model. That way, whoever uses it later prepares new data exactly the same way you did. Load it with the same version of scikit-learn you saved it with, because saved models aren't guaranteed to work across versions.

## What to remember

Plot before you model: histograms show each feature's range and shape, and scatter plots show how separable the classes are. scikit-learn gives every model and preprocessor the same verbs, fit, predict and transform, so you learn the pattern once. Fit only on training data, keep preparation inside a pipeline, compare models with cross-validation, and use the test set only once, at the end.
`;
