import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import RecordButton from "@/components/RecordButton";
import { useRecordingState } from "@/hooks/use-recording-state";
import AudioWaveform from "@/components/AudioWaveform";
import RecordingTimer from "@/components/RecordingTimer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadToVault } from "@/utils/audioUpload";

const RecordClip = () => {
  const { id } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    recordingStatus,
    recordingTime,
    currentRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording,
  } = useRecordingState();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('voice_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Request not found');
        
        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
          throw new Error('This request has expired');
        }
        
        // Check if already fulfilled
        if (data.is_fulfilled) {
          throw new Error('This request has already been fulfilled');
        }

        setRequest(data);
      } catch (error) {
        console.error('Error fetching request:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRequest();
  }, [id]);

  const handleSave = async () => {
    if (!currentRecording || !request) return;

    try {
      const file = new File([currentRecording], 'recording.mp3', {
        type: 'audio/mp3'
      });

      const success = await uploadToVault({
        file,
        type: 'audio'
      }, request.created_by, `Message for ${request.recipient_name}`);

      if (!success) throw new Error('Failed to save recording');

      // Mark request as fulfilled
      const { error: updateError } = await supabase
        .from('voice_requests')
        .update({ is_fulfilled: true })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast.success("Voice memory saved!", {
        description: "Your message has been delivered successfully"
      });

      discardRecording();
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error("Failed to save recording", {
        description: "Please try again"
      });
    }
  };

  if (loading) {
    return <div className="keeya-bg min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  if (error) {
    return <div className="keeya-bg min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>;
  }

  return (
    <div className="keeya-bg min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-bold text-voicevault-tertiary mb-2">
            Record a Voice Memory
          </h1>
          <p className="text-gray-600">
            Leave a special message for {request.recipient_name}
          </p>
        </div>

        <div className="space-y-6">
          <RecordingTimer status={recordingStatus} time={recordingTime} />
          
          <AudioWaveform status={recordingStatus} />
          
          <RecordButton
            status={recordingStatus}
            onStart={startRecording}
            onStop={stopRecording}
            onPause={pauseRecording}
            onResume={resumeRecording}
          />

          {recordingStatus === "reviewing" && (
            <div className="space-y-4">
              <Button
                onClick={handleSave}
                className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
              >
                Send Voice Memory
              </Button>
              <Button
                variant="outline"
                onClick={discardRecording}
                className="w-full"
              >
                Record Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordClip;
