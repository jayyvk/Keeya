import React, { useState, useEffect } from "react";
import { useRecording } from "@/contexts/RecordingContext";
import { useMonetization } from "@/contexts/MonetizationContext";
import { useVoiceClone } from "@/hooks/use-voice-clone";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WaitlistModal } from "./WaitlistModal";
import AudioSourceSelector from "./AudioSourceSelector";
import TextEnhancer from "./TextEnhancer";
import CloneResult from "./CloneResult";
import VoiceCloneIntro from "./VoiceCloneIntro";
import CreateVoiceMemoryButton from "./CreateVoiceMemoryButton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
const VoiceCloneContent: React.FC = () => {
  const {
    recordings
  } = useRecording();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const {
    credits,
    refreshCredits,
    handleAddCredits,
    handleManageSubscription
  } = useMonetization();
  const {
    user
  } = useAuth();
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
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [selectedVoiceEngine, setSelectedVoiceEngine] = useState<'standard' | 'elevenlabs'>('standard');
  useEffect(() => {
    if (user) {
      refreshCredits();
    }
  }, [user, refreshCredits]);
  useEffect(() => {
    const total = selectedSources.reduce((sum, recording) => sum + recording.duration, 0);
    setTotalSelectedDuration(total);
  }, [selectedSources, setTotalSelectedDuration]);
  const textToUse = activeTab === "enhanced" ? enhancedText : inputText;
  const isReadyToClone = selectedSources.length > 0 && textToUse.trim().length > 0;
  const hasEnoughCredits = credits.available > 0;
  const hasEnoughAudio = totalSelectedDuration >= 30;
  const handleGenerateVoice = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to generate a voice memory.",
        variant: "destructive"
      });
      return;
    }
    if (!isReadyToClone || !hasEnoughCredits || !hasEnoughAudio) {
      if (!hasEnoughCredits) {
        toast({
          title: "Insufficient credits",
          description: "You need at least 1 credit to generate a voice memory.",
          variant: "destructive"
        });
      } else if (!hasEnoughAudio) {
        toast({
          title: "Insufficient audio",
          description: "You need at least 30 seconds of audio for voice cloning. 1 minute is recommended.",
          variant: "default"
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
          userId: user.id
        }
      });
      if (response.error) {
        throw new Error(response.error.message || "Failed to generate voice");
      }
      if (response.data?.output) {
        const {
          data: savedMemory,
          error: saveError
        } = await supabase.from('voice_memories').insert({
          user_id: user.id,
          title: `Generated Voice - ${new Date().toLocaleDateString()}`,
          file_url: response.data.output,
          duration: 0,
          file_type: 'audio/mpeg',
          tags: ['generated', 'voice-clone']
        }).select().single();
        if (saveError) {
          console.error("Error saving voice memory:", saveError);
          throw new Error("Failed to save voice memory");
        }
        setClonedAudioUrl(response.data.output);
        toast({
          title: "Voice cloned successfully",
          description: "Your voice memory has been saved to your vault."
        });
        await refreshCredits();
      } else {
        throw new Error("No output returned from the API");
      }
    } catch (error) {
      console.error("Error generating voice:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate voice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleElevenLabsClick = () => {
    setIsWaitlistModalOpen(true);
  };
  return <main className="mx-auto p-4 md:p-6 max-w-4xl">
      <div className="bg-[#F6F6F6] border border-voicevault-softpurple/30 rounded-2xl p-4 mb-6 flex items-start space-x-3">
        <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-base mb-2">Voice Engine Notice</h3>
          <p className="text-sm text-gray-700">
            We're currently using our own lightweight voice engine to generate cloned voices. 
            ElevenLabs integration is coming soon for ultra-realistic voice memories.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Thanks for being part of the early access — your feedback helps us improve. 💜
          </p>
        </div>
      </div>

      {!clonedAudioUrl ? <>
          <section className="mb-6 md:mb-8">
            <AudioSourceSelector recordings={recordings} selectedRecordings={selectedSources} onSelectRecording={handleSourceSelect} isMobile={isMobile} />
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <span>
                {Math.floor(totalSelectedDuration / 60)}:{(totalSelectedDuration % 60).toString().padStart(2, '0')} selected
              </span>
              {totalSelectedDuration < 60 && <span className="ml-2 text-amber-500">(1+ minutes recommended)</span>}
            </div>
          </section>
          
          <section className="mb-6 md:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-playfair text-voicevault-tertiary">
                What would you like this voice to say?
              </h3>
            </div>
            
            <TextEnhancer inputText={inputText} enhancedText={enhancedText} onTextChange={handleTextChange} onEnhance={handleEnhanceText} isEnhancing={isEnhancing} activeTab={activeTab} onTabChange={setActiveTab} />
          </section>
          
          <div className="bg-white border border-voicevault-softpurple/20 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-base mb-4">Choose Voice Engine:</h3>
            <RadioGroup value={selectedVoiceEngine} onValueChange={(value: 'standard' | 'elevenlabs') => setSelectedVoiceEngine(value)} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="flex-1">
                  Standard (Fast, beta-level quality)
                </Label>
              </div>
              <div className="flex items-center space-x-2 opacity-50">
                <RadioGroupItem value="elevenlabs" id="elevenlabs" disabled onClick={handleElevenLabsClick} />
                <Label htmlFor="elevenlabs" className="flex-1 flex items-center">
                  ElevenLabs (Coming Soon – ultra-realistic)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        
                      </TooltipTrigger>
                      <TooltipContent>
                        We're working to integrate ElevenLabs soon. 
                        Join our waitlist to be first to try it!
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <section className="flex justify-center mb-6 md:mb-8">
            <button className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full 
              ${isReadyToClone && hasEnoughCredits && hasEnoughAudio ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300 cursor-not-allowed'} 
              text-white font-medium px-8 py-4 text-lg transition-colors focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
              disabled:opacity-50 ${isReadyToClone && hasEnoughCredits && hasEnoughAudio ? 'animate-pulse' : 'opacity-70'}
              ${isMobile ? 'w-full' : ''}`} onClick={handleGenerateVoice} disabled={!isReadyToClone || !hasEnoughCredits || !hasEnoughAudio || isProcessing}>
              {isProcessing ? <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Voice Memory...
                </> : "Create Voice Memory"}
            </button>
          </section>
          
          <div className="text-center text-sm text-gray-500 mb-6">
            {!hasEnoughCredits && <p className="text-red-500 font-medium">
                You need at least 1 credit to generate a voice memory.
              </p>}
            {!hasEnoughAudio && hasEnoughCredits && <p className="text-amber-500 font-medium">
                At least 30 seconds of audio is needed (1 minute recommended).
              </p>}
            <p>
              Generation will use 1 credit. You have {credits.available} credit{credits.available !== 1 ? 's' : ''} remaining.
            </p>
          </div>
          
          <ConfirmationDialog />
        </> : <CloneResult audioUrl={clonedAudioUrl} text={textToUse} onBack={() => setClonedAudioUrl(null)} isMobile={isMobile} />}
    </main>;
};
export default VoiceCloneContent;