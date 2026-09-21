import type { FittedPipeline } from "../preprocessing";
import type { PreprocessingConfig } from "../types";

export function PreprocessingPreview({
  originalRows,
  transformedRows,
  config,
  pipeline,
  targetColumn,
}: {
  originalRows: Array<Record<string, string | number | null>>;
  transformedRows: Array<Record<string, number>>;
  config: PreprocessingConfig;
  pipeline?: FittedPipeline;
  targetColumn?: string;
}) {
  const isTransformed =
    config.numericScaling !== "none" ||
    config.missingImputation !== "none" ||
    config.categoricalEncoding !== "none";

  if (!isTransformed || originalRows.length === 0 || transformedRows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
        Enable one or more preprocessing operations above to view before-and-after transformations on real records.
      </div>
    );
  }

  const sampleCount = Math.min(3, originalRows.length);
  const sampleIndices = Array.from({ length: sampleCount }, (_, i) => i);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Before & After Transformation Inspection
        </h3>
        <p className="text-xs text-slate-500">
          Real mathematical outputs mapped from raw dataset values to model inputs.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {sampleIndices.map((idx) => {
          const orig = originalRows[idx];
          const trans = transformedRows[idx];

          return (
            <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-bold text-slate-700">Sample Row #{idx + 1}</span>
                <span className="text-[11px] text-slate-500">
                  {targetColumn && orig[targetColumn] !== undefined
                    ? `Target (${targetColumn}): ${orig[targetColumn]}`
                    : ""}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Before */}
                <div className="rounded border border-slate-200 bg-white p-3 font-mono">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">
                    Raw Original
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs">
                    {Object.entries(orig)
                      .filter(([k]) => k !== targetColumn)
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-slate-600">{k}:</span>
                          {v === null || v === undefined ? (
                            <span className="rounded bg-amber-100 px-1 py-0.2 text-[10px] font-bold text-amber-900">
                              null
                            </span>
                          ) : (
                            <span className="text-slate-900 font-semibold">{String(v)}</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* After */}
                <div className="rounded border border-teal-200 bg-teal-50/40 p-3 font-mono">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-teal-700">
                    Transformed Vector Output
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs">
                    {Object.entries(trans)
                      .filter(([k]) => k !== targetColumn)
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-teal-800">{k}:</span>
                          <span className="font-bold text-teal-950">{v}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pipeline?.scaler && (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600">
          <span className="font-bold text-slate-700">Fitted parameters: </span>
          {pipeline.scaler.means && (
            <span>
              Means: {Object.entries(pipeline.scaler.means).map(([k, v]) => `${k}=${v.toFixed(2)}`).join(", ")} |{" "}
              Stds: {Object.entries(pipeline.scaler.stds ?? {}).map(([k, v]) => `${k}=${v.toFixed(2)}`).join(", ")}
            </span>
          )}
          {pipeline.scaler.mins && (
            <span>
              Mins: {Object.entries(pipeline.scaler.mins).map(([k, v]) => `${k}=${v.toFixed(2)}`).join(", ")} |{" "}
              Maxs: {Object.entries(pipeline.scaler.maxs ?? {}).map(([k, v]) => `${k}=${v.toFixed(2)}`).join(", ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
