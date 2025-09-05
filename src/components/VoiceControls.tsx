import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  isListening: boolean;
  isActive: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleActive: () => void;
  className?: string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isActive,
  onStartListening,
  onStopListening,
  onToggleActive,
  className
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Main voice button */}
      <Button
        variant={isListening ? "destructive" : isActive ? "default" : "outline"}
        size="lg"
        onClick={isListening ? onStopListening : onStartListening}
        className={cn(
          'nothing-button h-12 px-6',
          'transition-all duration-200',
          isListening && 'animate-pulse',
          !isActive && 'bg-background border-2 opacity-50'
        )}
        disabled={!isActive}
      >
        {isListening ? (
          <>
            <Square className="w-4 h-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Talk
          </>
        )}
      </Button>
      
      {/* Toggle active state - now matches talk button */}
      <Button
        variant={!isActive ? "default" : "outline"}
        size="lg"
        onClick={onToggleActive}
        className={cn(
          'nothing-button h-12 px-6',
          'transition-all duration-200'
        )}
      >
        {isActive ? (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Active
          </>
        ) : (
          <>
            <MicOff className="w-4 h-4 mr-2" />
            Reactivate
          </>
        )}
      </Button>
    </div>
  );
};

export default VoiceControls;