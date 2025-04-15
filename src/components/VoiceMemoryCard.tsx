
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Clock, Calendar, Tag, Trash2, SkipBack, SkipForward } from "lucide-react";
import { Recording } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { useRecording } from "@/contexts/RecordingContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceMemoryCardProps {
  recording: Recording;
}

const VoiceMemoryCard: React.FC<VoiceMemoryCardProps> = ({ recording }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { deleteRecording } = useRecording();

  useEffect(() => {
    // Create a new audio element
    const audio = new Audio(recording.audioUrl);
    audioRef.current = audio;

    // Add event listeners
    audio.addEventListener('loadeddata', handleAudioLoaded);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleAudioEnd);
    
    // Clean up
    return () => {
      audio.removeEventListener('loadeddata', handleAudioLoaded);
      audio.removeEventListener('error', handleAudioError);
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleAudioEnd);
      
      // Pause and reset audio if unmounting while playing
      if (!audio.paused) {
        audio.pause();
      }
    };
  }, [recording.audioUrl]);

  const handleAudioLoaded = () => {
    setAudioLoaded(true);
    setAudioError(null);
    console.log(`Audio loaded successfully: ${recording.audioUrl}`);
  };

  const handleAudioError = (e: Event) => {
    const error = e.target as HTMLAudioElement;
    setAudioLoaded(false);
    setAudioError(`Error loading audio: ${error.error?.message || 'Unknown error'}`);
    console.error(`Audio load error for ${recording.audioUrl}:`, error.error);
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
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Try to load the audio again if there was an error
      if (audioError) {
        audioRef.current.load();
      }
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("Audio playback started successfully");
          })
          .catch(error => {
            console.error("Playback error:", error);
            toast({
              variant: "destructive",
              title: "Playback Error",
              description: "There was an error playing this recording. Please try again."
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

  const handleDelete = async () => {
    try {
      // Verify password
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: "Please enter the correct password to delete this recording"
        });
        return;
      }

      // Delete the recording
      await deleteRecording(recording.id);
      
      // Reset state
      setIsDeleting(false);
      setPassword("");
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the recording. Please try again."
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-voicevault-softpurple transition-all hover:shadow-lg hover:border-voicevault-primary">
      <div className="bg-gradient-to-r from-voicevault-softpurple to-voicevault-softpink p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-voicevault-tertiary truncate">
            {recording.title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => skipBackward()}
              className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
              aria-label="Skip backward"
              disabled={!audioLoaded}
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={togglePlayback}
              className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={() => skipForward()}
              className="rounded-full p-2 bg-white text-voicevault-primary hover:bg-voicevault-softgray transition-colors"
              aria-label="Skip forward"
              disabled={!audioLoaded}
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <Slider
            value={[currentTime]}
            min={0}
            max={recording.duration || 0}
            step={0.1}
            onValueChange={handleSliderChange}
          />
        </div>

        {audioError && (
          <div className="text-red-500 text-xs mt-2">
            Error loading audio. Please try again.
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{new Date(recording.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{Math.floor(currentTime)}s / {Math.floor(recording.duration)}s</span>
            </div>
          </div>
          
          {recording.tags?.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Tag size={12} className="mr-1" />
                  <span>Tags:</span>
                </div>
                <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Voice Memory</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Please enter your password to confirm deletion.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="mt-4">
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <AlertDialogFooter className="mt-4">
                      <AlertDialogCancel onClick={() => {
                        setIsDeleting(false);
                        setPassword("");
                      }}>
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!password}
                      >
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
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
