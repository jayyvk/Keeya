
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

  // Directly create an audio element that will be visible for debugging
  useEffect(() => {
    // Create a new audio element for each recording
    const audioElement = new Audio();
    audioElement.crossOrigin = "anonymous"; // Important for CORS issues
    audioElement.src = recording.audioUrl;
    audioElement.preload = "auto"; // Ensure audio preloads
    
    // Add debug attributes
    audioElement.id = `audio-${recording.id}`;
    audioElement.controls = false; // We're using custom controls
    
    // Set up event listeners
    audioElement.addEventListener('loadeddata', handleAudioLoaded);
    audioElement.addEventListener('error', handleAudioError);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleAudioEnd);
    audioElement.addEventListener('canplaythrough', () => {
      console.log(`Audio can play through: ${recording.audioUrl}`);
      setAudioLoaded(true);
    });
    
    // Save reference
    audioRef.current = audioElement;
    
    // Load the audio
    audioElement.load();
    
    console.log(`Created audio element for ${recording.title} with URL: ${recording.audioUrl}`);
    
    // Clean up
    return () => {
      audioElement.removeEventListener('loadeddata', handleAudioLoaded);
      audioElement.removeEventListener('error', handleAudioError);
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('ended', handleAudioEnd);
      audioElement.removeEventListener('canplaythrough', () => {});
      
      // Pause and reset audio if unmounting while playing
      if (!audioElement.paused) {
        audioElement.pause();
      }
      
      // Release the audio element
      audioRef.current = null;
    };
  }, [recording.audioUrl, recording.id, recording.title]);

  const handleAudioLoaded = () => {
    setAudioLoaded(true);
    setAudioError(null);
    console.log(`Audio loaded successfully: ${recording.audioUrl}`);
  };

  const handleAudioError = (e: Event) => {
    console.error("Audio error event:", e);
    const target = e.target as HTMLAudioElement;
    setAudioLoaded(false);
    
    // Get more detailed error information
    let errorMessage = "Unknown error";
    if (target && target.error) {
      switch(target.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Fetching process aborted";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Decoding error";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio format not supported";
          break;
        default:
          errorMessage = `Error code: ${target.error.code}`;
      }
    }
    
    setAudioError(`Error loading audio: ${errorMessage}`);
    console.error(`Audio load error for ${recording.audioUrl}:`, errorMessage);
    
    // Try to fetch directly to check URL validity
    fetch(recording.audioUrl, { method: 'HEAD' })
      .then(response => {
        console.log(`URL check response: ${response.status} ${response.statusText}`);
        if (!response.ok) {
          setAudioError(`URL check failed: ${response.status} ${response.statusText}`);
        }
      })
      .catch(err => {
        console.error("URL fetch error:", err);
        setAudioError(`URL fetch error: ${err.message}`);
      });
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
      console.error("No audio element available");
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "Audio player not initialized. Please refresh the page."
      });
      return;
    }

    console.log("Toggle playback. Current state:", isPlaying);
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log("Paused audio");
    } else {
      // Try to load the audio again if there was an error
      if (audioError) {
        console.log("Reloading audio after error");
        audioRef.current.load();
      }
      
      // Add more debug logging
      console.log("Attempting to play audio:", recording.audioUrl);
      console.log("Audio element readyState:", audioRef.current.readyState);
      console.log("Audio element duration:", audioRef.current.duration);
      
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
            {audioError}
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
