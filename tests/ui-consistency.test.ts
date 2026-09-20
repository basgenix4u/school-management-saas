import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Interface consistency guarantees.
 *
 * The product previously grew three button systems, two badge systems and
 * four hero styles side by side. These tests pin the single system: ui-*
 * primitives, token colors, and one page header — so new screens cannot
 * silently fork the interface again.
 */

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

function tsxFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(join(root, dir))) {
    const rel = join(dir, entry);
    if (entry === "node_modules" || entry === ".next") continue;
    if (entry.endsWith(".tsx")) found.push(rel);
    else if (!entry.includes(".")) tsxFiles(rel, found);
  }
  return found;
}

function classTokens(source: string): string[] {
  const tokens: string[] = [];
  for (const match of source.matchAll(/className="([^"]*)"/g)) {
    tokens.push(...match[1].split(/\s+/).filter(Boolean));
  }
  return tokens;
}

describe("single component system", () => {
  const retired = [
    "btn", "btn-primary", "btn-secondary",
    "ds-btn", "ds-btn-primary", "ds-btn-secondary", "ds-card", "ds-eyebrow",
    "premium-kicker", "premium-metric", "tone-blue", "tone-emerald", "tone-amber",
    "tone-rose", "tone-violet", "metric-icon", "panel-header", "mini-link",
    "back-link", "premium-table", "live-status-card", "empty-state-card",
    "role-tabs", "status", "metric", "metric-label", "metric-value",
    "metric-caption", "metric-grid", "action-chip", "notice", "notice-info",
    "notice-success", "notice-warning", "notice-danger", "section-title",
    "single-role-grid", "progress-track", "student-hero", "hero-actions",
    "intelligence-hero", "premium-dashboard", "launch-card",
  ];

  it("uses no retired classes in markup", () => {
    const offenders: string[] = [];
    for (const file of [...tsxFiles("app"), ...tsxFiles("components")]) {
      const tokens = new Set(classTokens(read(file)));
      const hit = retired.filter((name) => tokens.has(name));
      if (hit.length > 0) offenders.push(`${file}: ${hit.join(", ")}`);
    }
    expect(offenders).toEqual([]);
  });

  it("styles new primitives in the component layer", () => {
    const css = read("app/components.css");
    for (const selector of [".ui-eyebrow", ".ui-checkbox", ".ui-icon-success", ".ui-icon-muted", ".portal-topbar", ".ui-steps", ".receipt-rows"]) {
      expect(css).toContain(selector);
    }
  });

  it("removed the orphaned chart component", () => {
    expect(existsSync(join(root, "components", "premium", "RadialScore.tsx"))).toBe(false);
  });
});

describe("token-only interface", () => {
  it("keeps literal colors out of markup", () => {
    const offenders: string[] = [];
    for (const file of [...tsxFiles("app"), ...tsxFiles("components")]) {
      if (/color="#|#[0-9a-fA-F]{3}\b|#[0-9a-fA-F]{6}\b/.test(read(file))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it("keeps pre-token palettes out of markup", () => {
    const offenders: string[] = [];
    for (const file of [...tsxFiles("app"), ...tsxFiles("components")]) {
      if (read(file).includes("zinc-")) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

describe("portal navigation", () => {
  it("gives every portal view a topbar with sign-out", () => {
    for (const file of [
      "components/portal/ParentPortal.tsx",
      "components/portal/StudentPortal.tsx",
      "components/portal/PortalReceipt.tsx",
    ]) {
      expect(read(file)).toContain("PortalTopbar");
    }
    expect(read("components/portal/PortalTopbar.tsx")).toContain("/api/auth/sign-out");
  });
});

describe("responsive guarantees", () => {
  it("scrolls wide tables instead of overflowing", () => {
    expect(read("app/globals.css")).toContain(".report-table-scroll");
    expect(read("app/dashboard/results/report-card/[student]/page.tsx")).toContain("report-table-scroll");
    expect(read("app/components.css")).toContain(".ui-table-wrap");
  });

  it("collapses two-column layouts on narrow screens", () => {
    const css = read("app/globals.css");
    expect(css).toMatch(/@media[^{]*\{[^@]*\.premium-grid-2[^@]*grid-template-columns: 1fr/);
    expect(css).toMatch(/@media[^{]*\{[^@]*\.portal-hero[^@]*grid-template-columns: 1fr/);
  });
});
