
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import VoiceCloneContent from "@/components/voice-cloning/VoiceCloneContent";
import CreditDisplay from "@/components/voice-cloning/monetization/CreditDisplay";
import CreditsOverlay from "@/components/voice-cloning/monetization/CreditsOverlay";
import { MonetizationProvider, useMonetization } from "@/contexts/MonetizationContext";
import { PricingCards } from "@/components/voice-cloning/monetization/PricingCards";
import CommonHeader from "@/components/CommonHeader";

const VoiceCloningInner: React.FC = () => {
  const { 
    credits, 
    isNewUser, 
    showCreditsOverlay,
    isProcessingPayment,
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
            <CommonHeader />
            
            <CreditDisplay 
              credits={credits}
              onManageSubscription={handleManageSubscription}
              onAddCredits={handleAddCredits}
            />
          </div>

          {showCreditsOverlay && <PricingCards />}
          {!showCreditsOverlay && <VoiceCloneContent />}
        </div>
      </div>
      
      <CreditsOverlay 
        isOpen={showCreditsOverlay}
        onClose={() => setShowCreditsOverlay(false)}
        onPurchase={handlePurchase}
        selectedVoiceName={undefined}
        isNewUser={isNewUser}
        credits={credits}
        isProcessingPayment={isProcessingPayment}
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
