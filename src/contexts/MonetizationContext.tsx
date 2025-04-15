
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
  verifyPaymentSuccess: (sessionId: string) => Promise<void>;
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

  // Check for payment success in URL params when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    
    if (success === 'true' && sessionId && user) {
      verifyPaymentSuccess(sessionId);
      
      // Clean up URL parameters after processing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [user]);

  const verifyPaymentSuccess = async (sessionId: string) => {
    if (!user) return;
    
    try {
      console.log("Verifying payment success for session:", sessionId);
      setIsProcessingPayment(true);
      
      const response = await supabase.functions.invoke('update-credits', {
        body: { sessionId }
      });
      
      console.log("Credit update response:", response);
      
      if (response.error) {
        console.error("Credit update error:", response.error);
        toast({
          title: "Payment verification failed",
          description: "There was an issue verifying your payment. Please contact support.",
          variant: "destructive"
        });
        return;
      }
      
      if (response.data?.success) {
        await refreshCredits();
        toast({
          title: "Payment successful!",
          description: "Your credits have been added to your account.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Payment verification error",
        description: "There was an issue processing your payment. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

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

    try {
      setIsProcessingPayment(true);
      console.log("Starting payment process for plan:", type);
      
      const response = await supabase.functions.invoke('create-checkout', {
        body: { planId: type }
      });

      console.log("Checkout response:", response);
      
      if (response.error) {
        console.error("Checkout error:", response.error);
        throw new Error(response.error);
      }
      
      if (response.data?.url) {
        console.log("Redirecting to checkout URL:", response.data.url);
        window.location.href = response.data.url;
      } else {
        console.error("Missing checkout URL in response:", response.data);
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not initiate payment';
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
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
        verifyPaymentSuccess,
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
