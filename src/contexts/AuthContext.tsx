
import React, { createContext, useContext } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from "@/types/auth";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthState();
  const { createUserProfile } = useProfile();

  const login = async (email: string, password: string) => {
    console.log("Login attempt with:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error.message);
      throw error;
    }
    
    console.log("Login successful for user:", data.user?.id);
  };

  const logout = async () => {
    console.log("Logout attempt");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      throw error;
    }
    console.log("Logout successful");
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    additionalData?: { 
      purpose?: string; 
      recordingFrequency?: string; 
    }
  ) => {
    console.log("Register attempt with:", { name, email, additionalData });
    
    if (!additionalData?.purpose || !additionalData?.recordingFrequency) {
      console.error("Missing required additional data for registration");
      throw new Error("Please complete all registration steps");
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            purpose: additionalData.purpose,
            recording_frequency: additionalData.recordingFrequency,
            terms_accepted: true,
            age_verified: true
          },
        },
      });
      
      if (error) {
        console.error("Registration error:", error.message);
        throw error;
      }
      
      if (data.user) {
        console.log("Registration successful for user:", data.user.id);
        
        await createUserProfile(
          data.user.id, 
          name, 
          additionalData.purpose, 
          additionalData.recordingFrequency
        );
        
        // Now log the user in automatically
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error("Auto sign-in after registration failed:", signInError);
          throw signInError;
        }
        
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
