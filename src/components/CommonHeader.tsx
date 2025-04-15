
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

interface CommonHeaderProps {
  title?: string;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  title
}) => {
  const navigate = useNavigate();
  const handleHeaderClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex justify-between items-center w-full px-0 py-0">
      <div className="flex items-center gap-4 py-[16px] px-[5px]">
        <SidebarTrigger className="text-gray-500 hover:text-voicevault-primary" />
        <h1 
          onClick={handleHeaderClick} 
          className="text-xl font-bold text-voicevault-tertiary cursor-pointer hover:text-voicevault-primary transition-colors px-[65px]"
        >
          VoiceVault
        </h1>
      </div>
      {title}
    </div>
  );
};

export default CommonHeader;
