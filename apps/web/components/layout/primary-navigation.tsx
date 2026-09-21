"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/labs", label: "Labs" },
  { href: "/workbench", label: "Workbench" },
  { href: "/experiments", label: "Experiments" },
  { href: "/challenges", label: "Challenges" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];

type PrimaryNavigationProps = { className?: string; mobile?: boolean };

export function PrimaryNavigation({ className, mobile = false }: PrimaryNavigationProps) {
  const pathname = usePathname();
  const listClassName = mobile ? "flex min-w-max gap-1 text-sm text-slate-600" : "space-y-1 text-sm text-slate-600";

  return (
    <nav aria-label="Primary navigation" className={className}>
      <ul className={listClassName}>
        {navigationItems.map(({ href, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "block rounded-md bg-teal-50 px-3 py-2 font-medium text-teal-800" : "block rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-950"}
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
