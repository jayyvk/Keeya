
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useMonetization } from "@/contexts/MonetizationContext";
import { Coins, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CommonHeaderProps {
  title?: string;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { credits, handleManageSubscription, handleAddCredits } = useMonetization();

  const handleHeaderClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="sticky top-0 z-10 bg-voicevault-softpurple/80 backdrop-blur-sm border-b border-purple-200/50">
      <div className="flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 
            onClick={handleHeaderClick} 
            className="text-2xl md:text-3xl font-bold text-voicevault-tertiary cursor-pointer hover:text-voicevault-primary transition-colors"
          >
            VoiceVault
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Always show credits in header */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 h-8 px-3 bg-white/80 hover:bg-white rounded-full"
              >
                <Coins className="h-4 w-4 text-voicevault-primary" />
                <span className="text-voicevault-tertiary">{credits.available}</span>
                <Info className="h-3 w-3 text-gray-400 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Your Voice Credits</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Credits let you transform text into voice memories
                  </p>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm">Available credits:</span>
                  <span className="font-semibold">{credits.available}</span>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={handleAddCredits}
                >
                  Add credits
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {title && (
            <h2 className="text-lg md:text-xl font-medium text-voicevault-tertiary">
              {title}
            </h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonHeader;
