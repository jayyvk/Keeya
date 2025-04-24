
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { useProfile } from "./useProfile";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const { fetchUserProfile } = useProfile();

  useEffect(() => {
    console.log("Setting up auth state management");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session ? "session exists" : "no session");
        
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id);
          if (userData) {
            setUser({
              ...userData,
              email: session.user.email || "",
            });
          }
        } else {
          setUser(null);
          console.log("User set to null after auth state change");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial session check:", session ? "session exists" : "no session");
      
      if (session?.user) {
        const userData = await fetchUserProfile(session.user.id);
        if (userData) {
          setUser({
            ...userData,
            email: session.user.email || "",
          });
        }
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  return { user, isAuthenticated: !!user };
};
