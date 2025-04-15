import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioPlayerProps {
  title: string;
  audioUrl: string;
  duration: number;
  recordingId: string;
}

const AudioPlayer = ({ title, audioUrl, duration, recordingId }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElement.preload = "metadata";
    
    const updateDuration = () => {
      if (duration === 0 && audioElement.duration) {
        Promise.resolve(
          supabase
            .from('voice_memories')
            .update({ duration: audioElement.duration })
            .eq('id', recordingId)
        ).then(() => {
          console.log('Duration updated in database');
        }).catch((err) => {
          console.error('Error updating duration:', err);
        });
      }
    };
    
    audioElement.addEventListener('loadeddata', handleAudioLoaded);
    audioElement.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
      updateDuration();
    });
    audioElement.addEventListener('error', handleAudioError);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleAudioEnd);
    
    audioRef.current = audioElement;
    audioElement.src = audioUrl;
    
    try {
      audioElement.load();
    } catch (err) {
      console.error("Error loading audio:", err);
    }
    
    return () => {
      audioElement.removeEventListener('loadeddata', handleAudioLoaded);
      audioElement.removeEventListener('canplaythrough', () => {});
      audioElement.removeEventListener('error', handleAudioError);
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('ended', handleAudioEnd);
      
      if (!audioElement.paused) {
        audioElement.pause();
      }
      
      audioRef.current = null;
    };
  }, [recordingId, title, audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleAudioLoaded = () => {
    setAudioLoaded(true);
    setAudioError(null);
  };

  const handleAudioError = (e: Event) => {
    const target = e.target as HTMLAudioElement;
    setAudioLoaded(false);
    
    let errorMessage = "Unknown error";
    if (target && target.error) {
      switch(target.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Playback aborted";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Format not supported";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio format not supported by browser";
          break;
        default:
          errorMessage = `Error code: ${target.error.code}`;
      }
    }
    
    setAudioError(`Error: ${errorMessage}`);
  };

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) {
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "Audio player not initialized. Please refresh the page."
      });
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioError) {
        audioRef.current.load();
      }
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            toast({
              variant: "destructive",
              title: "Playback Error",
              description: "There was an error playing this recording."
            });
          });
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={skipBackward}
            className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
            aria-label="Skip backward"
            disabled={!audioLoaded}
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={togglePlayback}
            className={`rounded-full p-2 ${!audioLoaded && !audioError ? 'bg-gray-200 text-gray-400' : 'bg-white text-voicevault-primary hover:bg-voicevault-softgray'} transition-colors`}
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={!audioLoaded && !audioError}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={skipForward}
            className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
            aria-label="Skip forward"
            disabled={!audioLoaded}
          >
            <SkipForward size={16} />
          </button>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>

      <div>
        <ToggleGroup 
          type="single" 
          value={playbackSpeed.toString()}
          onValueChange={(value) => value && setPlaybackSpeed(parseFloat(value))}
          className="bg-white/10 rounded-lg p-1 mb-2"
        >
          {[0.5, 1, 1.5, 2].map((speed) => (
            <ToggleGroupItem 
              key={speed} 
              value={speed.toString()}
              aria-label={`${speed}x speed`}
              className="px-2 py-1 text-xs data-[state=on]:bg-white/20 text-white"
            >
              {speed}x
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 0}
          step={0.1}
          onValueChange={handleSliderChange}
          disabled={!audioLoaded}
        />
      </div>

      {audioError && (
        <div className="text-red-500 text-xs mt-2 p-1 bg-red-50 rounded">
          {audioError}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
