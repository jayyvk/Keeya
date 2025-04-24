
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { toast } from "sonner";

export const useProfile = () => {
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return {
      id: userId,
      name: profile?.display_name || "",
      email: "",  // Will be set from session
    };
  };

  const createUserProfile = async (
    userId: string, 
    name: string, 
    purpose?: string,
    recordingFrequency?: string
  ) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          display_name: name,
          terms_accepted: true,
          age_verified: true
        }, { onConflict: 'id' });
        
      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw profileError;
      }
      
      const { error: creditsError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits_balance: 5
        }, { onConflict: 'user_id' });
        
      if (creditsError) {
        console.error("Error creating user credits:", creditsError);
        throw creditsError;
      }
    } catch (error: any) {
      console.error("Error during profile setup:", error);
      toast.error("Error setting up user profile");
      throw error;
    }
  };

  return { fetchUserProfile, createUserProfile };
};
