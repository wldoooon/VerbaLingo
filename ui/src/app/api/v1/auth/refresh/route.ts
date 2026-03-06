import { type NextRequest } from "next/server";
import { proxyJsonToBackend } from "../../_backend";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/refresh
 * Proxy for the backend /auth/refresh endpoint.
 *
 * The browser sends its refresh_token cookie automatically.
 * proxyJsonToBackend forwards it to the backend, and the backend
 * responds with new Set-Cookie headers (new access_token + new refresh_token).
 * proxyJsonToBackend copies those Set-Cookie headers back to the browser.
 */
export async function POST(request: NextRequest) {
  return proxyJsonToBackend(request, "/auth/refresh");
}
