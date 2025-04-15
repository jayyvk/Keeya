
import React, { useState } from "react";
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-center mb-4`}>
      <button
        onClick={onPlayPause}
        className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow mb-4 md:mb-0"
      >
        {isPlaying ? (
          <Pause className="text-voicevault-primary h-5 w-5" />
        ) : (
          <Play className="text-voicevault-primary h-5 w-5 ml-1" />
        )}
      </button>
      
      <div className={`${isMobile ? 'w-full' : 'flex-1 mx-4'}`}>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={onTimeChange}
          className="cursor-pointer"
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
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
        <div className={`${isMobile ? 'w-24' : 'w-20'}`}>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={onVolumeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
