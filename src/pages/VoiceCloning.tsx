
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import VoiceCloneContent from "@/components/voice-cloning/VoiceCloneContent";
import CommonHeader from "@/components/CommonHeader";
import { motion } from "framer-motion";
import { MonetizationProvider } from "@/contexts/MonetizationContext";
import { Toaster } from "@/components/ui/sonner";
import { useMonetization } from "@/contexts/MonetizationContext";

const VoiceCloning: React.FC = () => {
  return (
    <SidebarProvider>
      <MonetizationProvider>
        <motion.div 
          className="min-h-screen w-full bg-voicevault-softpurple/30 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardSidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <CommonHeader title="Voice Cloning Studio" />
            <div className="flex-1 overflow-y-auto">
              <VoiceCloneContent />
            </div>
          </div>
          <Toaster />
        </motion.div>
      </MonetizationProvider>
    </SidebarProvider>
  );
};

export default VoiceCloning;
