import { GraduationCap } from "lucide-react";

export function AppLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white" }}>
        <GraduationCap size={23} />
      </div>
      <div>
        <strong style={{ display: "block", fontSize: 18 }}>EduManage</strong>
        <span style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>School SaaS</span>
      </div>
    </div>
  );
}
