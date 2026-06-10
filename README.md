# Dialogue Spark Viz

AI voice agent built with Next.js, React, shadcn-ui, Tailwind CSS, and the OpenAI Realtime Agents SDK.

## Local Development

1. Install dependencies:

```sh
npm install
```

2. Create a local environment file:

```sh
cp .env.example .env.local
```

3. Add your OpenAI API key to `.env.local`:

```txt
OPENAI_API_KEY=your_openai_api_key
```

4. Start the dev server:

```sh
npm run dev
```

The app runs locally at `http://localhost:8080`.

## Vercel Deployment

This project should be deployed as a Next.js application.

Use these Vercel project settings:

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty/default
- Root Directory: project root

Add this environment variable in Vercel under `Project -> Settings -> Environment Variables`:

```txt
OPENAI_API_KEY=your_openai_api_key
```

Use the exact variable name `OPENAI_API_KEY`. Do not expose it with a `NEXT_PUBLIC_` prefix.

After changing environment variables or build settings, redeploy the latest production deployment.

## Important Files

- `app/page.tsx`: renders the voice agent page.
- `app/api/route.ts`: creates short-lived OpenAI realtime client secrets on the server.
- `src/components/VoiceAgent.tsx`: browser voice-session UI and realtime session connection.
- `src/contexts/AuthContext.tsx`: local demo authentication and usage limits.
