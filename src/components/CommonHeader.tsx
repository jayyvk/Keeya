
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useMonetization, MonetizationProvider } from "@/contexts/MonetizationContext";
import CreditDisplay from "./voice-cloning/monetization/CreditDisplay";

interface CommonHeaderProps {
  title?: string;
}

// Create a wrapped version that ensures the MonetizationProvider is present
const CommonHeaderWithProvider: React.FC<CommonHeaderProps> = (props) => {
  return (
    <MonetizationProvider>
      <CommonHeaderContent {...props} />
    </MonetizationProvider>
  );
};

// The actual content of the header
const CommonHeaderContent: React.FC<CommonHeaderProps> = ({
  title
}) => {
  const navigate = useNavigate();
  const { credits, handleManageSubscription, handleAddCredits } = useMonetization();
  
  const handleHeaderClick = () => {
    navigate("/dashboard");
  };
  
  return (
    <div className="flex justify-between items-center w-full px-0 py-0">
      <div className="flex items-center gap-4 py-[16px] px-[5px]">
        <SidebarTrigger />
        <h1 
          onClick={handleHeaderClick} 
          className="text-2xl md:text-3xl font-bold text-voicevault-tertiary cursor-pointer hover:text-voicevault-primary transition-colors px-[65px]"
        >
          VoiceVault
        </h1>
      </div>
      
      <div className="flex items-center gap-4 pr-6">
        <CreditDisplay 
          credits={credits}
          onManageSubscription={handleManageSubscription}
          onAddCredits={handleAddCredits}
        />
        {title && <span className="text-lg md:text-xl">{title}</span>}
      </div>
    </div>
  );
};

// Export the wrapped component by default
export default CommonHeaderWithProvider;
