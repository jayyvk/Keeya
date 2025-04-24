
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    additionalData?: { 
      purpose?: string; 
      recordingFrequency?: string; 
    }
  ) => Promise<void>;
}
