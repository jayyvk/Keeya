
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLogin, setIsLogin] = useState(false); // Show signup by default
  const [step, setStep] = useState(1);

  useEffect(() => {
    console.log("Auth page - Authentication status:", { isAuthenticated, user });
    
    if (isAuthenticated && user) {
      // Only show the welcome toast
      toast(`Welcome, ${user.name || 'there'}!`);
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white" data-auth-component>
      <Card className="w-full max-w-md shadow-card animate-fade-in border border-[#F0F0F0] rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#1A1A1A]">
            {isLogin ? "Welcome Back" : (
              <>
                {step === 1 && "Welcome to Keeya"}
                {step === 2 && "Tell us about yourself"}
                {step === 3 && "How will you use Keeya?"}
              </>
            )}
          </CardTitle>
          <CardDescription className="text-[#333333]">
            {isLogin ? "Sign in to your account" : (
              <>
                {step === 1 && "Save the voices you love, forever."}
                {step === 2 && "Help us personalize your experience"}
                {step === 3 && "Understanding your goals helps us improve"}
              </>
            )}
          </CardDescription>
        </CardHeader>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${isLogin ? 'login' : `signup-${step}`}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              {isLogin ? (
                <LoginForm />
              ) : (
                <SignupForm step={step} setStep={setStep} />
              )}
              
              {(isLogin || step === 1) && (
                <div className="text-center mt-6">
                  <span className="text-small text-[#333333]">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Button 
                      variant="link" 
                      className="text-voicevault-primary font-medium"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setStep(1);
                      }}
                      data-login-switch
                    >
                      {isLogin ? "Sign Up" : "Sign In"}
                    </Button>
                  </span>
                </div>
              )}
            </CardContent>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default Auth;
