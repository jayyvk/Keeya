
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UseAuthFormProps {
  isLogin: boolean;
}

export const useAuthForm = ({ isLogin }: UseAuthFormProps) => {
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
        console.log("Login successful, Auth component will handle redirect");
      } else {
        console.log("Attempting to register with:", { name, email });
        await register(name, email, password);
        console.log("Registration successful, Auth component will handle redirect");
      }
    } catch (err: any) {
      console.error(isLogin ? "Login error:" : "Registration error:", err);
      setError(err.message || `${isLogin ? "Login" : "Registration"} failed`);
      toast(err.message || `${isLogin ? "Login" : "Registration"} failed`, {
        style: {
          backgroundColor: 'red',
          color: 'white'
        }
      });
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
