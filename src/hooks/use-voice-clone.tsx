
import { useState } from "react";
import { Recording } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useVoiceClone() {
  const { toast } = useToast();
  const [selectedSources, setSelectedSources] = useState<Recording[]>([]);
  const [inputText, setInputText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [totalSelectedDuration, setTotalSelectedDuration] = useState(0);

  const handleSourceSelect = (recording: Recording) => {
    if (selectedSources.some(r => r.id === recording.id)) {
      setSelectedSources(prev => prev.filter(r => r.id !== recording.id));
    } else {
      setSelectedSources(prev => [...prev, recording]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (enhancedText) setEnhancedText("");
  };

  const handleEnhanceText = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text before enhancing.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);

    try {
      setTimeout(() => {
        const enhanced = `${inputText}\n\nEnhanced with more warmth and personality. This voice message sounds natural and captures the essence of the original voice, with improved clarity and emotion.`;
        setEnhancedText(enhanced);
        setIsEnhancing(false);

        toast({
          title: "Text enhanced",
          description: "Your text has been enhanced with AI.",
        });
      }, 2000);
    } catch (error) {
      console.error("Error enhancing text:", error);
      toast({
        title: "Enhancement failed",
        description: "Unable to enhance text. Please try again.",
        variant: "destructive",
      });
      setIsEnhancing(false);
    }
  };

  return {
    selectedSources,
    inputText,
    enhancedText,
    isEnhancing,
    isCloning,
    clonedAudioUrl,
    totalSelectedDuration,
    setIsCloning,
    setClonedAudioUrl,
    handleSourceSelect,
    handleTextChange,
    handleEnhanceText,
    setTotalSelectedDuration,
  };
}
