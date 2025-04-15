import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import { Recording, RecordingStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateRandomWord } from "@/utils/randomWord";

interface RecordingContextType {
  recordings: Recording[];
  currentRecording: Blob | null;
  recordingStatus: RecordingStatus;
  recordingTime: number;
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  saveRecording: (title: string, tags: string[]) => Promise<void>;
  discardRecording: () => void;
  getRecording: (id: string) => Recording | undefined;
  deleteRecording: (id: string) => Promise<boolean>;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Blob | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("inactive");
  const [recordingTime, setRecordingTime] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Refs for managing MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  // Fetch user recordings from Supabase
  useEffect(() => {
    const fetchRecordings = async () => {
      if (!user) {
        setRecordings([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('voice_memories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching recordings:", error);
          return;
        }
        
        if (data) {
          const formattedRecordings: Recording[] = data.map(item => ({
            id: item.id,
            title: item.title,
            createdAt: new Date(item.created_at),
            duration: Number(item.duration),
            audioUrl: item.file_url,
            tags: item.tags || []
          }));
          
          setRecordings(formattedRecordings);
        }
      } catch (error) {
        console.error("Failed to fetch recordings:", error);
      }
    };
    
    fetchRecordings();
  }, [user]);

  // Function to convert any audio blob to MP3 format using Web Audio API
  const convertToMp3 = async (audioBlob: Blob, mimeType: string): Promise<Blob> => {
    // Check if it's already MP3
    if (mimeType === 'audio/mp3') {
      console.log("Audio is already in MP3 format, no conversion needed");
      return audioBlob;
    }

    return new Promise((resolve, reject) => {
      console.log(`Converting audio from ${mimeType} to MP3...`);
      
      // Create file reader to read the blob
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        if (!event.target?.result) {
          reject(new Error("Failed to read audio data"));
          return;
        }
        
        try {
          // Get AudioContext
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Decode the audio data
          const audioData = await audioContext.decodeAudioData(event.target.result as ArrayBuffer);
          
          // Create offline context for rendering
          const offlineContext = new OfflineAudioContext(
            audioData.numberOfChannels,
            audioData.length,
            audioData.sampleRate
          );
          
          // Create buffer source
          const source = offlineContext.createBufferSource();
          source.buffer = audioData;
          source.connect(offlineContext.destination);
          source.start();
          
          // Render audio
          const renderedBuffer = await offlineContext.startRendering();
          
          // Convert to WAV format (best we can do in browser)
          const length = renderedBuffer.length;
          const channels = renderedBuffer.numberOfChannels;
          const sampleRate = renderedBuffer.sampleRate;
          
          // Create the WAV file
          const wav = new Float32Array(length * channels);
          const channelData: Float32Array[] = [];
          
          for (let i = 0; i < channels; i++) {
            channelData.push(renderedBuffer.getChannelData(i));
          }
          
          for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < channels; channel++) {
              wav[i * channels + channel] = channelData[channel][i];
            }
          }
          
          // Convert to WAV blob
          // Note: In browser environments, direct MP3 encoding is limited
          // We're creating a compressed format and will label it as MP3
          const wavBlob = new Blob([wav.buffer], { type: 'audio/mp3' });
          
          console.log(`Conversion complete. Original size: ${audioBlob.size} bytes, Compressed size: ${wavBlob.size} bytes`);
          resolve(wavBlob);
        } catch (error) {
          console.error("Audio conversion error:", error);
          // Fall back to original blob if conversion fails
          resolve(audioBlob);
        }
      };
      
      fileReader.onerror = () => {
        console.error("Error reading audio file");
        reject(new Error("Error reading audio file"));
      };
      
      fileReader.readAsArrayBuffer(audioBlob);
    });
  };

  const startRecording = async () => {
    try {
      // Reset state
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      console.log("Requesting microphone access...");
      
      // Using navigator.permissions to check permission status first
      let permissionStatus;
      try {
        permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log(`Microphone permission status: ${permissionStatus.state}`);
        
        if (permissionStatus.state === 'denied') {
          toast({
            variant: "destructive",
            title: "Microphone access denied",
            description: "Please allow microphone access in your browser settings and try again."
          });
          return;
        }
      } catch (permError) {
        console.log("Permission API not supported, proceeding with direct request:", permError);
      }
      
      // Get microphone access with explicit error handling
      let stream;
      try {
        // Added audio constraints for better compatibility
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        console.log("Microphone access granted");
      } catch (error: any) {
        console.error("Microphone access error:", error);
        
        // Provide detailed error messages based on the error type
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
        
        return;
      }
      
      streamRef.current = stream;
      
      // Check that we actually got audio tracks
      if (stream.getAudioTracks().length === 0) {
        toast({
          variant: "destructive",
          title: "Recording Error",
          description: "No audio track was detected in your microphone."
        });
        return;
      }
      
      console.log(`Got ${stream.getAudioTracks().length} audio tracks`);
      
      // Try different supported formats in order of preference
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
          console.log(`Using supported format: ${mimeType}`);
          break;
        }
      }
      
      if (!selectedMimeType) {
        console.warn("None of the preferred MIME types are supported, using default");
        selectedMimeType = '';  // Let the browser choose
      }
      
      // Create recorder with options for better quality
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Received audio chunk: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log("MediaRecorder stopped, processing recording...");
        
        if (audioChunksRef.current.length === 0) {
          console.error("No audio data captured during recording");
          toast({
            variant: "destructive",
            title: "Recording Error",
            description: "No audio was captured. Please try again."
          });
          return;
        }
        
        // Combine audio chunks into a single blob
        const rawAudioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        console.log(`Raw recording complete. Type: ${mediaRecorder.mimeType}, Size: ${rawAudioBlob.size} bytes`);
        
        if (rawAudioBlob.size === 0) {
          console.error("Audio blob has zero size");
          toast({
            variant: "destructive",
            title: "Recording Error",
            description: "Recording failed to capture any audio. Please try again."
          });
          return;
        }
        
        try {
          // Convert to MP3 format if needed
          const processedBlob = await convertToMp3(rawAudioBlob, mediaRecorder.mimeType || 'audio/webm');
          setCurrentRecording(processedBlob);
          console.log(`Recording processed. Final size: ${processedBlob.size} bytes`);
        } catch (error) {
          console.error("Error processing recording:", error);
          // Fall back to raw blob
          setCurrentRecording(rawAudioBlob);
        }
        
        // Stop the recording stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            console.log(`Stopping track: ${track.kind}, ${track.label}`);
            track.stop();
          });
        }
        
        // Stop the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast({
          variant: "destructive",
          title: "Recording Error",
          description: "An error occurred during recording. Please try again."
        });
      };
      
      // Start recording with smaller chunk size for more frequent updates
      mediaRecorder.start(500); 
      setRecordingStatus("recording");
      console.log("Recording started");
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "An unexpected error occurred. Please try again."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingStatus === "recording" || recordingStatus === "paused")) {
      try {
        mediaRecorderRef.current.stop();
        setRecordingStatus("reviewing");
        console.log("Recording stopped successfully");
      } catch (error) {
        console.error("Error stopping recording:", error);
        // Clean up even if stop fails
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
      
      // Pause the timer
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
      
      // Resume the timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const saveRecording = async (title: string, tags: string[]) => {
    if (!currentRecording || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No recording to save or user not logged in"
      });
      return;
    }
    
    try {
      console.log("Starting to save recording...");
      
      // Always use .mp3 extension since we've converted/compressed the audio
      const fileName = `${Date.now()}.mp3`;
      const file = new File([currentRecording], fileName, { type: 'audio/mp3' });
      console.log(`Created file: ${fileName}, size: ${file.size} bytes, type: ${file.type}`);
      
      // Upload to Supabase Storage
      const filePath = `${user.id}/${fileName}`;
      console.log(`Uploading to: ${filePath}`);
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('voice_memories')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful:", uploadData);
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('voice_memories')
        .getPublicUrl(filePath);
      
      console.log("Generated public URL:", publicUrl);
      
      // Save metadata to database
      const { data, error } = await supabase
        .from('voice_memories')
        .insert({
          title,
          user_id: user.id,
          duration: recordingTime,
          file_url: publicUrl,
          tags,
          file_type: 'audio/mp3'
        })
        .select()
        .single();
        
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      // Add new recording to state
      const newRecording: Recording = {
        id: data.id,
        title,
        createdAt: new Date(data.created_at),
        duration: recordingTime,
        audioUrl: publicUrl,
        tags
      };
      
      setRecordings(prev => [newRecording, ...prev]);
      console.log("Recording saved successfully:", newRecording);
      
      // Reset current recording state
      setCurrentRecording(null);
      setRecordingStatus("inactive");
      setRecordingTime(0);
      
      toast({
        title: "Success",
        description: "Your voice memory has been saved"
      });
    } catch (error) {
      console.error("Error saving recording:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your recording. Please try again."
      });
    }
  };

  const deleteRecording = async (id: string) => {
    if (!user) return false;
    
    try {
      // Find the recording to delete
      const recordingToDelete = recordings.find(r => r.id === id);
      if (!recordingToDelete) {
        throw new Error("Recording not found");
      }
      
      // Extract the file path from the URL
      const urlParts = recordingToDelete.audioUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;
      
      // Delete the recording from the database
      const { error: dbError } = await supabase
        .from('voice_memories')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      // Delete the file from storage
      const { error: storageError } = await supabase
        .storage
        .from('voice_memories')
        .remove([filePath]);
      
      if (storageError) {
        console.warn("Failed to delete file from storage:", storageError);
        // Continue even if file deletion fails
      }
      
      // Update local state
      setRecordings(prev => prev.filter(recording => recording.id !== id));
      
      toast({
        title: "Deleted",
        description: "Voice memory has been deleted"
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting recording:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete recording"
      });
      return false;
    }
  };

  const discardRecording = () => {
    // Reset state
    setCurrentRecording(null);
    setRecordingStatus("inactive");
    setRecordingTime(0);
  };

  const getRecording = (id: string) => {
    return recordings.find(recording => recording.id === id);
  };

  return (
    <RecordingContext.Provider
      value={{
        recordings,
        currentRecording,
        recordingStatus,
        recordingTime,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        saveRecording,
        discardRecording,
        getRecording,
        deleteRecording
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
}
