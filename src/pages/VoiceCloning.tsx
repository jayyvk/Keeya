
import React, { useState, useEffect } from "react";
import { useRecording } from "@/contexts/RecordingContext";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Recording } from "@/types";
import AudioSourceSelector from "@/components/voice-cloning/AudioSourceSelector";
import TextEnhancer from "@/components/voice-cloning/TextEnhancer";
import CloneResult from "@/components/voice-cloning/CloneResult";
import VoiceCloneHeader from "@/components/voice-cloning/VoiceCloneHeader";
import VoiceCloneIntro from "@/components/voice-cloning/VoiceCloneIntro";
import CreateVoiceMemoryButton from "@/components/voice-cloning/CreateVoiceMemoryButton";

const VoiceCloning: React.FC = () => {
  const { recordings } = useRecording();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [selectedSources, setSelectedSources] = useState<Recording[]>([]);
  const [inputText, setInputText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [totalSelectedDuration, setTotalSelectedDuration] = useState(0);
  
  useEffect(() => {
    const total = selectedSources.reduce((sum, recording) => sum + recording.duration, 0);
    setTotalSelectedDuration(total);
  }, [selectedSources]);
  
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
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-b from-voicevault-softpurple via-white to-white flex">
        <DashboardSidebar />
        
        <div className="flex-1 overflow-x-hidden">
          <VoiceCloneHeader userName={user?.name} />

          <main className="mx-auto p-4 md:p-6 max-w-4xl">
            <VoiceCloneIntro />
            
            {!clonedAudioUrl ? (
              <>
                <section className="mb-6 md:mb-8">
                  <h3 className="text-lg md:text-xl font-playfair text-voicevault-tertiary mb-4">Select Voice Source</h3>
                  <AudioSourceSelector 
                    recordings={recordings} 
                    selectedRecordings={selectedSources}
                    onSelectRecording={handleSourceSelect}
                    isMobile={isMobile}
                  />
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <span>{Math.floor(totalSelectedDuration / 60)}:{(totalSelectedDuration % 60).toString().padStart(2, '0')} selected</span>
                    {totalSelectedDuration < 60 && (
                      <span className="ml-2 text-amber-500">(1+ minutes recommended)</span>
                    )}
                  </div>
                </section>
                
                <section className="mb-6 md:mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg md:text-xl font-playfair text-voicevault-tertiary">What would you like this voice to say?</h3>
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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default VoiceCloning;
