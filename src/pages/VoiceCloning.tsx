import React, { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import VoiceCloneContent from "@/components/voice-cloning/VoiceCloneContent";
import CommonHeader from "@/components/CommonHeader";
import { MonetizationProvider } from "@/contexts/MonetizationContext";
import { Toaster } from "@/components/ui/sonner";
import PageTransition from "@/components/PageTransition";

const VoiceCloning: React.FC = () => {
  return (
    <SidebarProvider>
      <MonetizationProvider>
        <PageTransition className="keeya-bg min-h-screen w-full flex">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="">
              <div className="flex justify-between items-center px-6 py-4">
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
        </PageTransition>
      </MonetizationProvider>
    </SidebarProvider>
  );
};

export default VoiceCloning;
