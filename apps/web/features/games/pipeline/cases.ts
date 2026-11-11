/** Data Heist: detective cases. Suspects carry a statement and a hidden clue; timelines must be put in order. */

export type Suspect = { name: string; avatar: string; says: string; clue: string; guilty: boolean };
export type SuspectCase = { kind: "suspects"; title: string; story: string; ask: string; suspects: Suspect[]; verdict: string };
export type TimelineCase = { kind: "timeline"; title: string; story: string; steps: string[]; verdict: string };
export type Case = SuspectCase | TimelineCase;

const s = (avatar: string, name: string, says: string, clue: string, guilty = false): Suspect => ({ name, avatar, says, clue, guilty });

export const CASES: Record<string, Case[]> = {
  leak: [
    {
      kind: "suspects",
      title: "The Churn Caper",
      story: "A model predicts which customers will cancel next month. It scored 99% in testing and 60% in real life. Someone leaked the answer.",
      ask: "Accuse every feature that leaks the answer.",
      suspects: [
        s("🧓", "Support Calls", "I count support calls in the last 90 days.", "I'm known before the month even starts."),
        s("🦹", "Cancel Reason", "I record why the customer cancelled.", "I'm only filled in after they cancel. I AM the answer.", true),
        s("👩‍💼", "Plan Type", "I say whether they're on Basic or Pro.", "Set at sign-up, long before any prediction."),
        s("🥷", "Exit Survey Score", "I hold the score from the exit survey.", "Exit surveys are sent once someone has already left.", true),
        s("🧑‍🔧", "Logins Last Week", "I count logins in the week before the prediction.", "I happen before the prediction moment."),
      ],
      verdict: "Cancel Reason and Exit Survey Score only exist after the customer leaves. A feature is a leak if you wouldn't have it at the moment you predict.",
    },
    {
      kind: "suspects",
      title: "The House of Lies",
      story: "A house-price model is suspiciously perfect: almost zero error. Find the insider.",
      ask: "Who is leaking the target?",
      suspects: [
        s("🏠", "Area (sq ft)", "I'm the size of the house.", "Measured before any sale."),
        s("🛏️", "Bedrooms", "I count bedrooms.", "Known from the listing."),
        s("🦹‍♀️", "Price per sq ft", "I'm the sale price divided by the area.", "Multiply me by area and you get the exact price.", true),
        s("📍", "Neighbourhood", "I'm the area name.", "Known before the sale."),
      ],
      verdict: "Price per sq ft is computed from the sale price, so it hands the model the answer. Watch for features calculated from the target.",
    },
    {
      kind: "suspects",
      title: "The Double Agent",
      story: "A face-recognition model aced its test set. Then it failed on new people. The features look clean.",
      ask: "Who let the test set be contaminated?",
      suspects: [
        s("🎲", "Random Row Split", "I shuffled all photos and split 80/20.", "Each person had 30 photos, so the same faces landed in both train and test.", true),
        s("📸", "Image Pixels", "I'm the photo itself.", "That's the legitimate input."),
        s("📐", "Image Size", "I resize every photo the same way.", "Applied identically everywhere, learned nothing from data."),
        s("🧮", "Model Architecture", "I'm the network design.", "I don't touch the data split."),
      ],
      verdict: "A random row split put the same people in train and test, so the model was rewarded for memorising faces. Split by person (group) so test people are truly new.",
    },
  ],
  overfit: [
    {
      kind: "suspects",
      title: "The Con Artist",
      story: "Four models applied for the job. Their alibis are their training and test errors.",
      ask: "Unmask the overfitter: brilliant in training, useless on new data.",
      suspects: [
        s("🤵", "Model A", "Train error 6%, test error 7%.", "Small gap, both low. Honest."),
        s("🦹‍♂️", "Model B", "Train error 0.5%, test error 31%.", "Near-perfect on data it has seen, terrible on new data. It memorised.", true),
        s("😴", "Model C", "Train error 29%, test error 30%.", "Bad everywhere, but consistent. That's a different crime."),
        s("🧑‍🎓", "Model D", "Train error 9%, test error 11%.", "A small, normal gap."),
      ],
      verdict: "Model B has a tiny training error and a huge test error: it memorised the training data instead of learning the pattern. That is overfitting.",
    },
    {
      kind: "suspects",
      title: "The Slacker",
      story: "Another line-up. This time someone isn't even trying.",
      ask: "Find the underfitter: too simple to learn the pattern.",
      suspects: [
        s("📏", "Straight Line", "On a clearly curved pattern: train 34%, test 35%.", "High on both. It can't bend.", true),
        s("🌀", "Degree-15 Curve", "On 20 points: train 0%, test 48%.", "That's the overfitter's cousin."),
        s("🎯", "Degree-3 Curve", "Train 5%, test 6%.", "Good fit."),
        s("🌲", "Tuned Forest", "Train 4%, test 7%.", "A small, normal gap."),
      ],
      verdict: "The straight line is wrong on training and test alike: it's too simple for a curved pattern. That's underfitting. The fix is more flexibility, not more data.",
    },
    {
      kind: "suspects",
      title: "Stop the Clock",
      story: "A network trained for 100 epochs. Validation loss was lowest at epoch 30, then crept up while training loss kept falling.",
      ask: "Which checkpoint should you ship?",
      suspects: [
        s("⏱️", "Epoch 30", "I had the lowest validation loss.", "After me the model started memorising.", true),
        s("🏁", "Epoch 100", "I had the lowest training loss.", "Lowest training loss is the overfitter's alibi."),
        s("🐣", "Epoch 5", "I trained the shortest.", "Still underfit, validation loss was high."),
      ],
      verdict: "Ship the checkpoint with the lowest validation loss. Training loss keeps falling as the model memorises. Stopping early at the validation minimum is early stopping.",
    },
  ],
  order: [
    {
      kind: "timeline",
      title: "The Scaler Incident",
      story: "The scaler saw the test data. Rebuild the timeline the way it should have happened.",
      steps: ["Split into train and test", "Fit the scaler on the training set", "Transform train and test with that scaler", "Train the model", "Score once on the test set"],
      verdict: "Split first. Anything that learns from data (scalers, imputers, PCA) must be fitted on training data only, then applied to test.",
    },
    {
      kind: "timeline",
      title: "The Tuning Scandal",
      story: "Someone tuned hyperparameters on the test set and reported a glowing score. Put the investigation in order.",
      steps: ["Split into train, validation and test", "Train candidate models on train", "Pick the best on validation", "Retrain the winner on train + validation", "Report the test score once"],
      verdict: "Tune on a validation set and touch the test set only once at the end. Tuning on test makes its score optimistic.",
    },
    {
      kind: "timeline",
      title: "The Time Traveller",
      story: "A sales forecaster peeked at the future. Rebuild the time-series pipeline correctly.",
      steps: ["Sort records by date", "Use the earliest 80% as training", "Fill missing values using training statistics", "Train the model", "Test on the latest 20%"],
      verdict: "With time series, train on the past and test on the future. A random split lets the model see tomorrow while predicting today.",
    },
  ],
  metric: [
    {
      kind: "suspects",
      title: "The 99.9% Alibi",
      story: "A fraud detector claims 99.9% accuracy. 1 in 1000 payments is fraud.",
      ask: "Which witness is lying to you about this model?",
      suspects: [
        s("🎩", "Accuracy", "I say it's 99.9% right!", "Saying 'not fraud' to everything also scores 99.9%.", true),
        s("🔍", "Recall", "I say it caught 0 of the 12 frauds.", "I count real frauds caught."),
        s("⚖️", "Precision", "I say nothing was flagged.", "I count how many flags were real."),
      ],
      verdict: "On rare events accuracy is the liar: a model that never flags fraud is 99.9% accurate and useless. Recall tells the real story.",
    },
    {
      kind: "suspects",
      title: "The Missed Diagnosis",
      story: "A cancer screening test. Missing a sick patient is far worse than a false alarm.",
      ask: "Which witness should the hospital trust most?",
      suspects: [
        s("🔍", "Recall", "I measure how many sick patients were caught.", "Exactly the cost that matters here.", true),
        s("⚖️", "Precision", "I measure how many alarms were real.", "Matters, but false alarms are the cheap mistake."),
        s("🎩", "Accuracy", "I count all right answers.", "Most patients are healthy, so I look good regardless."),
        s("📉", "RMSE", "I measure the size of numeric errors.", "I'm for predicting numbers, not yes/no."),
      ],
      verdict: "When a miss is the expensive mistake, recall is the witness to trust: it counts how many real cases you caught.",
    },
    {
      kind: "suspects",
      title: "The Lost Email",
      story: "A spam filter. If a real email lands in spam, a customer loses an order. A bit of spam getting through is annoying but fine.",
      ask: "Which witness matters most here?",
      suspects: [
        s("⚖️", "Precision", "I measure how much of what you flagged was really spam.", "High precision = good emails rarely flagged.", true),
        s("🔍", "Recall", "I measure how much spam got caught.", "Missing some spam is the cheap mistake here."),
        s("🎩", "Accuracy", "I count all right answers.", "I don't care which mistake you make."),
      ],
      verdict: "When false alarms are the expensive mistake, precision is the witness: of everything flagged, how much really was spam.",
    },
  ],
};

export const BADGES_PER_CASE = 3;
export const CLUE_COST = 40;
export const WRONG_COST = 120;
export const CASE_POINTS = 1000;
/** A case's score: full marks minus clues bought and wrong accusations. */
export const caseScore = (clues: number, wrong: number, solved: boolean) => (solved ? Math.max(100, CASE_POINTS - CLUE_COST * clues - WRONG_COST * wrong) : 0);
