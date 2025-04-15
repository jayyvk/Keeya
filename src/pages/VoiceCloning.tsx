
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import VoiceCloneContent from "@/components/voice-cloning/VoiceCloneContent";
import CommonHeader from "@/components/CommonHeader";
import { motion } from "framer-motion";
import { MonetizationProvider } from "@/contexts/MonetizationContext";
import { Toaster } from "@/components/ui/sonner";

const VoiceCloning: React.FC = () => {
  return (
    <SidebarProvider>
      <MonetizationProvider>
        <motion.div 
          className="min-h-screen w-full bg-gradient-to-b from-voicevault-softpurple via-white to-white flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardSidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-b from-voicevault-softpurple to-transparent">
              <div className="flex justify-between items-center px-6 py-4">
                <CommonHeader title="Voice Cloning Studio" />
                {/* Removed redundant CreditDisplay */}
              </div>
            </div>

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
