
import React from "react";
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
        <PageTransition className="min-h-screen w-full bg-gradient-to-b from-voicevault-softpurple via-white to-white flex">
          <DashboardSidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-b from-voicevault-softpurple to-transparent">
              <div className="flex justify-between items-center px-6 py-4">
                <CommonHeader />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <VoiceCloneContent />
            </div>
          </div>
          <Toaster />
        </PageTransition>
      </MonetizationProvider>
    </SidebarProvider>
  );
};

export default VoiceCloning;
