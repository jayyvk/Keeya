
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Recording } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AudioPlayer from "./voice-memory/AudioPlayer";
import DeleteDialog from "./voice-memory/DeleteDialog";
import CardInfo from "./voice-memory/CardInfo";
import { useRecording } from "@/contexts/RecordingContext";

interface VoiceMemoryCardProps {
  recording: Recording;
}

const VoiceMemoryCard: React.FC<VoiceMemoryCardProps> = ({ recording }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteRecording } = useRecording();
  const { toast } = useToast();

  const handleConfirmDelete = async () => {
    try {
      await deleteRecording(recording.id);
      setIsDeleting(false);
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
        </div>
        
        <div className="mt-3">
          <AudioPlayer
            title={recording.title}
            audioUrl={recording.audioUrl}
            duration={recording.duration}
            recordingId={recording.id}
          />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col space-y-2">
          <CardInfo 
            createdAt={recording.createdAt} 
            tags={recording.tags} 
          />
          
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      <DeleteDialog
        isOpen={isDeleting}
        onOpenChange={setIsDeleting}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default VoiceMemoryCard;
