
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Gift, Loader, Sparkles, Star } from "lucide-react";
import { Credits, PaymentType } from "@/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreditsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (type: PaymentType) => void;
  selectedVoiceName?: string;
  isNewUser: boolean;
  credits: Credits;
  isProcessingPayment?: boolean;
}

const CreditsOverlay: React.FC<CreditsOverlayProps> = ({
  isOpen,
  onClose,
  onPurchase,
  selectedVoiceName = "this person",
  isNewUser,
  credits,
  isProcessingPayment = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={isProcessingPayment ? undefined : onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-playfair text-voicevault-tertiary">
            Bring this memory to life in {selectedVoiceName}'s voice
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Transform your text into a cherished voice memory
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-6 py-4">
            {isNewUser && (
              <div className="bg-gradient-to-r from-voicevault-softpurple to-voicevault-primary/20 p-4 rounded-lg text-center">
                <Gift className="h-12 w-12 mx-auto mb-2 text-voicevault-primary" />
                <h3 className="font-semibold text-voicevault-tertiary text-lg mb-1">Your first memory is on us</h3>
                <p className="text-sm text-gray-600 mb-3">Experience the magic of voice preservation</p>
                <Button 
                  onClick={() => onPurchase('one-time')}
                  className="w-full bg-white text-voicevault-primary hover:bg-gray-100"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create your free voice memory
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-1">Single Memory</h3>
                  <p className="text-sm text-gray-500">Perfect for occasional use</p>
                </div>
                <div className="text-2xl font-bold mb-4">$2.00</div>
                <ul className="text-sm space-y-2 mb-6 flex-grow">
                  <li className="flex items-start">
                    <Star className="h-4 w-4 text-voicevault-primary mr-2 mt-0.5" />
                    <span>One voice generation</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-4 w-4 text-voicevault-primary mr-2 mt-0.5" />
                    <span>Up to 2 minutes of audio</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  onClick={() => onPurchase('one-time')}
                  className="w-full mt-auto"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Activate this memory
                    </>
                  )}
                </Button>
              </div>

              <div className="border-2 border-voicevault-primary rounded-lg p-4 flex flex-col relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-voicevault-primary text-white text-xs py-1 px-2 rounded-full">
                  Best Value
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-1">Memory Keeper</h3>
                  <p className="text-sm text-gray-500">Create unlimited memories</p>
                </div>
                <div className="text-2xl font-bold mb-4">$10.00<span className="text-sm font-normal">/month</span></div>
                <ul className="text-sm space-y-2 mb-6 flex-grow">
                  <li className="flex items-start">
                    <Star className="h-4 w-4 text-voicevault-primary mr-2 mt-0.5" />
                    <span>Unlimited voice generations</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-4 w-4 text-voicevault-primary mr-2 mt-0.5" />
                    <span>Up to 5 minutes per memory</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-4 w-4 text-voicevault-primary mr-2 mt-0.5" />
                    <span>Family sharing</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="h-4 w-4 text-voicevault-primary mr-2 mt-0.5" />
                    <span>Higher quality voice models</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => onPurchase('subscription')}
                  className="w-full mt-auto"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Unlock unlimited memories
                    </>
                  )}
                </Button>
              </div>
            </div>

            {credits.available > 0 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                You have {credits.available} credit{credits.available !== 1 ? 's' : ''} remaining
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsOverlay;
