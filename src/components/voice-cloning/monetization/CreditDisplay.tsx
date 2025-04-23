import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Coins, CreditCard, Info } from "lucide-react";
import { Credits } from "@/types";
import { useNavigate } from "react-router-dom";

interface CreditDisplayProps {
  credits: Credits;
  onManageSubscription: () => void;
  onAddCredits: () => void;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({
  credits,
  onManageSubscription,
  onAddCredits
}) => {
  const navigate = useNavigate();

  // If out of credits, show the "Out of credits?" prompt with "Request More Credits" button.
  if (credits.available === 0) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="bg-white/90 border border-voicevault-softpurple/50 rounded-lg p-4 shadow-md text-gray-700 w-[260px]">
          <div className="font-bold text-sm mb-1 text-amber-600">Out of credits?</div>
          <p className="text-xs text-gray-600 mb-3">
            We’re still testing and improving Keeya every day.<br />
            <span className="whitespace-nowrap">For now, we’re giving away 5 more free credits if you help us with feedback.</span>
          </p>
          <button
            className="bg-voicevault-primary hover:bg-voicevault-secondary transition-colors text-white rounded px-3 py-2 w-full text-sm font-medium"
            onClick={() => navigate("/about")}
          >
            Request More Credits
          </button>
        </div>
      </div>
    );
  }

  // Format subscription end date
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  // Determine label for subscription tier
  const getSubscriptionLabel = () => {
    switch (credits.subscription) {
      case "basic":
        return "Basic";
      case "premium":
        return "Premium";
      default:
        return null;
    }
  };
  const subscriptionLabel = getSubscriptionLabel();
  const handleAddCredits = () => {
    // Close the popover and navigate to the pricing page
    navigate("/pricing");
  };
  return <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 bg-white/80 hover:bg-white px-[4px]">
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
            
            {subscriptionLabel && <div className="bg-voicevault-softpurple/20 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current plan:</span>
                  <span className="font-semibold text-voicevault-primary">{subscriptionLabel}</span>
                </div>
                
                {credits.subscriptionEndsAt && <div className="flex items-center justify-between mt-1">
                    <span className="text-sm">Renews on:</span>
                    <span className="text-sm">{formatDate(credits.subscriptionEndsAt)}</span>
                  </div>}
                
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={onManageSubscription}>
                  Manage subscription
                </Button>
              </div>}
            
            {!subscriptionLabel && <Button size="sm" className="w-full" onClick={handleAddCredits}>
                <CreditCard className="mr-2 h-4 w-4" />
                Add credits
              </Button>}
          </div>
        </PopoverContent>
      </Popover>
    </div>;
};

export default CreditDisplay;
