import { useState, useEffect } from "react";
import { Recording } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueFilename } from "@/utils/randomWord";

export function useRecordingsStorage(userId: string | undefined) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchRecordings(userId);
    } else {
      setRecordings([]);
    }
  }, [userId]);

  const fetchRecordings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('voice_memories')
        .select('*')
        .eq('user_id', userId)
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

  const saveRecording = async (
    userId: string,
    recordingBlob: Blob,
    title: string,
    tags: string[],
    duration: number
  ) => {
    try {
      const fileName = generateUniqueFilename();
      const file = new File([recordingBlob], fileName, { type: 'audio/mp3' });
      const filePath = `${userId}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('voice_memories')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: 'audio/mp3'
        });
      
      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase
        .storage
        .from('voice_memories')
        .getPublicUrl(filePath);
      
      const { data, error } = await supabase
        .from('voice_memories')
        .insert({
          title,
          user_id: userId,
          duration,
          file_url: publicUrl,
          tags,
          file_type: 'audio/mp3'
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }
      
      const newRecording: Recording = {
        id: data.id,
        title,
        createdAt: new Date(data.created_at),
        duration,
        audioUrl: publicUrl,
        tags
      };
      
      setRecordings(prev => [newRecording, ...prev]);
      
      toast({
        title: "Success",
        description: "Your voice memory has been saved"
      });
      
      return true;
    } catch (error: any) {
      console.error("Error saving recording:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save your recording: ${error.message}`
      });
      return false;
    }
  };

  const deleteRecording = async (id: string, userId: string) => {
    try {
      const recordingToDelete = recordings.find(r => r.id === id);
      if (!recordingToDelete) {
        throw new Error("Recording not found");
      }
      
      const fileUrl = new URL(recordingToDelete.audioUrl);
      const pathParts = fileUrl.pathname.split('/');
      const filePath = `${userId}/${pathParts[pathParts.length - 1]}`;
      
      const { error: storageError } = await supabase
        .storage
        .from('voice_memories')
        .remove([filePath]);
      
      if (storageError) {
        console.error("Storage deletion error:", storageError);
      }
      
      const { error: dbError } = await supabase
        .from('voice_memories')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        throw dbError;
      }
      
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

  const getRecording = (id: string) => {
    return recordings.find(recording => recording.id === id);
  };

  return {
    recordings,
    saveRecording,
    deleteRecording,
    getRecording
  };
}
