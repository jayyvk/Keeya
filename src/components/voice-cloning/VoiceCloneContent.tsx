
import React from "react";
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
    setIsCloning,
    setClonedAudioUrl,
    handleSourceSelect,
    handleTextChange,
    handleEnhanceText,
    setTotalSelectedDuration
  } = useVoiceClone();

  React.useEffect(() => {
    const total = selectedSources.reduce((sum, recording) => sum + recording.duration, 0);
    setTotalSelectedDuration(total);
  }, [selectedSources, setTotalSelectedDuration]);

  const handleCreateVoiceMemory = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No audio selected",
        description: "Please select at least one recording as a voice source.",
        variant: "destructive",
      });
      return;
    }

    if (!inputText.trim() && !enhancedText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter what you'd like this voice to say.",
        variant: "destructive",
      });
      return;
    }

    if (credits.available <= 0 && !credits.subscription) {
      setShowCreditsOverlay(true);
      return;
    }

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

  const textToUse = enhancedText || inputText;
  const isReadyToClone = selectedSources.length > 0 && textToUse.trim().length > 0;

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
            />
          </section>
          
          <CreateVoiceMemoryButton
            isReadyToClone={isReadyToClone}
            isCloning={isCloning}
            onClick={handleCreateVoiceMemory}
            isMobile={isMobile}
          />
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
