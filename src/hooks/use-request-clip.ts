
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRequestClip() {
  const [isLoading, setIsLoading] = useState(false);

  const createRequest = async (recipientName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('voice_requests')
        .insert({
          recipient_name: recipientName,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating voice request:', error);
      toast.error("Failed to create request", {
        description: "Please try again later"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRequest,
    isLoading
  };
}
