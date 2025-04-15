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
import { toast } from "sonner";
import CommonHeader from "@/components/CommonHeader";
import { MonetizationProvider } from "@/contexts/MonetizationContext";
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
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
      toast("Logged out successfully", {
        description: "See you next time!"
      });
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/auth");
      toast("Error during logout", {
        description: "You've been signed out anyway",
        style: {
          backgroundColor: 'red',
          color: 'white'
        }
      });
    }
  };
  const goToVoiceCloning = () => {
    navigate("/voice-cloning");
  };
  return <SidebarProvider>
      <MonetizationProvider>
        <div className="min-h-screen w-full bg-gradient-to-b from-voicevault-softpurple via-white to-white flex">
          <DashboardSidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-b from-voicevault-softpurple to-transparent">
              <div className="flex justify-between items-center px-6 py-4">
                <CommonHeader />
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-500">
                    <LogOut size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="container mx-auto p-6 pt-10 max-w-md flex-1 flex flex-col py-0 px-0">
                {recordingStatus === "reviewing" && currentRecording ? <RecordingReview recordingBlob={currentRecording} duration={recordingTime} onSave={saveRecording} onDiscard={discardRecording} /> : <div className="flex-1 flex flex-col items-center justify-center my-0 py-0">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-voicevault-tertiary mb-2">
                        Record a Voice Memory
                      </h2>
                      <p className="text-gray-600 max-w-xs mx-auto">
                        Tap the microphone to start recording your precious voice memories
                      </p>
                    </div>
                    
                    <RecordingTimer status={recordingStatus} time={recordingTime} />
                    
                    <AudioWaveform status={recordingStatus} />
                    
                    <RecordButton status={recordingStatus} onStart={startRecording} onStop={stopRecording} onPause={pauseRecording} onResume={resumeRecording} />
                    
                    <div className="mt-12 text-center">
                      <Button variant="outline" onClick={goToVoiceCloning} className="bg-voicevault-softgray/30 border-voicevault-softpurple hover:bg-voicevault-softgray/50">
                        <Wand2 className="mr-2 h-4 w-4 text-voicevault-primary" />
                        Voice Cloning Studio
                      </Button>
                    </div>
                  </div>}
              </main>
              
              {/* Audio Vault */}
              <div className="flex-shrink-0 overflow-hidden">
                <AudioVault recordings={recordings} />
              </div>
            </div>
          </div>
        </div>
      </MonetizationProvider>
    </SidebarProvider>;
};
export default Dashboard;