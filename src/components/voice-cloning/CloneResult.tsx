import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AudioControls from "./audio/AudioControls";
import ActionButtons from "./audio/ActionButtons";

interface CloneResultProps {
  audioUrl: string;
  text: string;
  onBack: () => void;
  isMobile?: boolean;
}

const CloneResult: React.FC<CloneResultProps> = ({ 
  audioUrl, 
  text, 
  onBack, 
  isMobile = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log(`Initializing audio for CloneResult: ${audioUrl}`);
    const audio = new Audio();
    
    // Set important properties before loading
    audio.crossOrigin = "anonymous"; 
    audio.preload = "metadata";
    
    const handleLoadedMetadata = () => {
      console.log(`Metadata loaded. Duration: ${audio.duration}s`);
      setDuration(audio.duration);
      setAudioLoaded(true);
      setAudioError(null);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = (e: Event) => {
      console.error("Audio error in CloneResult:", e);
      setAudioLoaded(false);
      setAudioError("Error loading audio. The file may be corrupted or in an unsupported format.");
      
      // Check URL validity
      fetch(audioUrl, { method: 'HEAD' })
        .then(response => {
          console.log(`URL check: ${response.status} ${response.statusText}`);
          if (!response.ok) {
            setAudioError(`Audio file not accessible (${response.status})`);
          }
        })
        .catch(err => {
          console.error("URL fetch error:", err);
          setAudioError(`Cannot access audio file: ${err.message}`);
        });
    };
    
    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplaythrough", () => {
      console.log("Audio can play through without buffering");
      setAudioLoaded(true);
    });
    
    // Set the source last
    audio.src = audioUrl;
    audio.playbackRate = playbackSpeed;
    
    try {
      audio.load();
      console.log("Audio load initiated");
    } catch (err) {
      console.error("Error loading audio:", err);
    }
    
    audioRef.current = audio;
    
    return () => {
      console.log("Cleaning up audio element");
      if (!audio.paused) {
        audio.pause();
      }
      
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplaythrough", () => {});
      
      audioRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlayback = () => {
    if (!audioRef.current) {
      console.error("No audio element available");
      return;
    }
    
    console.log(`Toggle playback. Current state: ${isPlaying ? 'Playing' : 'Paused'}`);
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Try to reload if there was an error
      if (audioError) {
        console.log("Reloading audio after error");
        audioRef.current.load();
      }
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio playback started successfully");
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Playback error:", error);
            toast({
              variant: "destructive",
              title: "Playback Error",
              description: "Unable to play this audio. It may be in an unsupported format for your browser."
            });
          });
      }
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuteState = !isMuted;
    audioRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleSaveToVault = async () => {
    setIsSaving(true);
    try {
      setTimeout(() => {
        toast({
          title: "Saved to Vault",
          description: "Your voice memory has been saved to your vault.",
        });
        setIsSaving(false);
      }, 1500);
    } catch (error) {
      console.error("Error saving to vault:", error);
      toast({
        title: "Save failed",
        description: "Unable to save to vault. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    setIsSharing(true);
    try {
      setTimeout(() => {
        toast({
          title: "Share Link Created",
          description: "Voice memory link copied to clipboard.",
        });
        setIsSharing(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to create share link. Please try again.",
        variant: "destructive",
      });
      setIsSharing(false);
    }
  };

  const handleSpeedChange = (value: string) => {
    if (value) {
      setPlaybackSpeed(parseFloat(value));
    }
  };

  return (
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Editor
      </Button>
      
      <Card className="overflow-hidden border-voicevault-softpurple">
        <div className="bg-gradient-to-r from-voicevault-softpurple to-voicevault-softpink p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg md:text-xl text-white">Voice Memory</h3>
          </div>
          
          {audioError && (
            <div className="text-white bg-red-500/20 p-2 rounded mb-4 text-sm">
              {audioError}
            </div>
          )}
          
          <AudioControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isMuted={isMuted}
            volume={volume}
            playbackSpeed={playbackSpeed}
            onPlayPause={togglePlayback}
            onTimeChange={handleSliderChange}
            onMuteToggle={toggleMute}
            onVolumeChange={handleVolumeChange}
            onSpeedChange={handleSpeedChange}
            isMobile={isMobile}
          />
        </div>
        
        <CardContent className="p-4 md:p-6">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Content</h4>
            <p className="text-voicevault-tertiary text-sm md:text-base">{text}</p>
          </div>
          
          <ActionButtons
            isSaving={isSaving}
            isSharing={isSharing}
            onSave={handleSaveToVault}
            onShare={handleShare}
            isMobile={isMobile}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CloneResult;
