import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Coins, CreditCard, Info } from "lucide-react";

interface CreditDisplayProps {
  credits: Credits;
  onManageSubscription: () => void;
  onAddCredits: () => void;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({
  credits,
  onManageSubscription,
  onAddCredits,
}) => {
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

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 h-8 px-3 bg-white/80 hover:bg-white"
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
            
            {subscriptionLabel && (
              <div className="bg-voicevault-softpurple/20 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current plan:</span>
                  <span className="font-semibold text-voicevault-primary">{subscriptionLabel}</span>
                </div>
                
                {credits.subscriptionEndsAt && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm">Renews on:</span>
                    <span className="text-sm">{formatDate(credits.subscriptionEndsAt)}</span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={onManageSubscription}
                >
                  Manage subscription
                </Button>
              </div>
            )}
            
            {!subscriptionLabel && (
              <Button 
                size="sm" 
                className="w-full"
                onClick={onAddCredits}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Add credits
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CreditDisplay;
