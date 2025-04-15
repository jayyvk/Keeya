
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, ArrowLeft, Save, Share2, Loader2, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRecording } from "@/contexts/RecordingContext";

interface CloneResultProps {
  audioUrl: string;
  text: string;
  onBack: () => void;
}

const CloneResult: React.FC<CloneResultProps> = ({ audioUrl, text, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { saveRecording } = useRecording();
  
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
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  const handleSaveToVault = async () => {
    setIsSaving(true);
    
    try {
      // In a real implementation, this would call the saveRecording function
      // from the RecordingContext with proper data
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
      // Mock share functionality
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
        <div className="bg-gradient-to-r from-voicevault-softpurple to-voicevault-softpink p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl text-white">Voice Memory</h3>
            <Badge className="bg-white/20 text-white border-none">
              AI-Generated
            </Badge>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={togglePlayback}
              className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            >
              {isPlaying ? (
                <Pause className="text-voicevault-primary h-5 w-5" />
              ) : (
                <Play className="text-voicevault-primary h-5 w-5 ml-1" />
              )}
            </button>
            
            <div className="flex-1 mx-4">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSliderChange}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/70 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={toggleMute}
                className="text-white mr-2"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Content</h4>
            <p className="text-voicevault-tertiary">{text}</p>
          </div>
          
          <div className="flex gap-4">
            <Button 
              className="flex-1"
              onClick={handleSaveToVault}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Vault
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Link...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloneResult;
