import { NextResponse, type NextRequest } from "next/server";
import { getAppSession, type AppSession } from "@/lib/auth/session";
import { can, type Permission, type UserRole } from "@/lib/rbac";

/**
 * Authorization boundary for route handlers.
 *
 * Route handlers are reachable directly over HTTP and are not covered by the
 * redirects in proxy.ts, so each one must authorise on its own. Wrapping them
 * here keeps that decision in a single reviewed place instead of relying on
 * every new handler remembering to repeat the checks.
 */

export type AuthedContext = {
  session: AppSession;
  user: NonNullable<AppSession["user"]>;
  organizationId: string;
  role: UserRole;
};

type Handler<TParams> = (
  request: NextRequest,
  context: AuthedContext,
  params: TParams,
) => Promise<Response> | Response;

function problem(status: number, code: string, message: string) {
  return NextResponse.json({ status: "error", code, message }, { status });
}

/**
 * Requires an authenticated session carrying the given permission.
 *
 * Failure responses stay deliberately vague: they confirm that access was
 * refused without revealing whether the record exists or which condition
 * failed.
 */
export function withAuth<TParams = unknown>(permission: Permission, handler: Handler<TParams>) {
  return async (request: NextRequest, params: TParams): Promise<Response> => {
    const session = await getAppSession();

    if (!session.authenticated || !session.user) {
      return problem(401, "unauthenticated", "Sign in to continue.");
    }

    if (!can(session.user.role, permission)) {
      return problem(403, "forbidden", "Your role does not allow this action.");
    }

    // Every tenant-scoped query derives its organisation from here. Without a
    // membership there is no tenant to scope to, so the request cannot proceed.
    const organizationId = session.user.organizationId;
    if (!organizationId) {
      return problem(403, "no_organization", "Your account is not linked to a school workspace.");
    }

    return handler(request, { session, user: session.user, organizationId, role: session.user.role }, params);
  };
}

/**
 * For handlers that need a signed-in user but no specific permission, such as
 * reading your own profile.
 */
export function withSession<TParams = unknown>(handler: Handler<TParams>) {
  return async (request: NextRequest, params: TParams): Promise<Response> => {
    const session = await getAppSession();

    if (!session.authenticated || !session.user) {
      return problem(401, "unauthenticated", "Sign in to continue.");
    }

    return handler(request, {
      session,
      user: session.user,
      organizationId: session.user.organizationId ?? "",
      role: session.user.role,
    }, params);
  };
}
