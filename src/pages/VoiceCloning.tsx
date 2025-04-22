
import React, { Suspense, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import VoiceCloneContent from "@/components/voice-cloning/VoiceCloneContent";
import CommonHeader from "@/components/CommonHeader";
import { MonetizationProvider } from "@/contexts/MonetizationContext";
import { Toaster } from "@/components/ui/sonner";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import AuthRequiredModal from "@/components/AuthRequiredModal";

const VoiceCloning: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen={false}>
      <MonetizationProvider>
        <PageTransition className="bg-white min-h-screen w-full flex">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="">
              <div className="flex justify-between items-center px-6 py-4 bg-transparent">
                <CommonHeader />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Suspense fallback={<div className="p-8 text-center">Loading voice tools...</div>}>
                <VoiceCloneContent />
              </Suspense>
            </div>
          </div>
          <Toaster />
          <AuthRequiredModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </PageTransition>
      </MonetizationProvider>
    </SidebarProvider>
  );
};

export default VoiceCloning;
