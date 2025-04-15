
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PricingCards } from "@/components/voice-cloning/monetization/PricingCards";

const Pricing: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-b from-voicevault-softpurple via-white to-white flex">
        <DashboardSidebar />
        
        <div className="flex-1 overflow-x-hidden">
          <div className="flex justify-between items-center px-4 py-4 border-b bg-white">
            <h1 className="text-2xl font-semibold text-gray-900">Buy Voice Credits</h1>
          </div>

          <PricingCards />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Pricing;
