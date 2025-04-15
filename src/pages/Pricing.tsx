
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PricingCards } from "@/components/voice-cloning/monetization/PricingCards";
import CommonHeader from "@/components/CommonHeader";

const Pricing: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-b from-voicevault-softpurple via-white to-white flex">
        <DashboardSidebar />
        
        <div className="flex-1 overflow-x-hidden">
          <CommonHeader title="Pricing Plans" />
          <PricingCards />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Pricing;
