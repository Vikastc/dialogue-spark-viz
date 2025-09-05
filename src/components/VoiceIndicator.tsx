import React from 'react';
import { cn } from '@/lib/utils';

interface VoiceIndicatorProps {
  isListening: boolean;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24', 
  lg: 'w-32 h-32'
};

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ 
  isListening, 
  isActive, 
  size = 'lg',
  className 
}) => {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Main voice circle */}
      <div 
        className={cn(
          sizeMap[size],
          'rounded-full border-2 transition-all duration-300 relative overflow-hidden',
          isListening 
            ? 'border-voice-active bg-voice-active/10 voice-listening' 
            : isActive 
              ? 'border-voice-active bg-voice-active/5 voice-pulse'
              : 'border-voice-inactive bg-voice-inactive/5'
        )}
      >
        {/* Inner dot */}
        <div 
          className={cn(
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
            'w-2 h-2 rounded-full transition-all duration-300',
            isListening 
              ? 'bg-voice-active scale-125' 
              : isActive 
                ? 'bg-voice-active' 
                : 'bg-voice-inactive'
          )}
        />
        
        {/* Animated rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full border border-voice-active/40 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-voice-active/30 animate-ping animation-delay-150" />
          </>
        )}
      </div>
      
      {/* Outer glow effect */}
      {(isListening || isActive) && (
        <div 
          className={cn(
            'absolute inset-0 rounded-full',
            sizeMap[size],
            'bg-voice-active/5 blur-xl',
            isListening ? 'animate-pulse' : ''
          )}
        />
      )}
    </div>
  );
};

export default VoiceIndicator;