
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UseAuthFormProps {
  isLogin: boolean;
}

export const useAuthForm = ({ isLogin }: UseAuthFormProps) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!isLogin && !name) {
      setError("Please enter your name");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log("Attempting login with:", { email });
        await login(email, password);
        toast.success("Login successful!");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("Attempting registration with:", { name, email });
        await register(name, email, password);
        toast.success("Account created successfully!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      console.error(isLogin ? "Login error:" : "Registration error:", err);
      const errorMessage = err.message || `${isLogin ? "Login" : "Registration"} failed`;
      setError(errorMessage);
      toast.error(errorMessage);
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
