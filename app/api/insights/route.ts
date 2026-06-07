import { NextResponse } from "next/server";
import { configuredOrNull } from "@/lib/supabase/school-data";

function currency(value: unknown) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

function pct(value: unknown) {
  return `${Math.round(Number(value ?? 0))}%`;
}

export async function GET() {
  const supabase = configuredOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables to load live insights.", metrics: [], signals: [], summary: null });
  }

  try {
    const [metricsResult, risksResult, financeResult, attendanceResult, resultsResult] = await Promise.all([
      supabase.from("v_school_operating_metrics").select("*").limit(1).maybeSingle(),
      supabase.from("v_student_risk_scores").select("*").order("risk_score", { ascending: false }).limit(8),
      supabase.from("v_finance_summary").select("*").limit(1).maybeSingle(),
      supabase.from("v_attendance_daily").select("*").order("attendance_date", { ascending: false }).limit(14),
      supabase.from("v_results_summary").select("*").limit(5),
    ]);
    if (metricsResult.error) throw metricsResult.error;
    if (risksResult.error) throw risksResult.error;
    if (financeResult.error) throw financeResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    if (resultsResult.error) throw resultsResult.error;

    const summary = metricsResult.data;
    if (!summary) {
      return NextResponse.json({ status: "setup_required", message: "Create a school profile to activate live analytics.", metrics: [], signals: [], summary: null, trends: { attendance: [], finance: [] } });
    }

    const collectionRate = Number(summary.total_billed ?? 0) > 0 ? Math.round((Number(summary.total_collected ?? 0) / Number(summary.total_billed ?? 0)) * 100) : 0;
    const healthScore = Math.max(0, Math.min(100, Math.round(
      (Number(summary.attendance_rate ?? 0) || 0) * 0.35 +
      collectionRate * 0.3 +
      (Number(summary.average_result_score ?? 0) || 0) * 0.25 +
      Math.max(0, 100 - Number(summary.high_risk_students ?? 0) * 10) * 0.1
    )));

    const metrics = [
      { label: "Operational Health", value: `${healthScore}%`, change: `${summary.students_count ?? 0} students`, tone: "emerald", detail: "Combined view of attendance, fees, results and student risk." },
      { label: "Revenue Collected", value: currency(summary.total_collected), change: `${collectionRate}% collected`, tone: "blue", detail: `${currency(summary.outstanding_balance)} still outstanding.` },
      { label: "Student Risk", value: String(Number(summary.high_risk_students ?? 0) + Number(summary.medium_risk_students ?? 0)), change: `${summary.high_risk_students ?? 0} high`, tone: "amber", detail: "Students with attendance, fee or academic warning signs." },
      { label: "Attendance", value: pct(summary.attendance_rate), change: `${summary.attendance_records ?? 0} records`, tone: "violet", detail: "Attendance reliability based on submitted registers." },
    ];

    const signals = (risksResult.data ?? []).map((risk) => ({
      title: `${risk.student_name} requires review`,
      severity: risk.risk_level_computed,
      message: `Risk score ${risk.risk_score}. Attendance ${risk.attendance_rate}%, balance ${currency(risk.outstanding_balance)}, average ${risk.average_score}%.`,
      action: risk.risk_level_computed === "High" ? "Schedule immediate intervention" : risk.risk_level_computed === "Medium" ? "Monitor and follow up" : "Maintain normal support",
    }));

    const attendanceTrend = (attendanceResult.data ?? []).reverse().map((row) => {
      const total = Number(row.total_marked ?? 0);
      return total > 0 ? Math.round((Number(row.present_count ?? 0) / total) * 100) : 0;
    });
    const financeTrend = [Number(summary.total_collected ?? 0), Number(summary.total_billed ?? 0), Number(summary.outstanding_balance ?? 0)].map((value) => Math.max(0, Math.round(value / 1000)));

    return NextResponse.json({
      status: "ok",
      generatedAt: new Date().toISOString(),
      summary,
      metrics,
      signals,
      trends: { attendance: attendanceTrend, finance: financeTrend },
      finance: financeResult.data,
      results: resultsResult.data ?? [],
    });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to load insights", metrics: [], signals: [] }, { status: 500 });
  }
}
