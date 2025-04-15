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
    activeTab,
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

  React.useEffect(() => {
    const total = selectedSources.reduce((sum, recording) => sum + recording.duration, 0);
    setTotalSelectedDuration(total);
  }, [selectedSources, setTotalSelectedDuration]);

  const textToUse = activeTab === "enhanced" ? enhancedText : inputText;
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
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </section>
          
          <CreateVoiceMemoryButton
            isReadyToClone={isReadyToClone}
            isCloning={isCloning}
            onClick={handleCreateVoiceMemory}
            isMobile={isMobile}
          />
          
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
