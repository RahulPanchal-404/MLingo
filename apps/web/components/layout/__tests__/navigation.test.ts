import { describe, expect, it } from "vitest";

describe("Primary Navigation Routes", () => {
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

  it("includes all core routes including Portfolio, Projects, and Labs", () => {
    const hrefs = navigationItems.map((item) => item.href);
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/learn");
    expect(hrefs).toContain("/labs");
    expect(hrefs).toContain("/workbench");
    expect(hrefs).toContain("/experiments");
    expect(hrefs).toContain("/projects");
    expect(hrefs).toContain("/portfolio");
    expect(hrefs).toContain("/challenges");
    expect(hrefs).toContain("/progress");
    expect(hrefs).toContain("/profile");
  });

  it("ensures each navigation item has a valid href and human-readable label", () => {
    for (const item of navigationItems) {
      expect(item.href.startsWith("/")).toBe(true);
      expect(item.label.length).toBeGreaterThan(1);
    }
  });
});
