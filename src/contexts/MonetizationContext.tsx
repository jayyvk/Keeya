
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Credits, PaymentType } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface MonetizationContextType {
  credits: Credits;
  isNewUser: boolean;
  showCreditsOverlay: boolean;
  setShowCreditsOverlay: (show: boolean) => void;
  handlePurchase: (type: PaymentType) => void;
  handleManageSubscription: () => void;
  handleAddCredits: () => void;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(undefined);

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [showCreditsOverlay, setShowCreditsOverlay] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [credits, setCredits] = useState<Credits>({
    available: 1,
    subscription: null,
    subscriptionEndsAt: null
  });

  const handlePurchase = (type: PaymentType) => {
    toast({
      title: type === 'subscription' ? "Subscription started" : "Credits purchased",
      description: type === 'subscription' ? 
        "You now have unlimited voice generations!" : 
        "Credit has been added to your account."
    });
    
    if (type === 'subscription') {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setCredits({
        available: 9999,
        subscription: 'basic',
        subscriptionEndsAt: nextMonth
      });
    } else {
      setCredits(prev => ({
        ...prev,
        available: prev.available + (isNewUser ? 1 : 1)
      }));
    }
    
    setShowCreditsOverlay(false);
    
    if (isNewUser) {
      setIsNewUser(false);
    }
  };

  const handleManageSubscription = () => {
    toast({
      title: "Subscription management",
      description: "You would be redirected to manage your subscription."
    });
  };

  const handleAddCredits = () => {
    setShowCreditsOverlay(true);
  };

  return (
    <MonetizationContext.Provider
      value={{
        credits,
        isNewUser,
        showCreditsOverlay,
        setShowCreditsOverlay,
        handlePurchase,
        handleManageSubscription,
        handleAddCredits,
      }}
    >
      {children}
    </MonetizationContext.Provider>
  );
}

export const useMonetization = () => {
  const context = useContext(MonetizationContext);
  if (context === undefined) {
    throw new Error("useMonetization must be used within a MonetizationProvider");
  }
  return context;
};
