import React, { useState, useEffect } from "react";
import { useRecording } from "@/contexts/RecordingContext";
import { useMonetization } from "@/contexts/MonetizationContext";
import { useVoiceClone } from "@/hooks/use-voice-clone";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import AudioSourceSelector from "./AudioSourceSelector";
import TextEnhancer from "./TextEnhancer";
import CloneResult from "./CloneResult";
import VoiceCloneIntro from "./VoiceCloneIntro";
import CreateVoiceMemoryButton from "./CreateVoiceMemoryButton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const VoiceCloneContent: React.FC = () => {
  const { recordings } = useRecording();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { credits, setShowCreditsOverlay } = useMonetization();
  
  const {
    selectedSources,
    inputText,
    enhancedText,
    isEnhancing,
    isCloning,
    clonedAudioUrl,
    totalSelectedDuration,
    activeTab,
    selectedModel,
    setActiveTab,
    setIsCloning,
    setClonedAudioUrl,
    handleSourceSelect,
    handleTextChange,
    handleEnhanceText,
    handleCreateVoiceMemory,
    setTotalSelectedDuration,
    ConfirmationDialog
  } = useVoiceClone();

  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

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
          variant: "warning",
        });
      }
      return;
    }

    setIsProcessing(true);

    try {
      const referenceAudio = selectedSources[0];
      if (!referenceAudio || !referenceAudio.audioUrl) {
        throw new Error("No reference audio selected");
      }

      const response = await supabase.functions.invoke('generate-voice', {
        body: {
          referenceAudioUrl: referenceAudio.audioUrl,
          text: textToUse,
          language: "en",
          emotion: "neutral",
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.output) {
        setClonedAudioUrl(response.data.output);
        toast({
          title: "Voice cloned successfully",
          description: "Your voice memory has been created.",
        });
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
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="mx-auto p-4 md:p-6 max-w-4xl">
      <VoiceCloneIntro />
      
      {!clonedAudioUrl ? (
        <>
          <section className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-playfair text-voicevault-tertiary mb-4">
              Select Voice Source
            </h3>
            <AudioSourceSelector 
              recordings={recordings} 
              selectedRecordings={selectedSources}
              onSelectRecording={handleSourceSelect}
              isMobile={isMobile}
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
            <button 
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full 
              ${isReadyToClone && hasEnoughCredits && hasEnoughAudio ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300 cursor-not-allowed'} 
              text-white font-medium px-8 py-4 text-lg transition-colors focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
              disabled:opacity-50 ${isReadyToClone && hasEnoughCredits && hasEnoughAudio ? 'animate-pulse' : 'opacity-70'}
              ${isMobile ? 'w-full' : ''}`}
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
            </button>
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
      ) : (
        <CloneResult 
          audioUrl={clonedAudioUrl}
          text={textToUse}
          onBack={() => setClonedAudioUrl(null)}
          isMobile={isMobile}
        />
      )}
    </main>
  );
};

export default VoiceCloneContent;
