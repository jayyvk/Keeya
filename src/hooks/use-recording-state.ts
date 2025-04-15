
import { useState, useRef, useEffect } from "react";
import { RecordingStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useRecordingState() {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("inactive");
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentRecording, setCurrentRecording] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        toast({
          variant: "destructive",
          title: "Browser not supported",
          description: "Your browser doesn't support recording. Please try a modern browser like Chrome or Firefox."
        });
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      if (stream.getAudioTracks().length === 0) {
        toast({
          variant: "destructive",
          title: "Recording Error",
          description: "No audio track was detected in your microphone."
        });
        return;
      }
      
      const mimeTypes = [
        'audio/mp3',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/wav',
        'audio/aac'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          toast({
            variant: "destructive",
            title: "Recording Error",
            description: "No audio was captured. Please try again."
          });
          return;
        }
        
        const rawAudioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        
        if (rawAudioBlob.size === 0) {
          toast({
            variant: "destructive",
            title: "Recording Error",
            description: "Recording failed to capture any audio. Please try again."
          });
          return;
        }
        
        setCurrentRecording(rawAudioBlob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      mediaRecorder.start(500);
      setRecordingStatus("recording");
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error: any) {
      handleRecordingError(error);
    }
  };

  const handleRecordingError = (error: Error) => {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access in your browser settings and try again."
      });
    } else if (error.name === "NotFoundError" || error.name === "DeviceNotFoundError") {
      toast({
        variant: "destructive",
        title: "No microphone found",
        description: "Please connect a microphone and try again."
      });
    } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      toast({
        variant: "destructive",
        title: "Microphone in use",
        description: "Your microphone is currently being used by another application."
      });
    } else {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: `Could not access microphone: ${error.message || "Unknown error"}`
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingStatus === "recording" || recordingStatus === "paused")) {
      try {
        mediaRecorderRef.current.stop();
        setRecordingStatus("reviewing");
      } catch (error) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecordingStatus("inactive");
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingStatus("paused");
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingStatus("recording");
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const discardRecording = () => {
    setCurrentRecording(null);
    setRecordingStatus("inactive");
    setRecordingTime(0);
  };

  return {
    recordingStatus,
    recordingTime,
    currentRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording,
    setCurrentRecording,
    setRecordingStatus,
    setRecordingTime
  };
}
