import React from "react";
import { useRecording } from "@/contexts/RecordingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Wand2 } from "lucide-react";
import RecordButton from "@/components/RecordButton";
import RecordingTimer from "@/components/RecordingTimer";
import AudioWaveform from "@/components/AudioWaveform";
import RecordingReview from "@/components/RecordingReview";
import AudioVault from "@/components/AudioVault";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import CommonHeader from "@/components/CommonHeader";

const Dashboard: React.FC = () => {
  const {
    recordings,
    currentRecording,
    recordingStatus,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    saveRecording,
    discardRecording
  } = useRecording();
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
      toast({
        title: "Logged out successfully",
        description: "See you next time!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: "Please try again"
      });
    }
  };

  const goToVoiceCloning = () => {
    navigate("/voice-cloning");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-soft-gradient">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-b from-voicevault-softpurple to-transparent">
            <div className="container flex justify-between items-center py-4">
              <CommonHeader />
              <div className="flex items-center gap-compact">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="text-gray-500 hover:text-red-500"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="container flex-1 flex flex-col items-center justify-center py-section max-w-md mx-auto">
            {recordingStatus === "reviewing" && currentRecording ? (
              <RecordingReview 
                recordingBlob={currentRecording} 
                duration={recordingTime} 
                onSave={saveRecording} 
                onDiscard={discardRecording} 
              />
            ) : (
              <div className="w-full flex flex-col items-center justify-center">
                <div className="text-center mb-8 px-4">
                  <h2 className="text-header font-semibold text-voicevault-tertiary mb-2">
                    Record a Voice Memory
                  </h2>
                  <p className="text-gray-600 max-w-xs mx-auto">
                    Tap the microphone to start recording your precious voice memories
                  </p>
                </div>
                
                <RecordingTimer status={recordingStatus} time={recordingTime} />
                <AudioWaveform status={recordingStatus} />
                <RecordButton 
                  status={recordingStatus} 
                  onStart={startRecording} 
                  onStop={stopRecording} 
                  onPause={pauseRecording} 
                  onResume={resumeRecording} 
                />
                
                <div className="mt-12 text-center px-4">
                  <Button 
                    variant="outline" 
                    onClick={goToVoiceCloning}
                    className="w-full md:w-auto bg-white/50 border-voicevault-softpurple hover:bg-voicevault-softgray/50"
                  >
                    <Wand2 className="mr-2 h-4 w-4 text-voicevault-primary" />
                    Voice Cloning Studio
                  </Button>
                </div>
              </div>
            )}
          </main>
          
          {/* Audio Vault */}
          <AudioVault recordings={recordings} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
