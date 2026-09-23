"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/labs", label: "Labs" },
  { href: "/workbench", label: "Workbench" },
  { href: "/experiments", label: "Experiments" },
  { href: "/projects", label: "Projects" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/challenges", label: "Challenges" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];


type PrimaryNavigationProps = { className?: string; mobile?: boolean };

export function PrimaryNavigation({ className, mobile = false }: PrimaryNavigationProps) {
  const pathname = usePathname();
  const listClassName = mobile
    ? "flex min-w-max gap-1 text-sm text-slate-600 dark:text-slate-400"
    : "space-y-1.5 text-sm text-slate-600 dark:text-slate-400";

  return (
    <nav aria-label="Primary navigation" className={className}>
      <ul className={listClassName}>
        {navigationItems.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "block rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 px-3 py-2 font-semibold text-teal-900 dark:text-teal-200 shadow-xs"
                    : "block rounded-lg px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-slate-100 transition-colors"
                }
                href={href}
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
