import type { ReactNode } from "react";

/** Remounts on every route change, giving each page one short entrance. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
