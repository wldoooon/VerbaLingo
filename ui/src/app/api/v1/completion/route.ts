import { type NextRequest } from "next/server";

// The Vercel AI SDK and modern Next.js deployments work best with the edge runtime.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response("Prompt is required.", { status: 400 });
    }

    const backendUrl = "http://127.0.0.1:5001/api/v1/completion";

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    if (!backendResponse.ok) {
      console.error(`Backend error status: ${backendResponse.status}`);
      const text = await backendResponse.text();
      console.error(`Backend error body: ${text}`);
      return new Response(text || "Upstream error", {
        status: backendResponse.status,
      });
    }

    if (!backendResponse.body) {
      return new Response("No body from backend", { status: 500 });
    }

    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[COMPLETION_API_ERROR]", error);
    if (
      error instanceof Error &&
      (error as any).cause?.code === "ECONNREFUSED"
    ) {
      return new Response(
        "Could not connect to the backend service (FastAPI). Please ensure it is running.",
        { status: 503 }
      );
    }
    return new Response("An internal server error occurred.", { status: 500 });
  }
}
