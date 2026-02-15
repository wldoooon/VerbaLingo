import { type NextRequest, NextResponse } from "next/server"
import { getBackendBaseUrl } from "../../_backend"

export const runtime = "nodejs"

/**
 * OAuth Callback Route (Option B)
 *
 * The backend's Google OAuth callback redirects the popup here with
 * a short-lived authorization code. This route:
 *
 * 1. Exchanges the code with the backend for an access token
 * 2. Sets the cookie on the correct domain (localhost:3000)
 * 3. Returns HTML that postMessages success/error to the opener and closes
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // If the backend redirected with an error
  if (error) {
    return buildPopupResponse({ success: false, error })
  }

  if (!code) {
    return buildPopupResponse({ success: false, error: "No authorization code received." })
  }

  try {
    // Exchange the code with the backend
    const backendUrl = `${getBackendBaseUrl()}/auth/exchange-code`
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    if (!backendResponse.ok) {
      const data = await backendResponse.json().catch(() => ({}))
      const detail = data.detail || "Failed to exchange authorization code."
      return buildPopupResponse({ success: false, error: detail })
    }

    const { access_token } = await backendResponse.json()

    // Build response with postMessage HTML
    const response = buildPopupResponse({ success: true })

    // Set the cookie on THIS domain (localhost:3000) — the whole point of Option B
    response.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes, matches backend ACCESS_TOKEN_EXPIRE_MINUTES
      path: "/",
    })

    return response
  } catch (err) {
    console.error("OAuth callback exchange error:", err)
    return buildPopupResponse({ success: false, error: "Authentication failed. Please try again." })
  }
}

/**
 * Returns an HTML page that sends a postMessage to the opener window and closes.
 * Since this page is served from localhost:3000, the origin will match.
 */
function buildPopupResponse(result: { success: boolean; error?: string }): NextResponse {
  const messagePayload = result.success
    ? `{ type: 'oauth-success' }`
    : `{ type: 'oauth-error', error: ${JSON.stringify(result.error || "Unknown error")} }`

  const html = `<!DOCTYPE html>
<html>
<head><title>${result.success ? "Authentication Successful" : "Authentication Failed"}</title></head>
<body>
  <p>${result.success ? "Authentication successful! This window will close automatically." : "Authentication failed. This window will close shortly."}</p>
  <script>
    if (window.opener) {
      window.opener.postMessage(${messagePayload}, window.location.origin);
    }
    ${result.success ? "window.close();" : "setTimeout(() => window.close(), 2000);"}
  </script>
</body>
</html>`

  return new NextResponse(html, {
    status: result.success ? 200 : 400,
    headers: { "Content-Type": "text/html" },
  })
}
