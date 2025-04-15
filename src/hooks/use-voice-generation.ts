
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useVoiceGeneration() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  const generateVoice = async (referenceAudio: { audioUrl: string }, text: string) => {
    setIsProcessing(true);

    try {
      if (!referenceAudio || !referenceAudio.audioUrl) {
        throw new Error("No reference audio selected");
      }

      const response = await supabase.functions.invoke('generate-voice', {
        body: {
          referenceAudioUrl: referenceAudio.audioUrl,
          text: text,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.output) {
        setGeneratedAudioUrl(response.data.output);
        toast({
          title: "Voice cloned successfully",
          description: "Your voice memory has been created.",
        });
        return response.data.output;
      } else {
        throw new Error("No output returned from the API");
      }
    } catch (error) {
      console.error("Error generating voice:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate voice. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    generatedAudioUrl,
    generateVoice,
    setGeneratedAudioUrl
  };
}
