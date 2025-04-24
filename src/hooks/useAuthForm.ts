
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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });
  
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (additionalData?: { purpose?: string; recordingFrequency?: string }) => {
    const { email, password, name } = formData;
    
    if (isLogin && (!email || !password)) {
      setError("Please fill in all fields");
      return false;
    }

    if (!isLogin && (!email || !password || !name)) {
      setError("Please fill in all fields");
      return false;
    }

    if (!isLogin && (!additionalData?.purpose || !additionalData?.recordingFrequency)) {
      setError("Please complete all steps");
      console.log("Missing additional data:", additionalData);
      return false;
    }

    return true;
  };

  const handleSubmit = async (additionalData?: { purpose?: string; recordingFrequency?: string }) => {
    setIsLoading(true);
    setError("");
    
    try {
      const { email, password, name } = formData;
      console.log("Form submission data:", { isLogin, email, password, name, additionalData });
      
      if (!validateForm(additionalData)) {
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        console.log("Attempting to login with:", { email });
        await login(email, password);
        console.log("Login successful, navigating to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("Attempting to register with:", { name, email, additionalData });
        await register(name, email, password, additionalData);
        console.log("Registration successful, navigating to dashboard");
        toast.success("Account created successfully!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      console.error(isLogin ? "Login error:" : "Registration error:", err);
      
      if (!isLogin && err.message && (
          err.message.includes("already registered") || 
          err.message.includes("already in use") || 
          err.message.includes("already exists")
        )) {
        setError("This email is already registered. Please log in instead.");
        toast.warning("Email already registered", {
          description: "Please log in with your existing account instead."
        });
      } else {
        setError(err.message || `${isLogin ? "Login" : "Registration"} failed`);
        toast.error(err.message || `${isLogin ? "Login" : "Registration"} failed`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    formData,
    updateFormData,
    handleSubmit,
  };
};
