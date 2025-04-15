
import React from "react";
import { Save, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  isSaving: boolean;
  isSharing: boolean;
  onSave: () => void;
  onShare: () => void;
  isMobile?: boolean;
  // Add credit-related props
  hasPremiumFeatures?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSaving,
  isSharing,
  onSave,
  onShare,
  isMobile = false,
  hasPremiumFeatures = false,
}) => {
  // This button text now changes based on premium status
  const saveButtonText = hasPremiumFeatures ? "Save to Family Vault" : "Save to Vault";

  return (
    <div className={`${isMobile ? 'flex flex-col' : 'flex'} gap-4`}>
      <Button 
        className={`${isMobile ? 'w-full mb-2' : 'flex-1'} ${hasPremiumFeatures ? 'bg-voicevault-primary hover:bg-voicevault-primary/90' : ''}`}
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {saveButtonText}
          </>
        )}
      </Button>
      
      <Button 
        variant="outline" 
        className={`${isMobile ? 'w-full' : 'flex-1'}`}
        onClick={onShare}
        disabled={isSharing}
      >
        {isSharing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Link...
          </>
        ) : (
          <>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </>
        )}
      </Button>
    </div>
  );
};

export default ActionButtons;
