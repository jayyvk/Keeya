
import React from "react";
import { useRecording } from "@/contexts/RecordingContext";
import { useVoiceGeneration } from "@/hooks/use-voice-generation";
import VoiceCloneIntro from "./VoiceCloneIntro";
import VoiceGenerationForm from "./VoiceGenerationForm";
import CloneResult from "./CloneResult";
import { useIsMobile } from "@/hooks/use-mobile";

const VoiceCloneContent: React.FC = () => {
  const { recordings } = useRecording();
  const isMobile = useIsMobile();
  const {
    isProcessing,
    generatedAudioUrl,
    generateVoice,
    setGeneratedAudioUrl
  } = useVoiceGeneration();
  
  return (
    <main className="mx-auto p-4 md:p-6 max-w-4xl">
      <VoiceCloneIntro />
      
      {!generatedAudioUrl ? (
        <VoiceGenerationForm 
          onGenerate={generateVoice}
          isProcessing={isProcessing}
        />
      ) : (
        <CloneResult 
          audioUrl={generatedAudioUrl}
          text={""}
          onBack={() => setGeneratedAudioUrl(null)}
          isMobile={isMobile}
        />
      )}
    </main>
  );
};

export default VoiceCloneContent;
