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
  return <div className="flex justify-between items-center w-full px-0 py-0">
      <div className="flex items-center gap-4 py-[16px] px-[5px]">
        <SidebarTrigger />
        <h1 className="text-xl font-bold text-voicevault-tertiary cursor-pointer hover:text-voicevault-primary transition-colors" onClick={handleHeaderClick}>
          VoiceVault
        </h1>
      </div>
      {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
    </div>;
};
export default CommonHeader;