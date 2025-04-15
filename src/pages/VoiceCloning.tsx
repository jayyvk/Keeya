import React, { useState, useEffect } from "react";
import { useRecording } from "@/contexts/RecordingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { Recording } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import AudioSourceSelector from "@/components/voice-cloning/AudioSourceSelector";
import TextEnhancer from "@/components/voice-cloning/TextEnhancer";
import CloneResult from "@/components/voice-cloning/CloneResult";
import { Wand2, Loader2 } from "lucide-react";

const VoiceCloning: React.FC = () => {
  const { recordings } = useRecording();
  const { user } = useAuth();
  const navigate = useNavigate();
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
  
  const handleHeaderClick = () => {
    navigate("/dashboard");
  };

  const textToUse = enhancedText || inputText;
  const isReadyToClone = selectedSources.length > 0 && textToUse.trim().length > 0;
  
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-b from-voicevault-softpurple via-white to-white flex">
        <DashboardSidebar />
        
        <div className="flex-1 overflow-x-hidden">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 
                className="text-xl font-bold text-voicevault-tertiary cursor-pointer hover:text-voicevault-primary transition-colors" 
                onClick={handleHeaderClick}
              >
                VoiceVault
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hello, {user?.name || 'there'}
              </span>
            </div>
          </header>

          <main className="mx-auto p-4 md:p-6 max-w-4xl">
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-voicevault-tertiary mb-2 font-playfair">
                Voice Cloning Studio
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Preserve the voices you love by creating AI-generated voice memories that sound just like them.
              </p>
            </div>
            
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
                  
                  <Card className="mb-4">
                    <CardContent className="pt-6">
                      <TextEnhancer 
                        inputText={inputText}
                        enhancedText={enhancedText}
                        onTextChange={handleTextChange}
                        onEnhance={handleEnhanceText}
                        isEnhancing={isEnhancing}
                      />
                    </CardContent>
                  </Card>
                </section>
                
                <section className="flex justify-center mb-6 md:mb-8">
                  <Button 
                    size={isMobile ? "default" : "lg"}
                    className={`${isReadyToClone ? 'animate-pulse' : 'opacity-70'} ${isMobile ? 'px-4 py-2 text-base w-full' : 'px-8 py-6 text-lg'}`}
                    onClick={handleCreateVoiceMemory}
                    disabled={!isReadyToClone || isCloning}
                  >
                    {isCloning ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Voice Memory...
                      </>
                    ) : (
                      "Create Voice Memory"
                    )}
                  </Button>
                </section>
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
