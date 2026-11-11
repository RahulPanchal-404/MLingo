"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavItem = { href: string; label: string; text?: string };
type NavGroup = { title: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Learn",
    items: [
      { href: "/learn", label: "Lessons", text: "29 short lessons, foundations to clustering" },
      { href: "/theory", label: "Theory & Math", text: "The equations behind each lesson" },
      { href: "/labs", label: "Labs", text: "Train a model and scrub every step" },
      { href: "/games", label: "Games", text: "One concept per level" },
      { href: "/challenges", label: "Challenges", text: "Break training, diagnose why" },
    ],
  },
  {
    title: "Build",
    items: [
      { href: "/workbench", label: "Workbench", text: "Clean, scale and split data" },
      { href: "/experiments", label: "Experiments", text: "Compare runs side by side" },
      { href: "/projects", label: "Projects", text: "End-to-end case studies" },
      { href: "/portfolio", label: "Portfolio", text: "Your finished work" },
    ],
  },
];
const YOU: NavItem[] = [
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop: two menus + direct links. Menus open on click or hover and close on Escape / outside click. */
export function TopNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <nav aria-label="Primary navigation" ref={ref} className="hidden items-center gap-1 md:flex">
      {NAV_GROUPS.map((group) => {
        const groupActive = group.items.some((i) => isActive(pathname, i.href));
        const isOpen = open === group.title;
        return (
          <div key={group.title} className="relative" onMouseEnter={() => setOpen(group.title)} onMouseLeave={() => setOpen(null)}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : group.title)}
              className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] transition-colors duration-150 ${
                groupActive ? "text-slate-950 dark:text-white" : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {group.title}
              <svg viewBox="0 0 10 10" className={`h-2.5 w-2.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
                <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {groupActive ? <span className="ml-0.5 h-1 w-1 rounded-full bg-teal-500 dark:bg-teal-300" aria-hidden="true" /> : null}
            </button>
            <div
              className={`absolute left-0 top-full z-40 pt-2 transition-[opacity,transform] duration-200 ease-[var(--ease-enter)] ${
                isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              <ul className="w-[22rem] rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(null)}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="block rounded-xl px-3.5 py-2.5 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className={`block font-semibold ${isActive(pathname, item.href) ? "text-teal-700 dark:text-teal-300" : "text-slate-900 dark:text-slate-100"}`}>{item.label}</span>
                      <span className="block text-sm text-slate-500 dark:text-slate-400">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
      {YOU.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={`rounded-full px-3.5 py-2 text-[15px] transition-colors duration-150 ${
            isActive(pathname, item.href) ? "text-slate-950 dark:text-white" : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** Mobile: one scrolling row of every destination. */
export function PrimaryNavigation({ className }: { className?: string; mobile?: boolean }) {
  const pathname = usePathname();
  const items = [{ href: "/", label: "Home" }, ...NAV_GROUPS.flatMap((g) => g.items), ...YOU];
  return (
    <nav aria-label="Primary navigation" className={className}>
      <ul className="flex min-w-max gap-1 text-sm">
        {items.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                aria-current={active ? "page" : undefined}
                href={href}
                className={`block rounded-full px-3 py-1.5 transition-colors duration-200 ${
                  active ? "bg-slate-950 font-semibold text-white dark:bg-white dark:text-slate-950" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
