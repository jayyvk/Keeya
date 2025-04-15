
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

interface UseAuthFormProps {
  isLogin: boolean;
}

export const useAuthForm = ({ isLogin }: UseAuthFormProps) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    if (isLogin && (!email || !password)) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!isLogin && (!email || !password || !name)) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log("Attempting to login with:", { email });
        await login(email, password);
        toast.success("Logged in successfully!");
        console.log("Login successful, redirecting to dashboard");
        // Let the Auth component handle the navigation based on auth state
      } else {
        console.log("Attempting to register with:", { name, email });
        await register(name, email, password);
        toast.success("Account created successfully!");
        console.log("Registration successful, redirecting to dashboard");
        // Let the Auth component handle the navigation based on auth state
      }
    } catch (err: any) {
      console.error(isLogin ? "Login error:" : "Registration error:", err);
      setError(err.message || `${isLogin ? "Login" : "Registration"} failed`);
      toast.error(err.message || `${isLogin ? "Login" : "Registration"} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    handleSubmit,
  };
};
