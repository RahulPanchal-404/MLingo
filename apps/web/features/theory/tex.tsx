import katex from "katex";

const render = (tex: string, display: boolean) => katex.renderToString(tex, { displayMode: display, throwOnError: false, output: "htmlAndMathml" });

/** Display equation. */
export function MathBlock({ tex }: { tex: string }) {
  return <div className="overflow-x-auto py-2 text-slate-900 dark:text-slate-100" dangerouslySetInnerHTML={{ __html: render(tex, true) }} />;
}

/** Text with $inline maths$. */
export function TexText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("$") && part.endsWith("$") && part.length > 2 ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: render(part.slice(1, -1), false) }} />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
