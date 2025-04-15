
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

const CloneResult: React.FC<CloneResultProps> = ({ audioUrl, text, onBack, isMobile = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);
  
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
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
            <Badge className="bg-white/20 text-white border-none text-xs md:text-sm">
              AI-Generated
            </Badge>
          </div>
          
          <AudioControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isMuted={isMuted}
            volume={volume}
            onPlayPause={togglePlayback}
            onTimeChange={handleSliderChange}
            onMuteToggle={toggleMute}
            onVolumeChange={handleVolumeChange}
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
