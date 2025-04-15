
import React, { createContext, useContext, ReactNode } from "react";
import { Recording, RecordingStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRecordingState } from "@/hooks/use-recording-state";
import { useRecordingsStorage } from "@/hooks/use-recordings-storage";

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
  const { user } = useAuth();
  const {
    recordingStatus,
    recordingTime,
    currentRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording
  } = useRecordingState();

  const {
    recordings,
    saveRecording: saveToStorage,
    deleteRecording: deleteFromStorage,
    getRecording
  } = useRecordingsStorage(user?.id);

  const saveRecording = async (title: string, tags: string[]) => {
    if (!currentRecording || !user) return;
    
    const success = await saveToStorage(
      user.id,
      currentRecording,
      title,
      tags,
      recordingTime
    );
    
    if (success) {
      discardRecording();
    }
  };

  const deleteRecording = async (id: string) => {
    if (!user) return false;
    return deleteFromStorage(id, user.id);
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
