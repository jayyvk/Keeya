
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "framer-motion";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic Auth Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Onboarding Fields
  const [purpose, setPurpose] = useState("");
  const [recordingFrequency, setRecordingFrequency] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkSession();
  }, [navigate]);

  const handleSignUp = async () => {
    setIsLoading(true);
    setError("");

    if (!email || !password || !name) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            purpose,
            recording_frequency: recordingFrequency,
            terms_accepted: agreeToTerms
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully! Please check your email to verify.");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !email) {
      setError("Please enter your email");
      return;
    }
    if (step === 2 && !name) {
      setError("Please enter your name");
      return;
    }
    setError("");
    setStep(prev => prev + 1);
  };

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
            {isLogin ? (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
            ) : (
              <>
                {step === 1 && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </CardContent>
                )}

                {step === 2 && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I am over 18 and agree to the <a href="#" className="text-voicevault-primary hover:underline">Terms</a> and <a href="#" className="text-voicevault-primary hover:underline">Privacy Policy</a>
                      </Label>
                    </div>
                  </CardContent>
                )}

                {step === 3 && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>What's your main purpose?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Personal Memories", "Family History", "Legacy", "Other"].map((option) => (
                          <Button
                            key={option}
                            variant={purpose === option ? "default" : "outline"}
                            onClick={() => setPurpose(option)}
                            className="w-full"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>How often will you record?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Daily", "Weekly", "Monthly", "Occasionally"].map((option) => (
                          <Button
                            key={option}
                            variant={recordingFrequency === option ? "default" : "outline"}
                            onClick={() => setRecordingFrequency(option)}
                            className="w-full"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <p className="text-red-500 text-sm px-6">{error}</p>}
        
        <CardFooter className="flex flex-col space-y-2">
          {isLogin ? (
            <>
              <Button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center mt-4">
                <span className="text-sm text-gray-600">
                  Don't have an account? {" "}
                  <Button 
                    variant="link" 
                    className="text-voicevault-primary"
                    onClick={() => {
                      setIsLogin(false);
                      setError("");
                    }}
                  >
                    Sign Up
                  </Button>
                </span>
              </div>
            </>
          ) : (
            <>
              {step < 3 ? (
                <Button 
                  onClick={nextStep} 
                  className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleSignUp}
                  disabled={isLoading || !purpose || !recordingFrequency}
                  className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              )}
              
              {step === 1 && (
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-600">
                    Already have an account? {" "}
                    <Button 
                      variant="link" 
                      className="text-voicevault-primary"
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                      }}
                    >
                      Sign In
                    </Button>
                  </span>
                </div>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
