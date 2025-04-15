import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Credits, PaymentType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MonetizationContextType {
  credits: Credits;
  isNewUser: boolean;
  showCreditsOverlay: boolean;
  isProcessingPayment: boolean;
  setShowCreditsOverlay: (show: boolean) => void;
  handlePurchase: (type: PaymentType) => void;
  handleManageSubscription: () => void;
  handleAddCredits: () => void;
  refreshCredits: () => Promise<void>;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(undefined);

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showCreditsOverlay, setShowCreditsOverlay] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [credits, setCredits] = useState<Credits>({
    available: 0,
    subscription: null,
    subscriptionEndsAt: null
  });

  useEffect(() => {
    if (user) {
      refreshCredits();
    }
  }, [user]);

  const refreshCredits = async () => {
    if (!user) return;
    
    try {
      console.log("Refreshing credits for user:", user.id);
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching user credits:", error);
        toast({
          title: "Error refreshing credits",
          description: "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        console.log("Updated credits:", data.credits_balance);
        setCredits(prev => ({
          ...prev,
          available: data.credits_balance
        }));
      } else {
        console.log("No credit data found for user");
        await createUserCreditRecord();
      }
    } catch (error) {
      console.error("Error in refreshCredits:", error);
      toast({
        title: "Error refreshing credits",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const createUserCreditRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .insert({
          user_id: user?.id,
          credits_balance: 2,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating user credits:", error);
        return;
      }
      
      if (data) {
        setCredits(prev => ({
          ...prev,
          available: data.credits_balance
        }));
        console.log("Created new credit record with balance:", data.credits_balance);
      }
    } catch (error) {
      console.error("Error in createUserCreditRecord:", error);
    }
  };

  const handlePurchase = async (type: PaymentType) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to make a purchase.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const response = await supabase.functions.invoke('create-checkout', {
        body: { planId: type }
      });

      if (response.error) throw response.error;
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Could not initiate payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
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
        isProcessingPayment,
        setShowCreditsOverlay,
        handlePurchase,
        handleManageSubscription,
        handleAddCredits,
        refreshCredits,
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
