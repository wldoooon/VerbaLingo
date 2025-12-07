import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Forward the request to your Ollama FastAPI server
    const response = await fetch('http://localhost:5002/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`FastAPI server responded with status: ${response.status}`);
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API route error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to communicate with AI server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
