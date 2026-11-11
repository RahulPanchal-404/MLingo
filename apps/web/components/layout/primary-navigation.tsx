"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

/** Grouped by what the learner is trying to do; the group names are the information. */
const navigationGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Start",
    items: [{ href: "/", label: "Home" }],
  },
  {
    title: "Learn",
    items: [
      { href: "/learn", label: "Lessons" },
      { href: "/theory", label: "Theory & Math" },
      { href: "/labs", label: "Labs" },
      { href: "/games", label: "Games" },
      { href: "/challenges", label: "Challenges" },
    ],
  },
  {
    title: "Build",
    items: [
      { href: "/workbench", label: "Workbench" },
      { href: "/experiments", label: "Experiments" },
      { href: "/projects", label: "Projects" },
      { href: "/portfolio", label: "Portfolio" },
    ],
  },
  {
    title: "You",
    items: [
      { href: "/progress", label: "Progress" },
      { href: "/profile", label: "Profile" },
    ],
  },
];

type PrimaryNavigationProps = { className?: string; mobile?: boolean };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function PrimaryNavigation({ className, mobile = false }: PrimaryNavigationProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav aria-label="Primary navigation" className={className}>
        <ul className="flex min-w-max gap-1 text-sm">
          {navigationGroups.flatMap((g) => g.items).map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  href={href}
                  className={`block rounded-full px-3 py-1.5 transition-colors duration-200 ${
                    active
                      ? "bg-teal-600 font-bold text-white dark:bg-teal-300 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
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

  return (
    <nav aria-label="Primary navigation" className={className}>
      <div className="sticky top-24 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            {group.title !== "Start" ? (
              <p className="mb-1.5 px-3 font-display text-[13px] font-bold text-slate-400 dark:text-slate-500">{group.title}</p>
            ) : null}
            <ul className="space-y-0.5 text-[15px]">
              {group.items.map(({ href, label }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      href={href}
                      className={`group relative flex items-center rounded-md py-1.5 pl-4 pr-3 transition-colors duration-200 ${
                        active
                          ? "font-bold text-slate-950 dark:text-white"
                          : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      {/* The marker is the descent dot: it sits on the page you are on. */}
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 h-2 w-2 rounded-full transition-[transform,background-color] duration-300 ease-[var(--ease-settle)] ${
                          active ? "scale-100 bg-marigold" : "scale-50 bg-slate-300 group-hover:scale-75 dark:bg-slate-700"
                        }`}
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
