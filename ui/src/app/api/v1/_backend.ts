import { NextResponse } from "next/server"

const DEFAULT_BACKEND_URL = "http://127.0.0.1:5001"

export function getBackendBaseUrl() {
  return process.env.BACKEND_URL || DEFAULT_BACKEND_URL
}

/**
 * Forwards all headers from the backend response to the client.
 * Specifically ensures RateLimit-* headers are preserved.
 */
function copyBackendHeaders(backendResponse: Response, nextResponse: NextResponse) {
  backendResponse.headers.forEach((value, key) => {
    // Skip headers that Next.js might want to control or that are already handled
    if (["content-encoding", "content-length", "set-cookie"].includes(key.toLowerCase())) {
      return
    }
    nextResponse.headers.set(key, value)
  })

  // Special handling for Set-Cookie (can be multiple)
  const anyHeaders = backendResponse.headers as any
  const setCookies: string[] | undefined =
    typeof anyHeaders.getSetCookie === "function" ? anyHeaders.getSetCookie() : undefined

  if (setCookies && setCookies.length) {
    for (const c of setCookies) nextResponse.headers.append("set-cookie", c)
  } else {
    const setCookie = backendResponse.headers.get("set-cookie")
    if (setCookie) nextResponse.headers.set("set-cookie", setCookie)
  }
}

export async function proxyJsonToBackend(request: Request, backendPath: string) {
  const backendUrl = `${getBackendBaseUrl()}${backendPath}`

  const cookie = request.headers.get("cookie")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (cookie) headers.Cookie = cookie

  const body = await request.text()

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: body || undefined,
  })

  const responseText = await backendResponse.text()

  const nextResponse = new NextResponse(responseText, {
    status: backendResponse.status,
  })

  copyBackendHeaders(backendResponse, nextResponse)

  return nextResponse
}

export async function proxyGetToBackend(request: Request, backendUrl: string) {
  const cookie = request.headers.get("cookie")
  const headers: Record<string, string> = {}
  if (cookie) headers.Cookie = cookie

  const backendResponse = await fetch(backendUrl, { headers })
  const responseText = await backendResponse.text()

  const nextResponse = new NextResponse(responseText, {
    status: backendResponse.status,
  })

  copyBackendHeaders(backendResponse, nextResponse)

  return nextResponse
}