import { useState } from "react";
import { Recording } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function useVoiceClone() {
  const { toast } = useToast();
  const [selectedSources, setSelectedSources] = useState<Recording[]>([]);
  const [inputText, setInputText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [totalSelectedDuration, setTotalSelectedDuration] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"input" | "enhanced">("input");

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
      const { data, error } = await supabase.functions.invoke('enhance-text', {
        body: { text: inputText }
      });

      if (error) throw error;

      if (data?.enhancedText) {
        setEnhancedText(data.enhancedText);
        toast({
          title: "Text enhanced",
          description: "Your text has been enhanced with Gemini AI.",
        });
      }
    } catch (error) {
      console.error("Error enhancing text:", error);
      toast({
        title: "Enhancement failed",
        description: "Unable to enhance text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const estimateCredits = (text: string): number => {
    const words = text.trim().split(/\s+/).length;
    return words > 100 ? 2 : 1;
  };

  const handleCreateVoiceMemory = async () => {
    const textToUse = activeTab === "enhanced" ? enhancedText : inputText;
    const requiredCredits = estimateCredits(textToUse);
    setShowConfirmDialog(true);
  };

  const handleConfirmGeneration = async () => {
    setShowConfirmDialog(false);
    setIsCloning(true);

    try {
      setTimeout(() => {
        setClonedAudioUrl("https://file-examples.com/storage/fe3a8ff9004de0da6fa8225/2017/11/file_example_MP3_700KB.mp3");
        setIsCloning(false);

        toast({
          title: "Voice cloned successfully",
          description: "Your voice memory has been created.",
        });
      }, 3000);
    } catch (error) {
      console.error("Error cloning voice:", error);
      toast({
        title: "Cloning failed",
        description: "Unable to clone voice. Please try again.",
        variant: "destructive",
      });
      setIsCloning(false);
    }
  };

  const ConfirmationDialog = () => {
    const textToUse = activeTab === "enhanced" ? enhancedText : inputText;
    const requiredCredits = estimateCredits(textToUse);
    const wordCount = textToUse.trim().split(/\s+/).length;

    return (
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Voice Generation</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>You're about to generate a voice memory using the {activeTab} text.</p>
              <p>Word count: {wordCount} words</p>
              <p className="font-medium">
                This will use {requiredCredits} credit{requiredCredits > 1 ? 's' : ''}.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGeneration}>
              Generate Voice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return {
    selectedSources,
    inputText,
    enhancedText,
    isEnhancing,
    isCloning,
    clonedAudioUrl,
    totalSelectedDuration,
    activeTab,
    setActiveTab,
    setIsCloning,
    setClonedAudioUrl,
    handleSourceSelect,
    handleTextChange,
    handleEnhanceText,
    handleCreateVoiceMemory,
    setTotalSelectedDuration,
    ConfirmationDialog,
  };
}
