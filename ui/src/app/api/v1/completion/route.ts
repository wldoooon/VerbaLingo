import { type NextRequest } from 'next/server';

// The Vercel AI SDK and modern Next.js deployments work best with the edge runtime.
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { prompt: originalPrompt } = await request.json();


    if (!originalPrompt) {
      return new Response('Prompt is required.', { status: 400 });
    }

    const prompt = originalPrompt

    const backendUrl = 'http://127.0.0.1:5002/api/v1/generate';

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        prompt,
        model: 'gemma3:1b', // This can be configured as needed
        stream: true,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} ${errorText}`);
      return new Response(errorText || 'Upstream error', { status: backendResponse.status });
    }

    // The backend now speaks the correct Vercel AI SDK Data Protocol.
    // We can simply pipe its stream directly into a standard web Response.
    // This is the most efficient and robust "dumb proxy" approach.
    // The key is setting the correct 'Content-Type' header.
    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('[COMPLETION_API_ERROR]', error);
    // Check if the error is a FetchError, which can happen if the backend is down.
    if (error instanceof Error && (error as any).cause?.code === 'ECONNREFUSED') {
      return new Response(
        'Could not connect to the backend service. Please ensure it is running.',
        { status: 503 } // 503 Service Unavailable
      );
    }
    return new Response('An internal server error occurred.', { status: 500 });
  }
}
