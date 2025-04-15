import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Clock, Calendar, Tag, Trash2, SkipBack, SkipForward } from "lucide-react";
import { Recording } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/contexts/AuthContext";
import { useRecording } from "@/contexts/RecordingContext";
import { generateRandomWord } from "@/utils/randomWord";
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
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteWord, setDeleteWord] = useState("");
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { deleteRecording } = useRecording();

  useEffect(() => {
    if (isDeleting) {
      setDeleteWord(generateRandomWord(10));
      setDeleteConfirmation("");
    }
  }, [isDeleting]);

  useEffect(() => {
    console.log(`Setting up audio for: ${recording.title} (${recording.id})`);
    
    const audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElement.preload = "metadata";
    
    const updateDuration = () => {
      if (recording.duration === 0 && audioElement.duration) {
        console.log(`Updating duration for ${recording.title}: ${audioElement.duration}s`);
        supabase
          .from('voice_memories')
          .update({ duration: audioElement.duration })
          .eq('id', recording.id)
          .then(() => {
            console.log('Duration updated in database');
          })
          .catch(err => {
            console.error('Error updating duration:', err);
          });
      }
    };
    
    audioElement.addEventListener('loadeddata', handleAudioLoaded);
    audioElement.addEventListener('canplaythrough', () => {
      console.log(`Audio can now play through: ${recording.title}`);
      setAudioLoaded(true);
      updateDuration();
    });
    audioElement.addEventListener('error', handleAudioError);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleAudioEnd);
    
    audioRef.current = audioElement;
    audioElement.src = recording.audioUrl;
    
    try {
      audioElement.load();
      console.log(`Audio load initiated for: ${recording.title}`);
    } catch (err) {
      console.error("Error loading audio:", err);
    }
    
    return () => {
      console.log(`Cleaning up audio for: ${recording.title}`);
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
  }, [recording.id, recording.title, recording.audioUrl]);

  const handleAudioLoaded = () => {
    console.log(`Audio loaded successfully for: ${recording.title}`);
    setAudioLoaded(true);
    setAudioError(null);
    
    if (audioRef.current) {
      console.log(`Audio duration: ${audioRef.current.duration}s`);
    }
  };

  const handleAudioError = (e: Event) => {
    console.error(`Audio error for ${recording.title}:`, e);
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
    
    fetch(recording.audioUrl, { method: 'HEAD' })
      .then(response => {
        console.log(`URL check for ${recording.title}: ${response.status} ${response.statusText}`);
        if (!response.ok) {
          setAudioError(`File not accessible (${response.status})`);
        }
      })
      .catch(err => {
        console.error(`URL fetch error for ${recording.title}:`, err);
        setAudioError(`Cannot access file: ${err.message}`);
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
      console.error("No audio element available for playback");
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "Audio player not initialized. Please refresh the page."
      });
      return;
    }

    console.log(`Toggle playback for ${recording.title}. Current state: ${isPlaying ? 'Playing' : 'Paused'}`);
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log(`Paused ${recording.title}`);
    } else {
      if (audioError) {
        console.log(`Attempting to reload audio after error: ${recording.title}`);
        audioRef.current.load();
      }
      
      console.log(`Audio readyState: ${audioRef.current.readyState}, Duration: ${audioRef.current.duration}`);
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Successfully started playback for: ${recording.title}`);
            setIsPlaying(true);
          })
          .catch(error => {
            console.error(`Playback error for ${recording.title}:`, error);
            toast({
              variant: "destructive",
              title: "Playback Error",
              description: "There was an error playing this recording. The file format may not be supported by your browser."
            });
          });
      }
    }
  };

  const handleAudioEnd = () => {
    console.log(`Playback ended for: ${recording.title}`);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== deleteWord) {
      toast({
        variant: "destructive",
        title: "Invalid confirmation",
        description: "The confirmation word does not match. Please try again.",
      });
      return;
    }

    try {
      await deleteRecording(recording.id);
      setIsDeleting(false);
      setDeleteConfirmation("");
      toast({
        title: "Success",
        description: "Voice memory deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the recording. Please try again.",
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
        </div>
        
        <div className="mt-3">
          <div className="flex items-center mb-2">
            <ToggleGroup 
              type="single" 
              value={playbackSpeed.toString()}
              onValueChange={(value) => {
                if (value) {
                  setPlaybackSpeed(parseFloat(value));
                }
              }}
              className="bg-white/10 rounded-lg p-1 mr-2"
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
          </div>
          
          <Slider
            value={[currentTime]}
            min={0}
            max={recording.duration || 0}
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
          
          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center text-xs text-gray-500">
              <Tag size={12} className="mr-1" />
              <span>{recording.tags?.length > 0 ? 'Tags:' : 'No tags'}</span>
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
                  <AlertDialogDescription className="space-y-4">
                    <p>This action cannot be undone. Please enter this word to confirm deletion:</p>
                    <div className="p-2 bg-gray-100 rounded font-mono text-center text-lg">
                      {deleteWord}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="mt-4">
                  <Input
                    type="text"
                    placeholder="Enter the confirmation word"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel onClick={() => {
                    setIsDeleting(false);
                    setDeleteConfirmation("");
                  }}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={!deleteConfirmation}
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {recording.tags?.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMemoryCard;
