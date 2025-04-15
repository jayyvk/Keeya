
import React, { useEffect } from "react";
import { useVoiceClone } from "@/hooks/use-voice-clone";
import { useMonetization } from "@/contexts/MonetizationContext";
import AudioSourceSelector from "./AudioSourceSelector";
import TextEnhancer from "./TextEnhancer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceGenerationFormProps {
  onGenerate: (referenceAudio: any, text: string) => Promise<string | null>;
  isProcessing: boolean;
}

const VoiceGenerationForm: React.FC<VoiceGenerationFormProps> = ({
  onGenerate,
  isProcessing
}) => {
  const { toast } = useToast();
  const { credits, setShowCreditsOverlay } = useMonetization();
  const {
    selectedSources,
    inputText,
    enhancedText,
    isEnhancing,
    totalSelectedDuration,
    activeTab,
    handleSourceSelect,
    handleTextChange,
    handleEnhanceText,
    setTotalSelectedDuration,
    setActiveTab, // Fixed: Properly extract setActiveTab from the hook
    ConfirmationDialog
  } = useVoiceClone();

  useEffect(() => {
    const total = selectedSources.reduce((sum, recording) => sum + recording.duration, 0);
    setTotalSelectedDuration(total);
  }, [selectedSources, setTotalSelectedDuration]);

  const textToUse = activeTab === "enhanced" ? enhancedText : inputText;
  const isReadyToClone = selectedSources.length > 0 && textToUse.trim().length > 0;
  const hasEnoughCredits = credits.available > 0;
  const hasEnoughAudio = totalSelectedDuration >= 30;

  const handleGenerateVoice = async () => {
    if (!isReadyToClone || !hasEnoughCredits || !hasEnoughAudio) {
      if (!hasEnoughCredits) {
        toast({
          title: "Insufficient credits",
          description: "You need at least 1 credit to generate a voice memory.",
          variant: "destructive",
        });
        setShowCreditsOverlay(true);
      } else if (!hasEnoughAudio) {
        toast({
          title: "Insufficient audio",
          description: "You need at least 30 seconds of audio for voice cloning. 1 minute is recommended.",
          variant: "default",
        });
      }
      return;
    }

    const generatedUrl = await onGenerate(selectedSources[0], textToUse);
    if (!generatedUrl) {
      console.error("Failed to generate voice");
    }
  };

  return (
    <>
      <section className="mb-6 md:mb-8">
        <h3 className="text-lg md:text-xl font-playfair text-voicevault-tertiary mb-4">
          Select Voice Source
        </h3>
        <AudioSourceSelector 
          recordings={[]} 
          selectedRecordings={selectedSources}
          onSelectRecording={handleSourceSelect}
        />
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <span>
            {Math.floor(totalSelectedDuration / 60)}:{(totalSelectedDuration % 60).toString().padStart(2, '0')} selected
          </span>
          {totalSelectedDuration < 60 && (
            <span className="ml-2 text-amber-500">(1+ minutes recommended)</span>
          )}
        </div>
      </section>
      
      <section className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-playfair text-voicevault-tertiary">
            What would you like this voice to say?
          </h3>
        </div>
        
        <TextEnhancer 
          inputText={inputText}
          enhancedText={enhancedText}
          onTextChange={handleTextChange}
          onEnhance={handleEnhanceText}
          isEnhancing={isEnhancing}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </section>
      
      <section className="flex justify-center mb-6 md:mb-8">
        <Button 
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full 
          ${isReadyToClone && hasEnoughCredits && hasEnoughAudio ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300 cursor-not-allowed'} 
          text-white font-medium px-8 py-4 text-lg transition-colors focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
          disabled:opacity-50 ${isReadyToClone && hasEnoughCredits && hasEnoughAudio ? 'animate-pulse' : 'opacity-70'}`}
          onClick={handleGenerateVoice}
          disabled={!isReadyToClone || !hasEnoughCredits || !hasEnoughAudio || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Voice Memory...
            </>
          ) : (
            "Create Voice Memory"
          )}
        </Button>
      </section>
      
      <div className="text-center text-sm text-gray-500 mb-6">
        {!hasEnoughCredits && (
          <p className="text-red-500 font-medium">
            You need at least 1 credit to generate a voice memory.
          </p>
        )}
        {!hasEnoughAudio && hasEnoughCredits && (
          <p className="text-amber-500 font-medium">
            At least 30 seconds of audio is needed (1 minute recommended).
          </p>
        )}
        <p>
          Generation will use 1 credit. You have {credits.available} credit(s) remaining.
        </p>
      </div>
      
      <ConfirmationDialog />
    </>
  );
};

export default VoiceGenerationForm;
