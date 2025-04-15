
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-voicevault-softpurple to-white">
      <Card className="w-full max-w-md shadow-xl animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-voicevault-tertiary">
            {isLogin ? "Welcome Back" : (
              <>
                {step === 1 && "Welcome to VoiceVault"}
                {step === 2 && "Tell us about yourself"}
                {step === 3 && "How will you use VoiceVault?"}
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to your account" : (
              <>
                {step === 1 && "Preserve the voices you love, forever."}
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
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Button 
                      variant="link" 
                      className="text-voicevault-primary"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setStep(1);
                      }}
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
