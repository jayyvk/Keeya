
import React, { useEffect, useRef } from "react";
import { RecordingStatus } from "@/types";

interface AudioWaveformProps {
  status: RecordingStatus;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ status }) => {
  const isActive = status === "recording";
  const barsCount = 30;

  return (
    <div className="flex items-center justify-center h-24 gap-1 my-4">
      {Array.from({ length: barsCount }).map((_, index) => {
        // Height variation logic for bars
        const height = isActive 
          ? Math.max(20, Math.random() * 60) 
          : 20 + (Math.sin(index * 0.4) * 10);
        
        // Animation delay logic for bars
        const delay = `${index * 0.05}s`;
        
        return (
          <div
            key={index}
            className={`bg-voicevault-primary rounded-full w-1.5 ${isActive ? 'animate-wave' : ''}`}
            style={{
              height: `${height}px`,
              animationDelay: delay,
              opacity: isActive ? 1 : 0.5,
              animationDuration: `${0.7 + Math.random() * 0.6}s`
            }}
          />
        );
      })}
    </div>
  );
};

export default AudioWaveform;
