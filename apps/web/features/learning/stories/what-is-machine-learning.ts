export const story = String.raw`
## The mango seller who never wrote a rule

Every summer, Lakshmi sells mangoes at the market in Mysuru. Customers always ask the same question: "Is this one sweet?" She picks up a mango, turns it in her hand, presses it gently, smells near the stem, and says "Yes, take this one" or "No, wait two days." She's almost always right.

Ask her *how* she does it, and she struggles to explain. "It feels right." "It smells ready." She never learned a rulebook. She learned from experience: thousands of mangoes over many summers, each one teaching her a little more about which colours, smells and textures go with sweetness.

Now imagine you want a computer to do Lakshmi's job. There are two completely different ways to try.

## Way 1: write the rules yourself

The traditional way to program a computer is to write exact instructions. You might try:

- If the skin is more than 70% yellow, it's ripe.
- Otherwise, if it gives slightly when pressed, it's ripe.
- Otherwise, it's not ripe.

This works for a few mangoes. Then you meet an Alphonso that stays green but is perfectly sweet, a Banganapalli whose skin is yellow but the inside is sour, a mango that's soft because it's bruised, not ripe. Every exception needs a new rule, and every new rule breaks something else. After a hundred rules, the program is a tangled mess, and it still gets new mangoes wrong.

For many real problems, like recognising faces, understanding speech or spotting fraud, nobody can write the rules at all. We simply don't know them, just as Lakshmi can't put hers into words.

## Way 2: learn the rules from examples

**Machine learning** flips the whole approach. Instead of writing the rules, you collect examples where you already know the answer, and you let the computer work out the rules itself.

You'd measure a few things about each mango: how yellow the skin is, how firm it is, how strong the smell is, how heavy it is. Then you'd write down whether it actually turned out sweet. Do this for a few thousand mangoes, and you have a dataset. A machine learning method looks through all those examples and finds the pattern that connects the measurements to the answer.

That's the core idea in one sentence: **in traditional programming, you give the computer rules and data, and it gives you answers. In machine learning, you give the computer data and answers, and it gives you the rules.**

## The three pieces of every model

Every machine learning model, from the simplest to the largest, has the same three pieces:

- **Inputs**, called **features**, written x. These are the measurements you give the model: skin colour, firmness, smell, weight.
- **A model** with adjustable settings called **parameters**. Think of them as knobs. Turning the knobs changes how the model combines the features into an answer.
- **An output**, called the **prediction**, written ŷ ("y-hat"). For the mango: sweet or not, or perhaps a sweetness score.

Here's what a very simple model might look like for a sweetness score:

ŷ = w₁ × colour + w₂ × softness + w₃ × smell + b

The w's and b are the knobs. Before learning, they're set to random or neutral values, so the predictions are poor. **Learning means turning the knobs until the predictions match the real answers as closely as possible.** That's all a model is: a formula with knobs, and training is the process of finding good knob settings.

## Training and using a model

There are two phases in a model's life, and it's important to keep them apart.

- **Training**: the model looks at examples where the answer is known, compares its predictions with the real answers, and adjusts its knobs to do better. This happens once (or once in a while), usually on a powerful computer.
- **Inference**, or prediction: the trained model is given new examples where the answer is unknown, like a mango that just arrived at the market, and it makes a prediction using the knob settings it learned. This happens every time someone uses it.

The real test of a model is always inference: does it work on mangoes it has never seen? A model that's perfect on the mangoes it trained on but wrong on new ones has memorised, not learned. Avoiding that is one of the big themes of this course.

## The main kinds of machine learning

Machine learning problems come in a few main types, depending on what kind of answer you want and whether you have answers to learn from.

- **Regression**: predicting a number. How much will this house sell for? How many minutes will this delivery take? What will tomorrow's temperature be?
- **Classification**: predicting a category. Is this email spam or not? Is this transaction fraud? Which digit is in this photo?
- **Clustering**: finding groups when you have no answers at all. Which customers behave similarly? This is called **unsupervised** learning, because nobody tells the model the right groups.

Regression and classification are **supervised** learning: you supervise the model with examples that include the right answer. Most of this course is about supervised learning, with a chapter on clustering later.

## Where you already meet machine learning

You use machine learning many times a day, often without noticing:

- Your phone unlocks by recognising your face. Nobody wrote rules for your face; a model learned what faces look like from millions of examples.
- YouTube and Netflix suggest what to watch next, learned from what millions of people watched after watching what you just did.
- Your email app moves spam out of your inbox, learned from emails people marked as spam.
- Google Maps estimates your arrival time, learned from the speeds of millions of past trips at the same time of day.
- Banks flag unusual card payments, learned from the patterns of past fraud.

## What machine learning is not

It's worth clearing up a few myths early.

A model is not a brain and it doesn't "understand" mangoes or emails. It's a mathematical function that has been tuned to match examples. It can only learn patterns that are actually present in the data it was given. If every mango in the training data came from one farm, it might fail on mangoes from another farm. If the data is biased, the model will be biased too.

And machine learning isn't always the right tool. If a simple rule works perfectly, like "if the bill is over ₹10,000, ask for a signature", just write the rule. Machine learning shines when the rules are too complex, too numerous, or simply unknown.

## What to remember

Machine learning means learning the rules from examples instead of writing them by hand. A model is a formula with adjustable knobs; training turns the knobs until predictions match known answers, and inference uses the tuned model on new data. Regression predicts numbers, classification predicts categories, and clustering finds groups without answers. In the next lesson, you'll see exactly how a model turns its knobs.
`;
