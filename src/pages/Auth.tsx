
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isLogin, setIsLogin] = useState(false);

  // Get the intended redirect after auth (from state)
  const redirectTo = location.state?.redirectTo || "/dashboard";

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User is authenticated, redirecting to:", redirectTo);
      toast(`Welcome, ${user.name || 'there'}!`);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, user, redirectTo]);

  return (
    <div className="keeya-bg min-h-screen flex items-center justify-center p-6" data-auth-component>
      <Card className="w-full max-w-md shadow-card animate-fade-in border border-[#F0F0F0] rounded-lg">
        <CardHeader className="text-center bg-transparent">
          <CardTitle className="text-2xl font-bold text-[#1A1A1A]">
            {isLogin ? "Welcome Back" : "Welcome to Keeya"}
          </CardTitle>
          <CardDescription className="text-[#333333]">
            {isLogin ? "Sign in to your account" : "Save the voices you love, forever."}
          </CardDescription>
        </CardHeader>
        <AnimatePresence mode="wait">
          <motion.div 
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              {isLogin ? (
                <LoginForm />
              ) : (
                <SignupForm />
              )}
              
              <div className="text-center mt-6">
                <span className="text-small text-[#333333]">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Button 
                    variant="link" 
                    className="text-voicevault-primary font-medium"
                    onClick={() => setIsLogin(!isLogin)}
                    data-login-switch
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </Button>
                </span>
              </div>
            </CardContent>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default Auth;
