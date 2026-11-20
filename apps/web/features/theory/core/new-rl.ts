import type { TheoryTopic } from "../topics";

const r = String.raw;

/** Reinforcement learning: a frame page for the textbook's sequential-decision units (Vol 3, Units 14–17). */
export const RL_THEORY: TheoryTopic[] = [
  {
    slug: "reinforcement-learning",
    group: "Foundations",
    title: "Reinforcement Learning: Sequential Decisions & Bellman Equations",
    summary: "Learning which action to take from rewards over time: states, actions, returns, the Bellman equation, value iteration and Q-learning.",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Reinforcement learning chooses actions in a sequence of states to maximise the total (discounted) reward, learning from the consequences of actions rather than from labelled answers." } },
          { p: "Supervised learning is told the right answer for each example. In reinforcement learning nobody gives the right action; the learner only sees rewards, often delayed. Deciding whether to inspect a machine today affects whether it fails next week." },
          { list: ["**State** $s$: what the agent knows now (healthy, warning, failed).", "**Action** $a$: what it can do (wait, inspect).", "**Reward** $r(s, a, s')$: the immediate payoff of a transition.", "**Policy** $\\pi(a \\mid s)$: the rule for picking actions.", "**Return** $G_t = \\sum_k \\gamma^k R_{t+k+1}$: the discounted sum of future rewards, with $0 \\le \\gamma < 1$."] },
        ],
      },
      {
        heading: "The Bellman equation, step by step",
        blocks: [
          { p: "The value of a state is the expected return from it. Conditioning on the first step splits it into \"reward now\" plus \"discounted value of where you land\":" },
          { math: r`V^*(s) = \max_a \sum_{s'} P(s' \mid s, a)\,\big[r(s, a, s') + \gamma V^*(s')\big]` },
          { p: "**Value iteration** applies this update to every state again and again. With finitely many states, bounded rewards and $\\gamma < 1$, it converges to a unique answer." },
        ],
      },
      {
        heading: "Worked example: inspect or wait?",
        blocks: [
          { p: "From the textbook: a warning machine can be inspected (cost 2, returns to healthy) or left (20% chance of failure costing 20, else stays warning). A healthy machine left alone stays healthy with probability 0.9. Discount γ = 0.9." },
          {
            steps: [
              { title: "Start", body: "V(healthy) = V(warning) = 0." },
              { title: "Sweep 1", body: "Healthy: max(inspect −2, wait 0) = 0. Warning: max(inspect −2, wait 0.2 × (−20) = −4) = −2." },
              { title: "Keep sweeping", body: "Values settle at V*(healthy) ≈ −1.651 and V*(warning) ≈ −3.486." },
              { title: "Read the policy", body: "In warning, inspecting (−3.49) beats waiting (−6.51). In healthy, waiting (−1.65) beats inspecting (−3.49)." },
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [{ code: r`# Value iteration on the textbook's maintenance MDP (Vol 3, Unit 17)
import numpy as np

discount = 0.9
H, W, F = 0, 1, 2                      # healthy, warning, failed (terminal)
WAIT, INSPECT = 0, 1
transitions = {                        # (state, action): [(probability, next_state, reward), ...]
    (H, WAIT):    [(0.9, H, 0.0), (0.1, W, 0.0)],
    (H, INSPECT): [(1.0, H, -2.0)],
    (W, WAIT):    [(0.8, W, 0.0), (0.2, F, -20.0)],
    (W, INSPECT): [(1.0, H, -2.0)],
}

def q(state, action, V):
    return sum(p * (r + discount * V[s2]) for p, s2, r in transitions[(state, action)])

V = np.zeros(3)
for sweep in range(1, 200):
    new = V.copy()
    for s in (H, W):
        new[s] = max(q(s, WAIT, V), q(s, INSPECT, V))
    if sweep in (1, 2, 3):
        print(f"sweep {sweep}: V(healthy)={new[H]:.3f}  V(warning)={new[W]:.3f}")
    if np.max(np.abs(new - V)) < 1e-10:
        V = new; break
    V = new

names = {WAIT: "wait", INSPECT: "inspect"}
for s, label in ((H, "healthy"), (W, "warning")):
    qs = {names[a]: round(float(q(s, a, V)), 3) for a in (WAIT, INSPECT)}
    print(f"{label:<8} V*={V[s]:.3f}  Q={qs}  best action: {max(qs, key=qs.get)}")

# Output:
# sweep 1: V(healthy)=0.000  V(warning)=-2.000
# sweep 2: V(healthy)=-0.180  V(warning)=-2.000
# sweep 3: V(healthy)=-0.326  V(warning)=-2.162
# healthy  V*=-1.651  Q={'wait': -1.651, 'inspect': -3.486}  best action: wait
# warning  V*=-3.486  Q={'wait': -6.51, 'inspect': -3.486}  best action: inspect` }],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Assuming the state captures everything", fix: "If history (sensor trend, maintenance record) matters, a small state summary breaks the Markov assumption." },
              { mistake: "Trusting values for actions the data rarely tried", fix: "Logged data from a policy that seldom inspects has little evidence about inspecting. Off-policy evaluation needs care." },
              { mistake: "Reading the discount as a safety rule", fix: "γ expresses time preference; hard safety limits need explicit constraints." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "When the transition probabilities are unknown, the agent learns from experience. **Temporal-difference** methods update a value estimate towards reward plus the discounted estimate of the next state; **Q-learning** does this for action values, $Q(s, a) \\leftarrow Q(s, a) + \\alpha\\,[r + \\gamma \\max_{a'} Q(s', a') - Q(s, a)]$. **Policy gradients** adjust a parameterised policy directly in the direction that increases expected return. The textbook sections below derive each one." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "With γ = 0.9, what is the return of rewards 0, 0, −20 (failure at step 3)?", solution: [{ p: "G = 0 + 0.9 × 0 + 0.81 × (−20) = −16.2." }] } },
          { problem: { q: "Write Q(warning, wait) in terms of V.", solution: [{ p: "Q = 0.2 × (−20 + γ·0) + 0.8 × (0 + γV(warning)) = −4 + 0.72 V(warning), with the terminal value 0." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [{ list: ["How does reinforcement learning differ from supervised learning?", "State the Bellman optimality equation.", "Why does value iteration converge when γ < 1?", "What is the difference between on-policy and off-policy learning?", "What does Q-learning update?"] }],
      },
      {
        heading: "Summary",
        blocks: [{ list: ["Agents pick actions in states to maximise discounted return.", "Bellman: value = best expected (reward now + γ × value next).", "Value iteration repeats the Bellman update until it stops changing.", "Without a model, learn from experience with TD, Q-learning or policy gradients.", "Validity depends on the state definition and on evidence for each action."] }],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "In reinforcement learning the learner receives…", options: ["the correct action for every state", "rewards that depend on its actions", "only unlabeled data", "a fixed dataset of answers"], answer: 1, why: "RL learns from rewards produced by its own actions, often delayed, not from labelled correct actions." } },
          { quiz: { q: "The discount γ = 0 means the agent…", options: ["values the far future most", "cares only about the immediate reward", "never acts", "always explores"], answer: 1, why: "With γ = 0 every future reward is multiplied by 0, so only the next reward counts." } },
          { quiz: { q: "In the maintenance example, the best action in the warning state is…", options: ["wait", "inspect", "either", "fail"], answer: 1, why: "Inspect has value −3.49 versus −6.51 for waiting." } },
        ],
      },
    ],
  },
];
