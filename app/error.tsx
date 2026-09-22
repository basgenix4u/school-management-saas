"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Route-level failure screen.
 *
 * Catches rendering and data errors anywhere below the root layout and
 * offers a way back instead of a blank crash. The failure is also reported
 * to monitoring so it does not pass silently.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch("/api/monitoring/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "client-boundary",
        severity: "error",
        message: error.message?.slice(0, 500) ?? "Route render failed",
        path: window.location.pathname,
      }),
    }).catch(() => null);
  }, [error]);

  return (
    <div className="page" style={{ maxWidth: "36rem", margin: "4rem auto" }}>
      <Card title="Something went wrong on this page">
        <p>
          <AlertTriangle size={38} className="ui-icon-muted" aria-hidden="true" />
        </p>
        <p>
          The page could not be displayed. Your data is safe — try again, and if
          it keeps happening, contact your school administrator with the time it occurred.
        </p>
        <div className="action-row">
          <Button onClick={reset}>
            <RotateCcw size={18} /> Try again
          </Button>
          <Button variant="secondary" href="/dashboard">Back to overview</Button>
        </div>
      </Card>
    </div>
  );
}
