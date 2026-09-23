export function TheProblemSection() {
  return (
    <section className="space-y-6" aria-labelledby="problem-heading">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-mono font-semibold text-slate-700">
          <span>01 // THE EDUCATIONAL PROBLEM</span>
        </div>
        <h2
          id="problem-heading"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950"
        >
          Traditional ML hides the journey. MLingo records it.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          In typical tutorials, training is a silent loop between code and a final metric score.
          When a model fails or plateaus, students have no visual intuition for why.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Traditional Black Box Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                Traditional Workflow
              </span>
              <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-mono text-rose-700 font-semibold">
                THE BLACK BOX
              </span>
            </div>

            {/* Sequence Flow */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                <span className="text-[10px] text-slate-400 block">01</span>
                <span className="font-bold text-slate-700">Theory</span>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                <span className="text-[10px] text-slate-400 block">02</span>
                <span className="font-bold text-slate-700">Code</span>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 text-white p-2 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-rose-500/10" />
                <span className="text-[10px] text-rose-300 block">03</span>
                <span className="font-bold text-rose-200">Train (?)</span>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                <span className="text-[10px] text-slate-400 block">04</span>
                <span className="font-bold text-slate-700">Final Metric</span>
              </div>
            </div>

            {/* Simulated Black Box Terminal Output */}
            <div className="rounded-xl bg-slate-950 p-3.5 font-mono text-[11px] text-slate-400 space-y-1 border border-slate-800">
              <div className="text-slate-400 font-bold">$ model.fit(X_train, y_train, epochs=40)</div>
              <div className="text-slate-400">Epoch 01/40: loss = 1.824</div>
              <div className="text-slate-400 italic">... [38 iterations hidden inside compiled C/CUDA] ...</div>
              <div className="text-emerald-400 font-bold">Epoch 40/40: loss = 0.042 — Done.</div>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
            <strong className="text-slate-700">The Problem:</strong> When training diverges or
            plateaus, the student is blind. Parameters, gradients, and loss trajectories remain
            trapped inside opaque memory registers.
          </p>
        </div>

        {/* MLingo Frame-by-Frame Card */}
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50/50 to-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-wider">
                The MLingo Paradigm
              </span>
              <span className="rounded-full bg-teal-100 border border-teal-300 px-2 py-0.5 text-[11px] font-mono text-teal-900 font-semibold">
                FRAME BY FRAME
              </span>
            </div>

            {/* Sequence Flow */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
              <div className="rounded-lg bg-teal-100/60 border border-teal-300 p-2">
                <span className="text-[10px] text-teal-700 block">s00</span>
                <span className="font-bold text-teal-950">Initialize</span>
              </div>
              <div className="rounded-lg bg-teal-100/60 border border-teal-300 p-2">
                <span className="text-[10px] text-teal-700 block">s10</span>
                <span className="font-bold text-teal-950">Descent</span>
              </div>
              <div className="rounded-lg bg-teal-100/60 border border-teal-300 p-2">
                <span className="text-[10px] text-teal-700 block">s24</span>
                <span className="font-bold text-teal-950">Decelerate</span>
              </div>
              <div className="rounded-lg bg-teal-700 text-white border border-teal-800 p-2 shadow-xs">
                <span className="text-[10px] text-teal-200 block">s40</span>
                <span className="font-bold">Converged</span>
              </div>
            </div>

            {/* Simulated MLingo Timeline Inspector */}
            <div className="rounded-xl bg-slate-900 p-3.5 font-mono text-[11px] text-slate-300 space-y-1.5 border border-teal-500/30">
              <div className="flex items-center justify-between text-teal-300 font-semibold border-b border-slate-800 pb-1">
                <span>TIMELINE FRAME: STEP 24</span>
                <span className="text-[10px] text-slate-400">SYNCED WITH X-RAY</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-300 pt-0.5">
                <div>
                  <span className="text-slate-400 text-[10px] block">LOSS</span>
                  <span className="text-amber-400 font-bold">0.284</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">WEIGHT w</span>
                  <span className="font-bold text-white">1.731</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">GRADIENT</span>
                  <span className="text-teal-400 font-bold">-0.042</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed border-t border-teal-100 pt-3">
            <strong className="text-teal-900">The MLingo Solution:</strong> Every single step is
            recorded and scrubbable. Students inspect why the model arrived at its weights, how
            gradients shrink, and what happens when learning parameters break.
          </p>
        </div>
      </div>
    </section>
  );
}
