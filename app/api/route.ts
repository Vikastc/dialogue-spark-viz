import axios from "axios";
import { REALTIME_MODEL } from "@/lib/realtimeConfig";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userApiKey: string | undefined = body?.apiKey;

    if (!userApiKey || !userApiKey.startsWith("sk-")) {
      return new Response(
        JSON.stringify({ error: "A valid OpenAI API key is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await axios.post(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        expires_after: { anchor: "created_at", seconds: 600 },
        session: {
          type: "realtime",
          model: REALTIME_MODEL,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${userApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return Response.json({ tempKey: response.data.value });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      status === 401
        ? "Invalid OpenAI API key. Please check and try again."
        : error?.message || "Failed to create temp key";
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }
}
