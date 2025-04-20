
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CreateVoiceMemoryButtonProps {
  isReadyToClone: boolean;
  isCloning: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

const CreateVoiceMemoryButton: React.FC<CreateVoiceMemoryButtonProps> = ({
  isReadyToClone,
  isCloning,
  onClick,
  isMobile = false
}) => {
  return (
    <section className="flex justify-center mb-8">
      <Button 
        size={isMobile ? "default" : "lg"}
        className={`${isReadyToClone ? '' : 'opacity-70'} ${isMobile ? 'px-4 py-2 w-full' : 'px-8 py-5'} bg-voicevault-primary hover:bg-voicevault-secondary text-white rounded-full shadow-button`}
        onClick={onClick}
        disabled={!isReadyToClone || isCloning}
      >
        {isCloning ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Voice Memory...
          </>
        ) : (
          "Create Voice Memory"
        )}
      </Button>
    </section>
  );
};

export default CreateVoiceMemoryButton;
