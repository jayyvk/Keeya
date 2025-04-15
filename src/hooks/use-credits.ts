
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

type PlanId = 'starter' | 'pro' | 'family';

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user]);

  const fetchCredits = async () => {
    // Prevent multiple simultaneous refresh calls
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setCredits(data.credits_balance);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast({
        title: "Error",
        description: "Could not fetch credit balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
      
      // Debounce multiple rapid refresh calls
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    }
  };

  const handlePayment = async (planId: PlanId) => {
    try {
      const response = await supabase.functions.invoke('create-checkout', {
        body: { planId },
      });

      if (response.error) throw response.error;
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Could not initiate payment",
        variant: "destructive",
      });
    }
  };

  // Debounced refresh function to prevent multiple rapid calls
  const refreshCredits = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      fetchCredits();
    }, 300);
  };

  return {
    credits,
    isLoading,
    handlePayment,
    refreshCredits,
  };
}
