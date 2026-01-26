import { type NextRequest } from "next/server";
import { proxyJsonToBackend } from "../../_backend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return proxyJsonToBackend(request, "/auth/verify-otp");
}
