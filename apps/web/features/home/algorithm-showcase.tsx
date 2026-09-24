import Link from "next/link";

interface AlgorithmItem {
  id: string;
  name: string;
  category: string;
  lossMetric: string;
  description: string;
  labHref: string;
  renderVisual: () => React.ReactNode;
}

export function AlgorithmShowcase() {
  const algorithms: AlgorithmItem[] = [
    {
      id: "linear_regression",
      name: "Linear Regression",
      category: "SUPERVISED // REGRESSION",
      lossMetric: "Mean Squared Error (MSE)",
      description:
        "Watch gradient descent pivot a regression line to minimize the squared distance to every data point frame by frame.",
      labHref: "/labs/gradient-descent",
      renderVisual: () => (
        <svg viewBox="0 0 200 110" className="w-full h-auto select-none" role="img" aria-label="Linear regression fitting line">
          <line x1="20" y1="90" x2="180" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
          <line x1="20" y1="20" x2="20" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
          {/* Data points */}
          {[
            [35, 75], [50, 70], [65, 58], [80, 52], [95, 48],
            [110, 42], [125, 36], [140, 30], [155, 25], [170, 20]
          ].map(([cx, cy], i) => (
            <g key={i}>
              <line x1={cx} y1={cy} x2={cx} y2={85 - ((cx - 20) * 0.42)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <circle cx={cx} cy={cy} r="3" fill="#0ea5e9" />
            </g>
          ))}
          {/* Fitted Line */}
          <line x1="25" y1="83" x2="175" y2="20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "logistic_regression",
      name: "Logistic Regression",
      category: "SUPERVISED // CLASSIFICATION",
      lossMetric: "Binary Cross-Entropy (Log-Loss)",
      description:
        "Squeeze linear outputs into 0–1 probabilities with the sigmoid curve, shifting the decision boundary as weights update.",
      labHref: "/labs/logistic-regression",
      renderVisual: () => (
        <svg viewBox="0 0 200 110" className="w-full h-auto select-none" role="img" aria-label="Logistic regression decision boundary dividing two classes">
          <line x1="20" y1="90" x2="180" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
          <line x1="20" y1="20" x2="20" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
          {/* Class 0 points (Blue) */}
          {[
            [35, 80], [45, 65], [60, 75], [70, 55], [80, 70], [55, 45]
          ].map(([cx, cy], i) => (
            <circle key={`c0-${i}`} cx={cx} cy={cy} r="3.5" fill="#38bdf8" />
          ))}
          {/* Class 1 points (Amber) */}
          {[
            [120, 35], [135, 50], [145, 25], [155, 40], [165, 30], [140, 60]
          ].map(([cx, cy], i) => (
            <circle key={`c1-${i}`} cx={cx} cy={cy} r="3.5" fill="#f59e0b" />
          ))}
          {/* Decision Boundary Line */}
          <line x1="75" y1="95" x2="135" y2="15" stroke="#14b8a6" strokeWidth="2.5" strokeDasharray="3 3" />
        </svg>
      ),
    },
    {
      id: "kmeans_clustering",
      name: "K-Means Clustering",
      category: "UNSUPERVISED // CLUSTERING",
      lossMetric: "Within-Cluster Inertia (WCSS)",
      description:
        "Watch centroids hunt for cluster centers of mass, pulling surrounding data points into tightly grouped partitions.",
      labHref: "/labs/k-means",
      renderVisual: () => (
        <svg viewBox="0 0 200 110" className="w-full h-auto select-none" role="img" aria-label="K-Means cluster centroids and grouped points">
          {/* Cluster 1 (Teal) */}
          {[[45, 35], [55, 25], [40, 45], [60, 40], [50, 50]].map(([cx, cy], i) => (
            <circle key={`k1-${i}`} cx={cx} cy={cy} r="3" fill="#14b8a6" opacity="0.8" />
          ))}
          <circle cx="50" cy="38" r="7" fill="none" stroke="#2dd4bf" strokeWidth="2" />
          <circle cx="50" cy="38" r="2" fill="#2dd4bf" />

          {/* Cluster 2 (Purple) */}
          {[[145, 35], [155, 25], [140, 45], [160, 40], [150, 50]].map(([cx, cy], i) => (
            <circle key={`k2-${i}`} cx={cx} cy={cy} r="3" fill="#a855f7" opacity="0.8" />
          ))}
          <circle cx="150" cy="38" r="7" fill="none" stroke="#c084fc" strokeWidth="2" />
          <circle cx="150" cy="38" r="2" fill="#c084fc" />

          {/* Cluster 3 (Amber) */}
          {[[95, 75], [105, 65], [90, 85], [110, 80], [100, 90]].map(([cx, cy], i) => (
            <circle key={`k3-${i}`} cx={cx} cy={cy} r="3" fill="#f59e0b" opacity="0.8" />
          ))}
          <circle cx="100" cy="78" r="7" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="100" cy="78" r="2" fill="#fbbf24" />
        </svg>
      ),
    },
    {
      id: "neural_network",
      name: "Neural Network",
      category: "DEEP LEARNING // MULTI-LAYER",
      lossMetric: "Multi-Class Cross-Entropy",
      description:
        "Trace activations forward through hidden layers and follow calculus chain-rule gradients backwards during backpropagation.",
      labHref: "/labs/neural-network",
      renderVisual: () => (
        <svg viewBox="0 0 200 110" className="w-full h-auto select-none" role="img" aria-label="Neural network layers and synaptic weights">
          {/* Layer 1 nodes: x = 40 */}
          {/* Layer 2 nodes: x = 100 */}
          {/* Layer 3 nodes: x = 160 */}
          {/* Connections L1 to L2 */}
          {[35, 75].flatMap((y1) =>
            [25, 55, 85].map((y2) => (
              <line key={`${y1}-${y2}`} x1="40" y1={y1} x2="100" y2={y2} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" opacity="0.6" />
            ))
          )}
          {/* Connections L2 to L3 */}
          {[25, 55, 85].flatMap((y2) =>
            [40, 70].map((y3) => (
              <line key={`${y2}-${y3}`} x1="100" y1={y2} x2="160" y2={y3} stroke="#0f766e" strokeWidth="1.2" opacity="0.8" />
            ))
          )}
          {/* Input Layer */}
          <circle cx="40" cy="35" r="6" fill="#0284c7" />
          <circle cx="40" cy="75" r="6" fill="#0284c7" />
          {/* Hidden Layer */}
          <circle cx="100" cy="25" r="6" fill="#0f766e" />
          <circle cx="100" cy="55" r="6" fill="#0f766e" />
          <circle cx="100" cy="85" r="6" fill="#0f766e" />
          {/* Output Layer */}
          <circle cx="160" cy="40" r="6" fill="#f59e0b" />
          <circle cx="160" cy="70" r="6" fill="#f59e0b" />
        </svg>
      ),
    },
  ];

  return (
    <section className="space-y-6" aria-labelledby="algorithm-showcase-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-0.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            <span>05 // ALGORITHM ARCHITECTURE</span>
          </div>
          <h2
            id="algorithm-showcase-heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Real Machine Learning Behaviors
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Every algorithm is rendered from actual mathematical mechanics, not generic decorative
            mockups. Select an algorithm to begin recording.
          </p>
        </div>

        <Link
          href="/labs"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 transition-colors shrink-0"
        >
          <span>View All 4 Labs →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {algorithms.map((algo) => (
          <Link
            key={algo.id}
            href={algo.labHref}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs hover:border-teal-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer"
          >
            <div className="space-y-3">
              {/* Mini SVG Visualization Container */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 overflow-hidden flex items-center justify-center">
                {algo.renderVisual()}
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider block">
                  {algo.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-300 transition-colors">
                  {algo.name}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {algo.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                {algo.lossMetric}
              </span>
              <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                Launch Lab →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
