import React from "react";
import { RecordingStatus } from "@/types";
interface AudioWaveformProps {
  status: RecordingStatus;
}
const AudioWaveform: React.FC<AudioWaveformProps> = ({
  status
}) => {
  const isActive = status === "recording";
  const barsCount = 30;
  return <div className="flex items-center justify-center h-24 gap-0.5 my-0">
      {Array.from({
      length: barsCount
    }).map((_, index) => {
      const height = isActive ? Math.max(15, Math.random() * 45) : 15 + Math.sin(index * 0.4) * 8;
      const delay = `${index * 0.05}s`;
      return <div key={index} className={`bg-voicevault-primary/80 rounded-full w-1 ${isActive ? 'animate-wave' : ''}`} style={{
        height: `${height}px`,
        animationDelay: delay,
        opacity: isActive ? 0.8 : 0.4,
        animationDuration: `${0.7 + Math.random() * 0.6}s`
      }} />;
    })}
    </div>;
};
export default AudioWaveform;