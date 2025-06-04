
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
    name: "",
    agreeToTerms: false
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");

    console.log("HandleSubmit called with:", { isLogin, formData });

    try {
      if (isLogin) {
        // Login validation
        if (!formData.email || !formData.password) {
          setError("Please fill in all fields");
          setIsLoading(false);
          return;
        }

        console.log("Attempting login with:", { email: formData.email });
        await login(formData.email, formData.password);
        toast.success("Login successful!");
        navigate("/dashboard", { replace: true });
      } else {
        // Signup validation
        if (!formData.email || !formData.password || !formData.name || !formData.agreeToTerms) {
          if (!formData.email || !formData.password) {
            setError("Please fill in email and password");
          } else if (!formData.name || formData.name.trim().length < 2) {
            setError("Please enter your name (at least 2 characters)");
          } else if (!formData.agreeToTerms) {
            setError("Please agree to the terms and conditions");
          }
          setIsLoading(false);
          return;
        }

        console.log("Attempting registration with:", { 
          name: formData.name.trim(), 
          email: formData.email 
        });
        
        await register(formData.name.trim(), formData.email, formData.password);
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
    formData,
    updateField,
    handleSubmit,
  };
};
