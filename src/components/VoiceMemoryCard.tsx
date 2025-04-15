
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Clock, Calendar, Tag } from "lucide-react";
import { Recording } from "@/types";
import { Badge } from "@/components/ui/badge";

interface VoiceMemoryCardProps {
  recording: Recording;
}

const VoiceMemoryCard: React.FC<VoiceMemoryCardProps> = ({ recording }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format duration (seconds) to MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Toggle audio playback
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle audio end event
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-voicevault-softpurple transition-all hover:shadow-lg hover:border-voicevault-primary">
      <audio 
        ref={audioRef}
        src={recording.audioUrl}
        onEnded={handleAudioEnd}
        className="hidden"
      />
      
      {/* Cassette-style design with play button */}
      <div className="bg-gradient-to-r from-voicevault-softpurple to-voicevault-softpink p-4 flex justify-between items-center">
        <h3 className="font-semibold text-lg text-voicevault-tertiary truncate">
          {recording.title}
        </h3>
        <button
          onClick={togglePlayback}
          className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
      
      {/* Recording details */}
      <div className="p-4">
        <div className="flex flex-col space-y-2">
          {/* Date and duration */}
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(recording.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{formatDuration(recording.duration)}</span>
            </div>
          </div>
          
          {/* Tags */}
          {recording.tags.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Tag size={12} className="mr-1" />
                <span>Tags:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recording.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="text-xs bg-voicevault-softgray text-voicevault-secondary"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMemoryCard;
