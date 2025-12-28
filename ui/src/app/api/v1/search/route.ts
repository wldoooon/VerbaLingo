import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const language = searchParams.get("language");

  const backendUrl = new URL("http://127.0.0.1:5001/api/v1/search");

  if (query) {
    backendUrl.searchParams.append("q", query);
  }
  if (category) {
    backendUrl.searchParams.append("category", category);
  }
  if (language) {
    backendUrl.searchParams.append("language", language);
  }

  try {
    const backendResponse = await fetch(backendUrl.toString(), {});

    if (!backendResponse.ok) {
      return new Response(backendResponse.statusText, {
        status: backendResponse.status,
      });
    }

    const data = await backendResponse.json();

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching from backend:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
