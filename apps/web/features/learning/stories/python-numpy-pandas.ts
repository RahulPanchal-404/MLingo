export const story = String.raw`
## Two ways to count a classroom

A teacher wants to add 5 bonus marks to every student in a class of 60. There are two ways to do it.

The slow way: pick up the first answer sheet, add 5, put it down. Pick up the second, add 5, put it down. Sixty times. That's how a plain Python loop works. It handles one number at a time, and for every number it has to check what kind of thing it is, find the right way to add, and store the result.

The fast way: write "+5 to everyone" on the board and let the whole class update their own sheets at the same moment. That's how **NumPy** works. You give it a whole block of numbers and one instruction, and it applies that instruction to everything at once, using fast code written in C underneath.

For 60 numbers, nobody notices the difference. For 6 million numbers, which is a normal size in machine learning, the loop might take seconds while NumPy finishes in a few milliseconds. That is why every ML library in Python is built on top of NumPy.

## NumPy: arrays of numbers

The heart of NumPy is the **array**: a grid of numbers that all have the same type. A one-dimensional array is just a vector, like the marks of one student across five subjects. A two-dimensional array is a matrix, like the marks of every student in every subject, one row per student.

Every array has a **shape** that tells you its size. Marks for 60 students in 5 subjects has shape (60, 5): 60 rows, 5 columns. You'll check shapes all the time, because when code breaks, the shape is usually the first clue.

## Doing maths on a whole array at once

With NumPy you write maths as if the array were a single number, and it's applied to every element. This is called **vectorisation**.

- Adding 5 to an array adds 5 to every element.
- Multiplying two arrays of the same shape multiplies them element by element.
- Comparing an array with a number, like marks greater than 40, gives back an array of True and False, one per element.

That last trick is incredibly useful. The True/False array is called a **mask**, and you can use it to pick out just the elements you want: "give me the marks of students who scored above 40". No loop, no if statement, one line.

## Asking questions about rows and columns

Most of the time you want a summary: the average mark, the highest mark, the total. With a 2-D array you also have to say **which direction** to summarise in, and NumPy uses the word **axis** for this.

- axis 0 means "go down the rows". The result has one value per column. For student marks, the mean along axis 0 gives the class average for each subject.
- axis 1 means "go across the columns". The result has one value per row. The mean along axis 1 gives each student's average across subjects.

A helpful way to remember it: in machine learning, rows are examples and columns are features, so axis 0 usually means "one result per feature", which is what you want when scaling data.

## Broadcasting: when shapes are different

What if you want to subtract each subject's average from every student's mark in that subject? The marks have shape (60, 5) and the averages have shape (5,). They aren't the same shape.

NumPy handles this with **broadcasting**: it quietly repeats the smaller array across the rows so the shapes match, then subtracts. This is exactly how features are standardised before training. Broadcasting is powerful, but it's also the source of sneaky bugs: if shapes line up by accident in a way you didn't intend, you get a wrong answer with no error. Print the shape of your result whenever you're not sure.

## pandas: tables with names

NumPy is perfect for numbers, but real data doesn't arrive as a clean grid of numbers. It arrives as a spreadsheet or a CSV file, with column names, text, dates and missing cells. Think of a hospital's patient records: name, age, city, date of admission, blood pressure, and a few cells left empty because a test wasn't done.

**pandas** gives you a **DataFrame**: a table where every column has a name and can have its own type. You can say "give me the age column" instead of "give me column 2", which makes code far easier to read and much harder to get wrong.

Each single column of a DataFrame is called a **Series**. Underneath, it's a NumPy array with a name and a label for each row.

## The first five minutes with any dataset

Experienced data scientists do the same few things every time they open a new dataset, before any modelling at all:

- Look at the **shape**: how many rows and columns are there? Is that what you expected?
- Look at the first few rows with head(). Does the data look sensible?
- Check the **dtypes**, the type of each column. A column of prices read as text instead of numbers is one of the most common silent problems.
- Count the **missing values** in each column with isna().sum(). Missing data has to be dealt with before training.
- Get quick statistics with describe(): mean, minimum, maximum. A patient age of 250 is a typo, not a miracle.

These five checks catch a surprising number of problems that would otherwise turn into strange model behaviour much later.

## Everyday pandas moves

A few operations cover most of the cleaning and exploring you'll do:

- **Selecting columns**: pick just the columns you need.
- **Filtering rows**: keep rows that meet a condition, like patients older than 60. It's the same mask idea as NumPy, but with names.
- **Creating new columns** from old ones: price per square metre from price and area, or the month from a date.
- **Grouping and summarising**: groupby splits the table into groups, such as one per city, and computes something for each group, such as average spend. This is how you explore patterns and build features like "average spend in this customer's city".
- **Filling missing values**: replace gaps with a sensible value, like the median.

One important warning about that last point. When you build a real model, don't fill missing values using an average computed from the whole dataset, because that average includes the test data the model is supposed to never see. Instead, let a scikit-learn pipeline learn the fill value from training data only. You'll see why in the data preprocessing lessons.

## How NumPy and pandas fit with the rest

You load and clean data with pandas, because names and mixed types make that easy. When it's time to train, scikit-learn accepts the DataFrame directly, and underneath it works on the NumPy arrays inside. You'll rarely need to convert anything by hand, but it helps to know that a DataFrame is really a set of named NumPy arrays wearing a nicer jacket.

## What to remember

NumPy stores numbers in arrays and applies maths to every element at once, which is fast and short to write. Shape and axis tell you what you have and which direction a summary runs in. pandas wraps arrays in tables with names, which is how real data arrives. Always look at shape, types and missing values before you model anything, and let pipelines handle anything that learns from the data.
`;
