
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PricingCards } from "@/components/voice-cloning/monetization/PricingCards";
import CommonHeader from "@/components/CommonHeader";
import { motion } from "framer-motion";
import { MonetizationProvider } from "@/contexts/MonetizationContext";

const Pricing: React.FC = () => {
  return (
    <SidebarProvider>
      <MonetizationProvider>
        <motion.div 
          className="bg-white min-h-screen w-full flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="">
              <div className="flex justify-between items-center px-6 py-4 bg-transparent">
                <CommonHeader />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-4 py-6">
                <PricingCards />
              </div>
            </div>
          </div>
        </motion.div>
      </MonetizationProvider>
    </SidebarProvider>
  );
};

export default Pricing;
