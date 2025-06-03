
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

  const handleSubmit = async (additionalData?: { purpose?: string; recordingFrequency?: string }) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");

    console.log("HandleSubmit called with:", { isLogin, email, name: name.trim(), additionalData });

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!isLogin && (!name || name.trim().length < 2)) {
      setError("Please enter your name (at least 2 characters)");
      setIsLoading(false);
      return;
    }

    // For signup, validate additional data on step 3
    if (!isLogin && additionalData && (!additionalData.purpose || !additionalData.recordingFrequency)) {
      console.log("Missing additional data:", additionalData);
      setError("Please select your purpose and recording frequency");
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
        console.log("Attempting registration with:", { name: name.trim(), email, additionalData });
        await register(name.trim(), email, password);
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
