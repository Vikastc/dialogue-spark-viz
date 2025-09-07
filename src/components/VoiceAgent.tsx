"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import VoiceIndicator from "./VoiceIndicator";
import VoiceControls from "./VoiceControls";
import ConversationDisplay from "./ConversationDisplay";
import LoginModal from "./LoginModal";
import UsageLimitModal from "./UsageLimitModal";
import AdminPanel from "./AdminPanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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

const TOKEN_LIMIT = 500; // Token limit for the session

const VoiceAgent: React.FC = () => {
  const {
    isAuthenticated,
    login,
    hasReachedLimit,
    incrementUsage,
    usageCount,
    startSession,
    sessionStartTime,
    isSessionExpired,
    clearAllData,
    isTrialExpired,
    logout,
    revokeUser,
  } = useAuth();

  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUsageLimitModal, setShowUsageLimitModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  const sessionRef = useRef<RealtimeSession | null>(null);

  // Check if user should be blocked
  const shouldBlockUser = useCallback(() => {
    if (!isAuthenticated) return false;
    if (isTrialExpired) return true;
    if (hasReachedLimit) return true;
    if (isSessionExpired) return true;
    if (tokenCount >= TOKEN_LIMIT) return true;
    return false;
  }, [
    isAuthenticated,
    isTrialExpired,
    hasReachedLimit,
    isSessionExpired,
    tokenCount,
  ]);

  // Show limit modal if user should be blocked
  useEffect(() => {
    if (shouldBlockUser() && !showUsageLimitModal) {
      setShowUsageLimitModal(true);
      if (isListening) {
        handleStopListening();
      }
    }
  }, [shouldBlockUser, showUsageLimitModal, isListening]);

  const handleStopListening = useCallback(() => {
    setIsListening(false);

    // Stop the session
    const s = sessionRef.current;
    if (s) {
      try {
        s.interrupt?.();
        s.mute?.(true);
        s.close?.();
        sessionRef.current = null;
      } catch (error) {
        console.error("Error stopping session:", error);
      }
    }

    // Stop microphone stream
    if (micStream) {
      micStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMicStream(null);
    }

    // Force stop any active audio tracks
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        })
        .catch(() => {
          // Ignore errors - this is just to ensure mic is off
        });
    }
  }, [micStream]);

  // Force stop microphone globally
  const forceStopMicrophone = useCallback(() => {
    // Stop all audio tracks
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
            console.log("Audio track stopped");
          });
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, []);

  // Handle token limit reached
  const handleTokenLimitReached = useCallback(() => {
    console.log(`🛑 TOKEN LIMIT REACHED:`);
    console.log(`   Final token count: ${tokenCount}/${TOKEN_LIMIT}`);
    console.log(`   Stopping agent and logging out user...`);
    handleStopListening();
    forceStopMicrophone();
    if (!showUsageLimitModal) {
      setShowUsageLimitModal(true);
    }
  }, [
    handleStopListening,
    forceStopMicrophone,
    showUsageLimitModal,
    tokenCount,
  ]);

  // Real-time session expiry check - runs every second
  useEffect(() => {
    if (!sessionStarted || !isListening) return;

    const interval = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Date.now() - sessionStartTime;
        const isExpired = elapsed > 60 * 1000; // 1 minute

        if (isExpired) {
          console.log(`⏰ SESSION EXPIRED:`);
          console.log(`   Session duration: 1 minute reached`);
          console.log(`   Final token count: ${tokenCount}/${TOKEN_LIMIT}`);
          console.log(`   Stopping agent and logging out user...`);
          handleStopListening();
          forceStopMicrophone(); // Force stop microphone
          if (!showUsageLimitModal) {
            setShowUsageLimitModal(true);
          }
          clearInterval(interval);
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [
    sessionStarted,
    isListening,
    sessionStartTime,
    handleStopListening,
    showUsageLimitModal,
    forceStopMicrophone,
  ]);

  // Monitor token count and stop when limit reached
  useEffect(() => {
    if (tokenCount >= TOKEN_LIMIT && isListening) {
      handleTokenLimitReached();
    }
  }, [tokenCount, isListening, handleTokenLimitReached]);

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      if (micStream) {
        micStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [micStream]);

  const handleStartListening = useCallback(async () => {
    if (!isActive) return;

    // Check authentication
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Check if user should be blocked
    if (shouldBlockUser()) {
      setShowUsageLimitModal(true);
      return;
    }

    try {
      setIsListening(true);

      // Start session only once when Talk is first clicked
      if (!sessionStarted) {
        startSession();
        setSessionStarted(true);
        setTokenCount(0); // Reset token count for new session
        console.log(`🚀 SESSION STARTED:`);
        console.log(`   Token limit: ${TOKEN_LIMIT}`);
        console.log(`   Usage limit: 3 interactions`);
        console.log(`   Session duration: 1 minute`);
        console.log(`   Current token count: 0/${TOKEN_LIMIT}`);
      }

      const response = await axios.get("/api");
      const tempKey: string = response.data?.tempKey;

      const session = new RealtimeSession(agent, {
        model: "gpt-4o-mini-realtime-preview",
      });

      await session.connect({ apiKey: tempKey });
      sessionRef.current = session;

      // Set up event listeners to track user messages and tokens
      session.on(
        "conversation.item.input_audio_transcription.completed" as any,
        () => {
          incrementUsage();
        }
      );

      // Track token usage
      session.on("conversation.item.created" as any, (item: any) => {
        if (item.type === "message" && item.role === "assistant") {
          // Estimate tokens based on message length (rough approximation)
          const estimatedTokens = Math.ceil(item.content?.length / 4) || 0;
          setTokenCount((prev) => {
            const newCount = prev + estimatedTokens;
            console.log(`🤖 AGENT RESPONSE TOKENS:`);
            console.log(
              `   Content: "${item.content?.substring(0, 100)}${
                item.content?.length > 100 ? "..." : ""
              }"`
            );
            console.log(`   Length: ${item.content?.length} characters`);
            console.log(`   Estimated tokens: ${estimatedTokens}`);
            console.log(`   Previous count: ${prev}`);
            console.log(
              `   New total: ${newCount}/${TOKEN_LIMIT} (${(
                (newCount / TOKEN_LIMIT) *
                100
              ).toFixed(1)}%)`
            );
            console.log(`   Remaining: ${TOKEN_LIMIT - newCount} tokens`);
            return newCount;
          });
        }
      });

      // Track input tokens from user messages
      session.on(
        "conversation.item.input_audio_transcription.completed" as any,
        (item: any) => {
          if (item.transcript) {
            const estimatedTokens = Math.ceil(item.transcript.length / 4);
            setTokenCount((prev) => {
              const newCount = prev + estimatedTokens;
              console.log(`🎤 USER INPUT TOKENS:`);
              console.log(`   Transcript: "${item.transcript}"`);
              console.log(`   Length: ${item.transcript.length} characters`);
              console.log(`   Estimated tokens: ${estimatedTokens}`);
              console.log(`   Previous count: ${prev}`);
              console.log(
                `   New total: ${newCount}/${TOKEN_LIMIT} (${(
                  (newCount / TOKEN_LIMIT) *
                  100
                ).toFixed(1)}%)`
              );
              console.log(`   Remaining: ${TOKEN_LIMIT - newCount} tokens`);
              return newCount;
            });
          }
        }
      );

      // Add connection message
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
  }, [
    isActive,
    isAuthenticated,
    shouldBlockUser,
    sessionStarted,
    startSession,
    incrementUsage,
  ]);

  const handleToggleActive = useCallback(() => {
    setIsActive((prev) => !prev);
    if (isListening) {
      setIsListening(false);
    }
  }, [isListening]);

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    const success = await login(email, password);
    if (success) {
      setShowLoginModal(false);
      setSessionStarted(false); // Reset session started flag
      setTokenCount(0); // Reset token count
    }
    return success;
  };

  const handleModalClose = useCallback(() => {
    setShowUsageLimitModal(false);
    logout();
    router.push("/");
  }, [logout, router]);

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!sessionStartTime) return 0;
    const elapsed = Date.now() - sessionStartTime;
    const remaining = 60 * 1000 - elapsed; // 1 minute in milliseconds
    return Math.max(0, Math.ceil(remaining / 1000));
  };

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
          {isAuthenticated && (
            <div className='text-xs font-mono text-muted-foreground mt-2 space-y-1'>
              <p>Usage: {usageCount}/3 interactions</p>
              <p>
                Tokens: {tokenCount}/{TOKEN_LIMIT}
              </p>
              {sessionStarted && <p>Time remaining: {getRemainingTime()}s</p>}
              {isSessionExpired && " • Session expired"}
              {isTrialExpired && " • Trial expired"}
              {tokenCount >= TOKEN_LIMIT && " • Token limit reached"}
            </div>
          )}
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
        <div className='mt-16 text-center space-y-2'>
          <p className='text-xs font-mono text-muted-foreground tracking-wide'>
            Powered by Voice Intelligence
          </p>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowAdminPanel(true)}
            className='text-xs text-muted-foreground hover:text-foreground'
          >
            Admin Panel
          </Button>
        </div>
      </div>

      {/* Subtle overlay for inactive state */}
      {!isActive && (
        <div className='absolute inset-0 bg-background/20 z-20 pointer-events-none' />
      )}

      {/* Modals */}
      <LoginModal isOpen={showLoginModal} onLogin={handleLogin} />

      <UsageLimitModal
        isOpen={showUsageLimitModal}
        onClose={handleModalClose}
      />

      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        onClearData={clearAllData}
        onRevokeUser={revokeUser}
      />
    </div>
  );
};

export default VoiceAgent;
