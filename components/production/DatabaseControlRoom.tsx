"use client";

import { useEffect, useState } from "react";
import { Activity, Database, RefreshCw, Server, ShieldCheck } from "lucide-react";

type DatabaseStatus = {
  configured: boolean;
  projectRef: string;
  checkedAt: string;
  tables?: Record<string, number>;
  error?: string;
};

type CommandCenterResponse = {
  status: string;
  data?: Array<Record<string, unknown>>;
  message?: string;
};

export function DatabaseControlRoom() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [commandCenter, setCommandCenter] = useState<CommandCenterResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [statusResponse, commandResponse] = await Promise.all([
        fetch("/api/database/status", { cache: "no-store" }),
        fetch("/api/database/command-center", { cache: "no-store" }),
      ]);
      setStatus(await statusResponse.json());
      setCommandCenter(await commandResponse.json());
    } catch (error) {
      setStatus({ configured: false, projectRef: "xevoiljsumlqqamqkwla", checkedAt: new Date().toISOString(), error: error instanceof Error ? error.message : "Failed to load" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const tableEntries = Object.entries(status?.tables ?? {});
  const liveRow = commandCenter?.data?.[0];

  return (
    <div className="premium-dashboard">
      <section className="card-aurora database-hero">
        <div>
          <span className="premium-kicker"><Database size={14} /> Database Control Room</span>
          <h1>Supabase-backed product readiness and live data visibility.</h1>
          <p>Monitor database configuration, table counts, command-center view output and production-readiness status from one internal control room.</p>
          <div className="hero-actions"><button className="btn btn-primary" type="button" onClick={load}><RefreshCw size={18} /> Refresh Status</button></div>
        </div>
        <div className="database-live-card"><Server size={34} /><strong>{status?.configured ? "Connected" : "Config Needed"}</strong><span>{status?.projectRef ?? "xevoiljsumlqqamqkwla"}</span></div>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><Database /></div><span>Project Ref</span><strong style={{ fontSize: 20 }}>{status?.projectRef ?? "xevoiljsumlqqamqkwla"}</strong><small>Supabase</small><p>Production database project reference.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><ShieldCheck /></div><span>Runtime Config</span><strong>{status?.configured ? "Ready" : "Missing"}</strong><small>{loading ? "checking" : "checked"}</small><p>Shows whether environment variables are configured in the running app.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><Activity /></div><span>Tables Checked</span><strong>{tableEntries.length}</strong><small>core tables</small><p>Counts retrieved from Supabase when runtime keys are available.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><Server /></div><span>Command View</span><strong>{commandCenter?.status ?? "pending"}</strong><small>database view</small><p>Reads from Supabase database intelligence views.</p></article>
      </section>

      {status?.error ? <section className="premium-note"><Database size={18} /><p>{status.error}</p></section> : null}

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker">Table Counts</span>
          <h2>Core database records</h2>
          <div className="database-table-grid">
            {tableEntries.length ? tableEntries.map(([table, count]) => <article key={table}><strong>{count}</strong><span>{table}</span></article>) : <p className="muted-copy">Add Supabase environment variables in runtime to show live table counts here.</p>}
          </div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker">Command Center View</span>
          <h2>Live summary output</h2>
          {liveRow ? <div className="database-json-card"><pre>{JSON.stringify(liveRow, null, 2)}</pre></div> : <p className="muted-copy">Command center data will appear when runtime Supabase credentials are configured.</p>}
        </div>
      </section>
    </div>
  );
}
