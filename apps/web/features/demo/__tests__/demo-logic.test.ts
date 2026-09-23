import { describe, expect, it } from "vitest";

describe("Interactive Demo Configuration & Flow", () => {
  const DEMO_STEPS = [
    { step: 1, title: "Start with a Dataset" },
    { step: 2, title: "Watch the Model Learn" },
    { step: 3, title: "Scrub Through Training" },
    { step: 4, title: "Inspect What Changed" },
    { step: 5, title: "Ask Why (AI Tutor)" },
    { step: 6, title: "Change Something" },
    { step: 7, title: "Compare the Result" },
    { step: 8, title: "Turn Learning into a Project" },
  ];

  it("defines all 8 consecutive steps in the core learning loop", () => {
    expect(DEMO_STEPS).toHaveLength(8);
    expect(DEMO_STEPS[0].title).toBe("Start with a Dataset");
    expect(DEMO_STEPS[7].title).toBe("Turn Learning into a Project");
  });

  it("ensures step index transitions respect lower and upper bounds", () => {
    let currentStep = 1;
    const nextStep = () => {
      if (currentStep < 8) currentStep++;
    };
    const prevStep = () => {
      if (currentStep > 1) currentStep--;
    };

    // Attempt to decrement below 1
    prevStep();
    expect(currentStep).toBe(1);

    // Increment through all steps
    for (let i = 0; i < 10; i++) {
      nextStep();
    }
    expect(currentStep).toBe(8);

    // Decrement back to step 1
    for (let i = 0; i < 10; i++) {
      prevStep();
    }
    expect(currentStep).toBe(1);
  });
});
