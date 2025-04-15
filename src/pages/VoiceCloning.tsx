
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import VoiceCloneContent from "@/components/voice-cloning/VoiceCloneContent";
import CreditDisplay from "@/components/voice-cloning/monetization/CreditDisplay";
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
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-4 py-4 border-b bg-white">
            <CommonHeader />
            
            <CreditDisplay 
              credits={credits}
              onManageSubscription={handleManageSubscription}
              onAddCredits={handleAddCredits}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {showCreditsOverlay ? (
              <div className="container mx-auto px-4 py-6">
                <PricingCards />
              </div>
            ) : (
              <VoiceCloneContent />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const VoiceCloning: React.FC = () => (
  <MonetizationProvider>
    <VoiceCloningInner />
  </MonetizationProvider>
);

export default VoiceCloning;
