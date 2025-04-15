
import React from "react";
import { Play, Pause, VolumeX, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  volume: number;
  onPlayPause: () => void;
  onTimeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  onVolumeChange: (value: number[]) => void;
  isMobile?: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  isMuted,
  volume,
  onPlayPause,
  onTimeChange,
  onMuteToggle,
  onVolumeChange,
  isMobile = false,
}) => {
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const actualDuration = duration || 100;
  const isReady = duration > 0;

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-center mb-4`}>
      <button
        onClick={onPlayPause}
        className={`rounded-full w-12 h-12 flex items-center justify-center shadow-md ${isReady ? 'bg-white hover:shadow-lg' : 'bg-gray-200'} transition-shadow mb-4 md:mb-0`}
        disabled={!isReady}
      >
        {isPlaying ? (
          <Pause className={`${isReady ? 'text-voicevault-primary' : 'text-gray-400'} h-5 w-5`} />
        ) : (
          <Play className={`${isReady ? 'text-voicevault-primary' : 'text-gray-400'} h-5 w-5 ml-1`} />
        )}
      </button>
      
      <div className={`${isMobile ? 'w-full' : 'flex-1 mx-4'}`}>
        <Slider
          value={[currentTime]}
          max={actualDuration}
          step={0.1}
          onValueChange={onTimeChange}
          className={`cursor-pointer ${!isReady ? 'opacity-50' : ''}`}
          disabled={!isReady}
        />
        <div className="flex justify-between text-xs text-white/70 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className={`flex items-center ${isMobile ? 'w-full justify-end mt-4' : ''}`}>
        <button
          onClick={onMuteToggle}
          className="text-white mr-2"
          disabled={!isReady}
        >
          {isMuted ? (
            <VolumeX className={`h-5 w-5 ${!isReady ? 'opacity-50' : ''}`} />
          ) : (
            <Volume2 className={`h-5 w-5 ${!isReady ? 'opacity-50' : ''}`} />
          )}
        </button>
        <div className={`${isMobile ? 'w-24' : 'w-20'}`}>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={onVolumeChange}
            disabled={!isReady}
            className={!isReady ? 'opacity-50' : ''}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
