import katex from "katex";

const render = (tex: string, display: boolean) => katex.renderToString(tex, { displayMode: display, throwOnError: false, output: "htmlAndMathml" });

/** Display equation. */
export function MathBlock({ tex }: { tex: string }) {
  return <div className="overflow-x-auto py-2 text-slate-900 dark:text-slate-100" dangerouslySetInnerHTML={{ __html: render(tex, true) }} />;
}

/** Text with $inline maths$, **bold** and `code`. */
export function TexText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("$") && part.endsWith("$") && part.length > 2 ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: render(part.slice(1, -1), false) }} />
        ) : part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>
        ) : part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
          <code key={i} className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.88em] text-slate-800 dark:bg-slate-800 dark:text-slate-100">{part.slice(1, -1)}</code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** A Python snippet, with a copy button. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-950 bg-slate-950 dark:border-slate-700">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs font-semibold text-[#b4b8c1]">
        <span>Python</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-[13.5px] leading-relaxed text-slate-100"><code className="font-mono">{code}</code></pre>
    </div>
  );
}
