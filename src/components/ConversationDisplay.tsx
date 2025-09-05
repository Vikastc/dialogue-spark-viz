import React from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface ConversationDisplayProps {
  messages: Message[];
  className?: string;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ 
  messages, 
  className 
}) => {
  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {messages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm font-mono">
            Start a conversation...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'fade-in p-4 rounded border',
                'font-mono text-sm leading-relaxed',
                message.type === 'user'
                  ? 'bg-secondary text-secondary-foreground ml-8'
                  : 'bg-card text-card-foreground mr-8'
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {message.type === 'user' ? 'You' : 'Agent'}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationDisplay;