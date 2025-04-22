import React, { useState } from "react";
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
import AuthRequiredModal from "@/components/AuthRequiredModal";

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
    logout,
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postAuthAction, setPostAuthAction] = useState<(() => void) | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logged out successfully", {
        description: "See you next time!"
      });
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/");
      toast.error("Error during logout", {
        description: "You've been signed out anyway"
      });
    }
  };

  const attemptProtectedAction = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setAuthModalOpen(true);
      setPostAuthAction(() => action);
    }
  };

  const protectedSaveRecording = (title: string, tags: string[]) => {
    attemptProtectedAction(() => saveRecording(title, tags));
  };

  const goToVoiceCloning = () => {
    if (isAuthenticated) {
      navigate("/voice-cloning");
    } else {
      setAuthModalOpen(true);
      setPostAuthAction(() => () => navigate("/voice-cloning"));
    }
  };

  const onCloseAuthModal = () => setAuthModalOpen(false);

  return (
    <SidebarProvider>
      <MonetizationProvider>
        <div className="bg-white min-h-screen w-full flex">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="">
              <div className="flex justify-between items-center px-6 py-[10px] bg-transparent">
                <CommonHeader />
                {isAuthenticated && (
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:bg-red-50">
                      <LogOut size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
              <main className="container mx-auto max-w-md w-full flex-1 flex flex-col justify-center items-center px-6">
                {recordingStatus === "reviewing" && currentRecording ? (
                  <RecordingReview
                    recordingBlob={currentRecording}
                    duration={recordingTime}
                    onSave={protectedSaveRecording}
                    onDiscard={discardRecording}
                    className="my-8 card-modern py-[2px]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-6 w-full">
                    <div>
                      <h2 className="text-heading font-bold text-[#1A1A1A] mb-2 my-2">
                        Record a Voice Memory
                      </h2>
                      <p className="text-body text-[#333333] max-w-xs my-0">
                        Tap the microphone to start recording your precious voice memories
                      </p>
                    </div>
                    <RecordingTimer status={recordingStatus} time={recordingTime} />
                    <AudioWaveform status={recordingStatus} />
                    <div className="transform scale-95">
                      <RecordButton
                        status={recordingStatus}
                        onStart={startRecording}
                        onStop={stopRecording}
                        onPause={pauseRecording}
                        onResume={resumeRecording}
                      />
                    </div>
                    <div className="flex flex-col items-center space-y-2 w-full">
                      <Button
                        variant="outline"
                        onClick={goToVoiceCloning}
                        className="bg-white border-2 border-[#F0F0F0] hover:bg-[#F8F8FC] w-full font-medium py-0 my-4 shadow-button"
                      >
                        <Wand2 className="mr-2 h-4 w-4 text-voicevault-primary" />
                        Voice Cloning Studio
                      </Button>
                    </div>
                  </div>
                )}
              </main>
              <div className="flex-shrink-0 overflow-hidden w-full">
                <AudioVault recordings={recordings} />
              </div>
            </div>
          </div>
          <AuthRequiredModal open={authModalOpen} onClose={onCloseAuthModal} next={postAuthAction} />
        </div>
      </MonetizationProvider>
    </SidebarProvider>
  );
};

export default Dashboard;
