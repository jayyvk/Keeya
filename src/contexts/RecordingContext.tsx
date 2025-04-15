
import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import { Recording, RecordingStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  deleteRecording: (id: string) => Promise<void>;
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

  const startRecording = async () => {
    try {
      // Reset state
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create MediaRecorder with audio/mp3 MIME type if supported
      let mimeType = 'audio/webm';
      
      // Try to use mp3 if supported by the browser
      if (MediaRecorder.isTypeSupported('audio/mp3')) {
        mimeType = 'audio/mp3';
        console.log("Using MP3 format for recording");
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
        console.log("Using WAV format for recording");
      } else {
        console.log("Using WebM format for recording (mp3 not supported)");
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Combine audio chunks into a single blob with correct MIME type
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setCurrentRecording(audioBlob);
        console.log(`Recording completed. Blob size: ${audioBlob.size} bytes, type: ${mimeType}`);
        
        // Stop the recording stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Stop the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Capture data in 1-second chunks
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
        description: "Could not access microphone. Please check permissions."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingStatus === "recording" || recordingStatus === "paused")) {
      mediaRecorderRef.current.stop();
      setRecordingStatus("reviewing");
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
      
      // Determine the file extension based on the blob type
      let fileExtension = '.webm';
      if (currentRecording.type.includes('mp3')) {
        fileExtension = '.mp3';
      } else if (currentRecording.type.includes('wav')) {
        fileExtension = '.wav';
      }
      
      // Convert blob to file with appropriate extension
      const fileName = `${Date.now()}${fileExtension}`;
      const file = new File([currentRecording], fileName, { type: currentRecording.type });
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
          file_type: file.type
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
    if (!user) return;
    
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
    } catch (error) {
      console.error("Error deleting recording:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete recording"
      });
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
