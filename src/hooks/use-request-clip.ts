
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useRequestClip() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const createRequest = async (recipientName: string) => {
    if (!user) {
      toast.error("You must be logged in to create a request");
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('voice_requests')
        .insert({
          recipient_name: recipientName,
          created_by: user.id,
          is_fulfilled: false,
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
