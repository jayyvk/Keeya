
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import VoiceCloneHeader from "@/components/voice-cloning/VoiceCloneHeader";
import VoiceCloneContent from "@/components/voice-cloning/VoiceCloneContent";
import CreditDisplay from "@/components/voice-cloning/monetization/CreditDisplay";
import CreditsOverlay from "@/components/voice-cloning/monetization/CreditsOverlay";
import { MonetizationProvider, useMonetization } from "@/contexts/MonetizationContext";

const VoiceCloningInner: React.FC = () => {
  const { 
    credits, 
    isNewUser, 
    showCreditsOverlay, 
    handlePurchase, 
    handleManageSubscription,
    handleAddCredits,
    setShowCreditsOverlay 
  } = useMonetization();

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-b from-voicevault-softpurple via-white to-white flex">
        <DashboardSidebar />
        
        <div className="flex-1 overflow-x-hidden">
          <div className="flex justify-between items-center px-4 py-4 border-b bg-white">
            <VoiceCloneHeader />
            
            <CreditDisplay 
              credits={credits}
              onManageSubscription={handleManageSubscription}
              onAddCredits={handleAddCredits}
            />
          </div>

          <VoiceCloneContent />
        </div>
      </div>
      
      <CreditsOverlay 
        isOpen={showCreditsOverlay}
        onClose={() => setShowCreditsOverlay(false)}
        onPurchase={handlePurchase}
        selectedVoiceName={undefined}
        isNewUser={isNewUser}
        credits={credits}
      />
    </SidebarProvider>
  );
};

const VoiceCloning: React.FC = () => (
  <MonetizationProvider>
    <VoiceCloningInner />
  </MonetizationProvider>
);

export default VoiceCloning;
