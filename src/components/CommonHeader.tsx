import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useMonetization } from "@/contexts/MonetizationContext";
import CreditDisplay from "./voice-cloning/monetization/CreditDisplay";
interface CommonHeaderProps {
  title?: string;
}
const CommonHeader: React.FC<CommonHeaderProps> = ({
  title
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    credits,
    handleManageSubscription,
    handleAddCredits
  } = useMonetization();
  const handleHeaderClick = () => {
    navigate("/dashboard");
  };
  const showCredits = location.pathname === "/voice-cloning";
  return <div className="flex justify-between items-center w-full px-0 py-0">
      <div className="flex items-center gap-4 py-[16px] px-[5px]">
        <SidebarTrigger />
        <h1 onClick={handleHeaderClick} className="text-2xl md:text-3xl font-bold text-voicevault-tertiary cursor-pointer hover:text-voicevault-primary transition-colors px-0 mx-[50px]">
          VoiceVault
        </h1>
      </div>
      
      <div className="flex items-center gap-4 pr-6">
        {showCredits && <CreditDisplay credits={credits} onManageSubscription={handleManageSubscription} onAddCredits={handleAddCredits} />}
        {title && <span className="text-lg md:text-xl">{title}</span>}
      </div>
    </div>;
};
export default CommonHeader;