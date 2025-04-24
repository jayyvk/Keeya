
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, additionalData?: { purpose?: string, recordingFrequency?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    console.log("AuthProvider initialized");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session ? "session exists" : "no session");
        
        if (session?.user) {
          // Fetch the user's profile
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile, error }) => {
              if (error) {
                console.error("Error fetching profile:", error);
              }
              
              const userData = {
                id: session.user.id,
                name: profile?.display_name || session.user.user_metadata.name || "",
                email: session.user.email || "",
              };
              
              console.log("Setting user data after auth state change:", userData);
              setUser(userData);
            });
        } else {
          setUser(null);
          console.log("User set to null after auth state change");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "session exists" : "no session");
      
      if (session?.user) {
        // Fetch the user's profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error("Error fetching profile:", error);
            }
            
            const userData = {
              id: session.user.id,
              name: profile?.display_name || session.user.user_metadata.name || "",
              email: session.user.email || "",
            };
            
            console.log("Setting initial user data:", userData);
            setUser(userData);
          });
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

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
    
    console.log("Login API call successful, session:", data.session ? "exists" : "none");
    
    if (data.user) {
      console.log("Login successful for user:", data.user.id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userData = {
        id: data.user.id,
        name: profile?.display_name || data.user.user_metadata.name || "",
        email: data.user.email || "",
      };
      
      console.log("Setting user after login:", userData);
      setUser(userData);
    }
  };

  const logout = async () => {
    console.log("Logout attempt");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
        throw error;
      }
      setUser(null);
      console.log("Logout successful");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      setUser(null);
      console.log("User state cleared despite logout error");
    }
  };

  const register = async (name: string, email: string, password: string, additionalData?: { purpose?: string, recordingFrequency?: string }) => {
    console.log("Register attempt with:", { name, email, additionalData });
    
    if (!additionalData?.purpose || !additionalData?.recordingFrequency) {
      console.error("Missing required additional data for registration");
      throw new Error("Please complete all registration steps");
    }

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
      
      try {
        // Create the profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            display_name: name,
            terms_accepted: true,
            age_verified: true
          }, { onConflict: 'id' });
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
        
        // Create initial credits
        const { error: creditsError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: data.user.id,
            credits_balance: 5
          }, { onConflict: 'user_id' });
          
        if (creditsError) {
          console.error("Error creating user credits:", creditsError);
        }
        
        // Now log the user in automatically after successful registration
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error("Auto sign-in after registration failed:", signInError);
          throw signInError;
        }
        
        if (signInData.user) {
          console.log("Auto sign-in after registration successful for user:", signInData.user.id);
          
          const userData = {
            id: data.user.id,
            name: name,
            email: data.user.email || "",
          };
          
          console.log("Setting user after registration and auto sign-in:", userData);
          setUser(userData);
        }
        
      } catch (error) {
        console.error("Error during post-registration setup:", error);
        // Continue anyway, as the user registration was successful
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
