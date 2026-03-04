import { type NextRequest, NextResponse } from "next/server";
import { proxyJsonToBackend } from "../../_backend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Inform the backend (best effort — for future token blocklisting etc.)
  try {
    await proxyJsonToBackend(request, "/auth/logout");
  } catch {}

  // Explicitly overwrite the cookie with max-age=0 + past expiry.
  // cookies.delete() doesn't always include httpOnly/path — browser ignores it.
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("access_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
