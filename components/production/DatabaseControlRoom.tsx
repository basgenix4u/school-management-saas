"use client";

import { useEffect, useState } from "react";
import { Activity, Database, RefreshCw, Server, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Metric, MetricGrid } from "@/components/ui/Metric";
import { Table } from "@/components/ui/Table";

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
      setStatus({ configured: false, projectRef: "not connected", checkedAt: new Date().toISOString(), error: error instanceof Error ? error.message : "Failed to load" });
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
  const liveEntries = liveRow ? Object.entries(liveRow).filter(([, value]) => typeof value !== "object") : [];

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Database</p>
        <h1 className="page-title">Data health for your school.</h1>
        <p className="page-subtitle">Connection, per-table counts and the live summary view — scoped to your workspace.</p>
      </header>

      <div className="action-row">
        <Button onClick={load} disabled={loading}><RefreshCw size={18} /> Refresh status</Button>
      </div>

      {status?.error ? <Alert tone="danger"><p>{status.error}</p></Alert> : null}

      <MetricGrid>
        <Metric icon={<Database size={20} />} label="Project" value={status?.projectRef ?? "—"} caption="connected Supabase project" />
        <Metric icon={<ShieldCheck size={20} />} label="Runtime config" value={status?.configured ? "Ready" : "Missing"} caption={loading ? "checking…" : `checked ${status?.checkedAt ? new Date(status.checkedAt).toLocaleTimeString() : "—"}`} />
        <Metric icon={<Activity size={20} />} label="Tables checked" value={String(tableEntries.length)} caption="core tables" />
        <Metric icon={<Server size={20} />} label="Summary view" value={commandCenter?.status ?? "pending"} caption="intelligence views" />
      </MetricGrid>

      <div className="premium-grid-2 align-start">
        <Card title="Records by table" subtitle={tableEntries.length ? "Your school's rows." : "Counts appear once the database connects."}>
          {tableEntries.length === 0 ? (
            <p className="ui-hint">Add Supabase environment variables to show live table counts here.</p>
          ) : (
            <Table>
              <thead><tr><th>Table</th><th className="numeric">Rows</th></tr></thead>
              <tbody>
                {tableEntries.map(([table, count]) => (
                  <tr key={table}><td>{table}</td><td className="numeric">{count}</td></tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card title="Live summary" subtitle="One row from the command-center view.">
          {liveEntries.length === 0 ? (
            <p className="ui-hint">Summary data will appear when the database connects.</p>
          ) : (
            <Table>
              <thead><tr><th>Figure</th><th>Value</th></tr></thead>
              <tbody>
                {liveEntries.map(([key, value]) => (
                  <tr key={key}><td>{key.replace(/_/g, " ")}</td><td>{String(value ?? "—")}</td></tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
