
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
  
  useEffect(() => {
    console.log("AuthProvider initialized");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session ? "session exists" : "no session");
        
        if (session?.user) {
          // Fetch the user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData = {
            id: session.user.id,
            name: profile?.display_name || session.user.user_metadata.name || "",
            email: session.user.email || "",
          };
          
          console.log("Setting user data:", userData);
          setUser(userData);
          console.log("User set after auth state change");
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
          .then(({ data: profile }) => {
            const userData = {
              id: session.user.id,
              name: profile?.display_name || session.user.user_metadata.name || "",
              email: session.user.email || "",
            };
            
            console.log("Setting initial user data:", userData);
            setUser(userData);
            console.log("User set after initial session check");
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      throw error;
    }
    setUser(null);
    console.log("Logout successful");
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
      // No need to fetch profile here as it might not be created yet
      const userData = {
        id: data.user.id,
        name: name,
        email: data.user.email || "",
      };
      
      console.log("Setting user after registration:", userData);
      setUser(userData);
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
