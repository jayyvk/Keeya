
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { signupSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { TermsModal } from "./TermsModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthForm } from "@/hooks/useAuthForm";

type SignupFormInputs = z.infer<typeof signupSchema>;

export const SignupForm = ({ step, setStep }: { step: number; setStep: (step: number) => void }) => {
  const navigate = useNavigate();
  const { isLoading, error, email, setEmail, password, setPassword, name, setName, handleSubmit } = useAuthForm({ isLogin: false });
  
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: email,
      password: password,
      name: name
    }
  });

  const [purpose, setPurpose] = React.useState("");
  const [recordingFrequency, setRecordingFrequency] = React.useState("");
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'terms' | 'privacy'>('terms');
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [registrationError, setRegistrationError] = React.useState("");
  const [isEmailTaken, setIsEmailTaken] = React.useState(false);

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await trigger(['email', 'password']);
      if (!isValid) {
        if (errors.email) {
          toast.error("Invalid email format", {
            description: "Please enter a valid email address"
          });
        }
        return;
      }
      // Update values in the shared auth form state
      setEmail(getValues('email'));
      setPassword(getValues('password'));
    }
    
    if (step === 2 && (!getValues('name') || errors.name || !agreeToTerms)) {
      if (!agreeToTerms) {
        toast.error("Terms agreement required", {
          description: "Please agree to the terms to continue"
        });
      }
      return;
    }

    if (step === 2) {
      // Update name in the shared auth form state
      setName(getValues('name'));
    }
    
    setStep(step + 1);
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalType('terms');
    setShowTermsModal(true);
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalType('privacy');
    setShowTermsModal(true);
  };

  const onSubmit = async () => {
    setRegistrationError("");
    setIsEmailTaken(false);

    if (!purpose || !recordingFrequency) {
      toast.error("Please complete all fields", {
        description: "Select your purpose and recording frequency to continue."
      });
      return;
    }
    
    try {
      setIsRegistering(true);
      // Use the shared handleSubmit function from useAuthForm
      await handleSubmit();
      // Navigation is handled in useAuthForm
    } catch (err: any) {
      // Error handling is done in useAuthForm
      console.error("Error in form submission:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  const switchToLogin = () => {
    const authComponent = document.querySelector('[data-auth-component]');
    if (authComponent) {
      const loginButton = authComponent.querySelector('[data-login-switch]');
      if (loginButton && loginButton instanceof HTMLButtonElement) {
        loginButton.click();
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            {isEmailTaken && (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertDescription>
                  {registrationError}
                  <Button 
                    variant="link" 
                    className="pl-1 text-voicevault-primary font-medium"
                    onClick={switchToLogin}
                  >
                    Switch to login
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isRegistering || isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isRegistering || isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                onChange={(e) => setName(e.target.value)}
                disabled={isRegistering || isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                disabled={isRegistering || isLoading}
              />
              <Label htmlFor="terms" className="text-sm">
                I am over 18 and agree to the{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setModalType('terms');
                    setShowTermsModal(true);
                  }} 
                  className="text-voicevault-primary hover:underline"
                >
                  Terms
                </button>{" "}
                and{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setModalType('privacy');
                    setShowTermsModal(true);
                  }} 
                  className="text-voicevault-primary hover:underline"
                >
                  Privacy Policy
                </button>
              </Label>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What's your main purpose?</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Personal memories", "Family", "Fun", "Other"].map((option) => (
                  <Button
                    key={option}
                    variant={purpose === option ? "default" : "outline"}
                    onClick={() => setPurpose(option)}
                    className="w-full"
                    disabled={isRegistering || isLoading}
                    type="button"
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
                    disabled={isRegistering || isLoading}
                    type="button"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      
      {renderStepContent()}
      
      {step < 3 ? (
        <Button 
          type="button"
          onClick={nextStep}
          className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
          disabled={isRegistering || isLoading || (isEmailTaken && step === 1)}
        >
          Continue
        </Button>
      ) : (
        <Button 
          type="button"
          onClick={onSubmit}
          disabled={isRegistering || isLoading || !purpose || !recordingFrequency}
          className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
        >
          {isRegistering || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      )}
      
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        type={modalType}
      />
    </div>
  );
};
