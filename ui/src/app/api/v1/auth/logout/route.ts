import { type NextRequest, NextResponse } from "next/server";
import { proxyJsonToBackend } from "../../_backend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Inform the backend (best effort — for future token blocklisting etc.)
  try {
    await proxyJsonToBackend(request, "/auth/logout");
  } catch {}

  // Explicitly overwrite both cookies with max-age=0 + past expiry.
  // cookies.delete() doesn't always include httpOnly/path — browser ignores it.
  const response = NextResponse.json({ message: "Logged out" });
  const cookieOptions = {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
  response.cookies.set("access_token", "", cookieOptions);
  response.cookies.set("refresh_token", "", cookieOptions);

  return response;
}
