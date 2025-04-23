
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Coins, Info } from "lucide-react";
import { Credits } from "@/types";
import { useNavigate } from "react-router-dom";

interface CreditDisplayProps {
  credits: Credits;
  onManageSubscription: () => void;
  onAddCredits: () => void;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({
  credits
}) => {
  const navigate = useNavigate();

  const handleRequestCredits = () => {
    navigate("/about");
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 bg-white/80 hover:bg-white px-[4px]">
            <Coins className="h-4 w-4 text-voicevault-primary" />
            <span className="text-voicevault-tertiary">{credits.available}</span>
            <Info className="h-3 w-3 text-gray-400 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-0">Your Voice Credits</h4>
              <p className="text-sm text-gray-500 mt-1 mb-3">
                Credits let you transform text into voice memories.
              </p>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Available credits:</span>
              <span className="font-semibold">{credits.available}</span>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleRequestCredits}
            >
              Request More Credits
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CreditDisplay;
