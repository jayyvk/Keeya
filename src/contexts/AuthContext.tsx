
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    console.log("AuthProvider initialized");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session ? "session exists" : "no session");
        
        setSession(session);
        
        if (session?.user) {
          try {
            // Fetch the user's profile
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (error && error.code !== 'PGRST116') {
              console.error("Error fetching profile:", error);
            }
            
            const userData = {
              id: session.user.id,
              name: profile?.display_name || session.user.user_metadata.name || "",
              email: session.user.email || "",
            };
            
            console.log("Setting user data after auth state change:", userData);
            setUser(userData);
          } catch (error) {
            console.error("Error in auth state change:", error);
          }
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
        setSession(session);
        // The auth state change listener will handle setting the user
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
    
    console.log("Login API call successful");
    // The auth state change listener will handle setting the user
  };

  const logout = async () => {
    console.log("Logout attempt");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      throw error;
    }
    console.log("Logout successful");
    // The auth state change listener will handle clearing the user
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("Register attempt with:", { name, email });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) {
      console.error("Registration error:", error.message);
      throw error;
    }
    
    if (data.user) {
      console.log("Registration successful for user:", data.user.id);
      // The auth state change listener will handle setting the user
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!session,
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
