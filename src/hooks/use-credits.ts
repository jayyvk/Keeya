
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

type PlanId = 'starter' | 'pro' | 'family';

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCredits(data.credits_balance);
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast({
        title: "Error",
        description: "Could not fetch credit balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  return {
    credits,
    isLoading,
    handlePayment,
    refreshCredits: fetchCredits,
  };
}
