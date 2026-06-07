"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { canSeeItem, navItems } from "@/components/navigation/nav-items";

type SessionResponse = { session?: { user?: { role?: string } } };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string | undefined>();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => response.json())
        .then((data: SessionResponse) => setRole(data.session?.user?.role ?? "SCHOOL_OWNER"))
        .catch(() => setRole("SCHOOL_OWNER"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visibleActions = useMemo(() => navItems.filter((item) => canSeeItem(item, role)), [role]);
  const filteredActions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return visibleActions;
    return visibleActions.filter((action) => `${action.title} ${action.hint} ${action.tags}`.toLowerCase().includes(value));
  }, [query, visibleActions]);

  return (
    <>
      <button className="command-trigger" type="button" onClick={() => setOpen(true)}>
        <Search size={16} /> Search actions <kbd>⌘K</kbd>
      </button>

      {open ? (
        <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
          <button className="command-backdrop" type="button" aria-label="Close command palette" onClick={() => setOpen(false)} />
          <div className="command-modal">
            <div className="command-search-row">
              <Search size={20} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actions for your role..." />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="command-results">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} onClick={() => setOpen(false)}>
                    <span className="command-icon"><Icon size={18} /></span>
                    <span><strong>{action.title}</strong><small>{action.hint}</small></span>
                  </Link>
                );
              })}
              {filteredActions.length === 0 ? <p className="command-empty">No action found for this role.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
