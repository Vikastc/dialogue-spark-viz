import axios from "axios";

export async function GET() {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        expires_after: { anchor: "created_at", seconds: 600 },
        session: {
          type: "realtime",
          model: "gpt-4o-mini-realtime-preview",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return Response.json({ tempKey: response.data.value });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Failed to create temp key" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
