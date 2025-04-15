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
    handleManageSubscription
  } = useMonetization();
  const handleHeaderClick = () => {
    navigate("/dashboard");
  };
  const handleAddCredits = () => {
    navigate("/pricing");
  };
  const showCredits = location.pathname === "/voice-cloning";
  return <div className="flex justify-between items-center w-full px-0 py-0">
      <div className="flex items-center gap-4 py-[16px] px-[5px]">
        <SidebarTrigger />
      </div>
      
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
        <h1 onClick={handleHeaderClick} className="text-2xl md:text-3xl font-bold text-voicevault-tertiary cursor-pointer hover:text-voicevault-primary transition-colors text-center">
          Keeya
        </h1>
      </div>
      
      <div className="flex items-center ">
        {showCredits && <CreditDisplay credits={credits} onManageSubscription={handleManageSubscription} onAddCredits={handleAddCredits} />}
        {title}
      </div>
    </div>;
};
export default CommonHeader;