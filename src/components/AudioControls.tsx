
import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioLoaded: boolean;
  onTogglePlay: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onSeek: (value: number[]) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  audioLoaded,
  onTogglePlay,
  onSkipBackward,
  onSkipForward,
  onSeek
}) => {
  return (
    <div className="mt-2 space-y-3">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onSkipBackward}
          className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
          aria-label="Skip backward"
          disabled={!audioLoaded}
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={onTogglePlay}
          className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={onSkipForward}
          className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
          aria-label="Skip forward"
          disabled={!audioLoaded}
        >
          <SkipForward size={16} />
        </button>
      </div>
      
      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 0}
        step={0.1}
        onValueChange={onSeek}
      />
    </div>
  );
};
