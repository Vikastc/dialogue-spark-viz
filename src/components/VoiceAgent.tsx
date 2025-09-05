import React, { useState, useCallback, useRef } from "react";
import VoiceIndicator from "./VoiceIndicator";
import VoiceControls from "./VoiceControls";
import ConversationDisplay from "./ConversationDisplay";
import { cn } from "@/lib/utils";
import axios from "axios";
import { RealtimeSession } from "@openai/agents-realtime";
import agent from "@/agents/gf";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
}

const VoiceAgent: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const sessionRef = useRef<RealtimeSession | null>(null);

  const handleStartListening = useCallback(async () => {
    if (!isActive) return;
    try {
      setIsListening(true);

      const response = await axios.get("/api");
      const tempKey: string = response.data?.tempKey;

      const session = new RealtimeSession(agent, {
        model: "gpt-4o-mini-realtime-preview",
      });

      await session.connect({ apiKey: tempKey });
      sessionRef.current = session;

      // Optional: basic event hook to reflect connection
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "agent",
          content: "Connected. How can I help?",
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      setIsListening(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "agent",
          content: `Failed to start: ${err?.message || "Unknown error"}`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isActive]);

  const handleStopListening = useCallback(() => {
    setIsListening(false);
    const s = sessionRef.current;
    if (s) {
      try {
        // Stop agent speech and stop capturing mic
        s.interrupt?.();
        s.mute?.(true);
        s.close?.();
      } catch {}
      sessionRef.current = null;
    }
  }, []);

  const handleToggleActive = useCallback(() => {
    setIsActive((prev) => !prev);
    if (isListening) {
      setIsListening(false);
    }
  }, [isListening]);

  return (
    <div className='min-h-screen dot-matrix relative'>
      {/* Main container */}
      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen p-8'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-2xl font-mono font-bold tracking-wider uppercase mb-2'>
            Voice Agent
          </h1>
          <p className='text-sm font-mono text-muted-foreground tracking-wide'>
            Minimal • Intelligent • Connected
          </p>
        </div>

        {/* Voice interface */}
        <div className='flex flex-col items-center space-y-8 mb-16 relative z-30'>
          <VoiceIndicator
            isListening={isListening}
            isActive={isActive}
            size='lg'
          />

          <VoiceControls
            isListening={isListening}
            isActive={isActive}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onToggleActive={handleToggleActive}
          />

          {/* Status indicator */}
          <div className='text-center'>
            <p className='text-xs font-mono uppercase tracking-widest text-muted-foreground'>
              Status:{" "}
              {isListening
                ? "Listening"
                : isActive
                ? "Ready"
                : "Inactive - Use Reactivate Button"}
            </p>
          </div>
        </div>

        {/* Conversation */}
        <ConversationDisplay
          messages={messages}
          className='flex-1 w-full max-w-4xl'
        />

        {/* Footer */}
        <div className='mt-16 text-center'>
          <p className='text-xs font-mono text-muted-foreground tracking-wide'>
            Powered by Voice Intelligence
          </p>
        </div>
      </div>

      {/* Subtle overlay for inactive state */}
      {!isActive && (
        <div className='absolute inset-0 bg-background/20 z-20 pointer-events-none' />
      )}
    </div>
  );
};

export default VoiceAgent;
