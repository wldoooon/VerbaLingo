import { type NextRequest } from "next/server";
import { getBackendBaseUrl, proxyGetToBackend } from "../_backend";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const backendUrl = new URL(`${getBackendBaseUrl()}/api/v1/search`);
  backendUrl.search = request.nextUrl.search;
  return proxyGetToBackend(request, backendUrl.toString());
}
