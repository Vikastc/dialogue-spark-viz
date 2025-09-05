import React, { useState, useCallback } from 'react';
import VoiceIndicator from './VoiceIndicator';
import VoiceControls from './VoiceControls';
import ConversationDisplay from './ConversationDisplay';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const VoiceAgent: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleStartListening = useCallback(() => {
    if (!isActive) return;
    setIsListening(true);
    
    // Demo: Add a user message after a delay
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'Hello, can you hear me?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Demo: Add agent response
      setTimeout(() => {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: 'Yes, I can hear you clearly. How can I assist you today?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentMessage]);
      }, 1000);
    }, 2000);
  }, [isActive]);

  const handleStopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const handleToggleActive = useCallback(() => {
    setIsActive(prev => !prev);
    if (isListening) {
      setIsListening(false);
    }
  }, [isListening]);

  return (
    <div className="min-h-screen dot-matrix relative">
      {/* Main container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-2xl font-mono font-bold tracking-wider uppercase mb-2">
            Voice Agent
          </h1>
          <p className="text-sm font-mono text-muted-foreground tracking-wide">
            Minimal • Intelligent • Connected
          </p>
        </div>

        {/* Voice interface */}
        <div className="flex flex-col items-center space-y-8 mb-16 relative z-30">
          <VoiceIndicator 
            isListening={isListening}
            isActive={isActive}
            size="lg"
          />
          
          <VoiceControls
            isListening={isListening}
            isActive={isActive}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onToggleActive={handleToggleActive}
          />
          
          {/* Status indicator */}
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Status: {isListening ? 'Listening' : isActive ? 'Ready' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* Conversation */}
        <ConversationDisplay 
          messages={messages}
          className="flex-1 w-full max-w-4xl"
        />
        
        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs font-mono text-muted-foreground tracking-wide">
            Powered by Voice Intelligence
          </p>
        </div>
      </div>
      
      {/* Overlay for inactive state - doesn't cover controls */}
      {!isActive && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-none">
            <p className="text-lg font-mono font-semibold mb-2">Agent Inactive</p>
            <p className="text-sm font-mono text-muted-foreground">
              Use controls above to reactivate
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;