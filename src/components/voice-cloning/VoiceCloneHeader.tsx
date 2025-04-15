
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

interface VoiceCloneHeaderProps {
  userName?: string;
}

const VoiceCloneHeader: React.FC<VoiceCloneHeaderProps> = ({ userName }) => {
  const navigate = useNavigate();

  const handleHeaderClick = () => {
    navigate("/dashboard");
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 
          className="text-xl font-bold text-voicevault-tertiary cursor-pointer hover:text-voicevault-primary transition-colors" 
          onClick={handleHeaderClick}
        >
          VoiceVault
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Hello, {userName || 'there'}
        </span>
      </div>
    </header>
  );
};

export default VoiceCloneHeader;
