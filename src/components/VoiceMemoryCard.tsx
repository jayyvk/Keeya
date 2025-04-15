import React, { useState } from "react";
import { Clock, Calendar, Tag, Trash2 } from "lucide-react";
import { Recording } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRecording } from "@/contexts/RecordingContext";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { AudioControls } from "./AudioControls";
import { DeleteRecordingDialog } from "./DeleteRecordingDialog";

interface VoiceMemoryCardProps {
  recording: Recording;
}

const VoiceMemoryCard: React.FC<VoiceMemoryCardProps> = ({ recording }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { deleteRecording } = useRecording();
  
  const {
    isPlaying,
    currentTime,
    audioLoaded,
    audioError,
    togglePlayback,
    seek,
    skipForward,
    skipBackward
  } = useAudioPlayback(recording.audioUrl);

  const handleDelete = async (password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: "Please enter the correct password to delete this recording"
        });
        return;
      }

      await deleteRecording(recording.id);
      setIsDeleting(false);
      
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
        </div>
        
        <AudioControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={recording.duration}
          audioLoaded={audioLoaded}
          onTogglePlay={togglePlayback}
          onSkipBackward={skipBackward}
          onSkipForward={skipForward}
          onSeek={seek}
        />

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
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setIsDeleting(true)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </AlertDialogTrigger>
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

      <DeleteRecordingDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default VoiceMemoryCard;
