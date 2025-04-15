
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PricingCards } from "@/components/voice-cloning/monetization/PricingCards";
import CommonHeader from "@/components/CommonHeader";

const Pricing: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-b from-voicevault-softpurple via-white to-white">
        <DashboardSidebar />
        <div className="flex-1 overflow-x-hidden">
          <CommonHeader />
          <div className="max-w-7xl mx-auto px-4">
            <PricingCards />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Pricing;
