import { NextResponse } from "next/server";
import { permissionsByRole, roleExperiences, roleLabels } from "@/lib/rbac";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mode: "demo-auth-architecture",
    generatedAt: new Date().toISOString(),
    roles: roleExperiences.map((experience) => ({
      role: experience.role,
      label: roleLabels[experience.role],
      workspace: experience.workspace,
      headline: experience.headline,
      permissions: permissionsByRole[experience.role],
    })),
  });
}
