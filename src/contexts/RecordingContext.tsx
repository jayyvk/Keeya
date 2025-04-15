
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Recording, RecordingStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatRecording } from "@/utils/recordingUtils";
import { useRecordingState } from "@/hooks/useRecordingState";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    currentRecording,
    recordingStatus,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording
  } = useRecordingState();

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
          
        if (error) throw error;
        
        if (data) {
          const formattedRecordings = data.map(formatRecording);
          setRecordings(formattedRecordings);
        }
      } catch (error) {
        console.error("Failed to fetch recordings:", error);
      }
    };
    
    fetchRecordings();
  }, [user]);

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
      const file = new File([currentRecording], `${Date.now()}.wav`, { type: 'audio/wav' });
      const filePath = `${user.id}/${Date.now()}.wav`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('voice_memories')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase
        .storage
        .from('voice_memories')
        .getPublicUrl(filePath);
      
      const { data, error } = await supabase
        .from('voice_memories')
        .insert({
          title,
          user_id: user.id,
          duration: recordingTime,
          file_url: publicUrl,
          tags
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newRecording = formatRecording(data);
      setRecordings(prev => [newRecording, ...prev]);
      
      discardRecording();
      
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
      const recordingToDelete = recordings.find(r => r.id === id);
      if (!recordingToDelete) {
        throw new Error("Recording not found");
      }
      
      const urlParts = recordingToDelete.audioUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;
      
      const { error: dbError } = await supabase
        .from('voice_memories')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      const { error: storageError } = await supabase
        .storage
        .from('voice_memories')
        .remove([filePath]);
      
      if (storageError) {
        console.warn("Failed to delete file from storage:", storageError);
      }
      
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
