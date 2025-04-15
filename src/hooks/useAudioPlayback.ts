import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAudioPlayback = (audioUrl: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElement.src = audioUrl;
    audioElement.preload = "auto";
    
    audioElement.addEventListener('loadeddata', handleAudioLoaded);
    audioElement.addEventListener('error', handleAudioError);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleAudioEnd);
    audioElement.addEventListener('canplaythrough', () => {
      console.log(`Audio can play through: ${audioUrl}`);
      setAudioLoaded(true);
    });
    
    audioRef.current = audioElement;
    audioElement.load();
    
    console.log(`Created audio element for URL: ${audioUrl}`);
    
    return () => {
      audioElement.removeEventListener('loadeddata', handleAudioLoaded);
      audioElement.removeEventListener('error', handleAudioError);
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('ended', handleAudioEnd);
      audioElement.removeEventListener('canplaythrough', () => {});
      
      if (!audioElement.paused) {
        audioElement.pause();
      }
      audioRef.current = null;
    };
  }, [audioUrl]);

  const handleAudioLoaded = () => {
    setAudioLoaded(true);
    setAudioError(null);
    console.log(`Audio loaded successfully: ${audioUrl}`);
  };

  const handleAudioError = (e: Event) => {
    console.error("Audio error event:", e);
    const target = e.target as HTMLAudioElement;
    setAudioLoaded(false);
    
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
    console.error(`Audio load error for ${audioUrl}:`, errorMessage);
    
    fetch(audioUrl, { method: 'HEAD' })
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

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
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
      if (audioError) {
        console.log("Reloading audio after error");
        audioRef.current.load();
      }
      
      console.log("Attempting to play audio:", audioUrl);
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

  const seek = (value: number[]) => {
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

  return {
    isPlaying,
    currentTime,
    audioLoaded,
    audioError,
    togglePlayback,
    seek,
    skipForward,
    skipBackward
  };
};
