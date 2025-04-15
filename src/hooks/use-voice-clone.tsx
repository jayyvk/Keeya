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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type VoiceModel = 'openvoice' | 'elevenlabs';

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
  const [selectedModel, setSelectedModel] = useState<VoiceModel>('openvoice');

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

  const estimateCredits = (text: string, model: VoiceModel): number => {
    const words = text.trim().split(/\s+/).length;
    if (model === 'openvoice') {
      return words > 100 ? 2 : 1;
    } else {
      return 5;
    }
  };

  const handleCreateVoiceMemory = async () => {
    const textToUse = activeTab === "enhanced" ? enhancedText : inputText;
    const requiredCredits = estimateCredits(textToUse, selectedModel);
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
    const requiredCredits = estimateCredits(textToUse, selectedModel);
    const wordCount = textToUse.trim().split(/\s+/).length;

    return (
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Voice Generation</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>You're about to generate a voice memory using the {activeTab} text.</p>
              <p className="text-sm text-gray-500">Word count: {wordCount} words</p>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Select Voice Model</h4>
                <RadioGroup
                  value={selectedModel}
                  onValueChange={(value) => setSelectedModel(value as VoiceModel)}
                  className="gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="openvoice" id="openvoice" />
                    <Label htmlFor="openvoice" className="flex-1">
                      <span className="font-medium">OpenVoice</span>
                      <p className="text-sm text-gray-500">
                        {wordCount > 100 ? '2 credits (>100 words)' : '1 credit (<100 words)'}
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="elevenlabs" id="elevenlabs" />
                    <Label htmlFor="elevenlabs" className="flex-1">
                      <span className="font-medium">ElevenLabs</span>
                      <p className="text-sm text-gray-500">5 credits (higher quality)</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <p className="mt-4 font-medium">
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
    selectedModel,
    setSelectedModel,
    ConfirmationDialog,
  };
}
