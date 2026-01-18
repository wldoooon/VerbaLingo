import { type NextRequest } from "next/server"
import { proxyJsonToBackend } from "../../_backend"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  return proxyJsonToBackend(request, "/api/v1/auth/me")
}
