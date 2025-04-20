
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

type SignupFormInputs = z.infer<typeof signupSchema>;

export const SignupForm = ({ step, setStep }: { step: number; setStep: (step: number) => void }) => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    trigger,
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema)
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
    }
    
    if (step === 2 && (!getValues('name') || errors.name || !agreeToTerms)) {
      return;
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

  const onSubmit = async (data: SignupFormInputs) => {
    setRegistrationError("");
    setIsEmailTaken(false);
    
    try {
      setIsRegistering(true);
      await registerUser(data.name, data.email, data.password);
      toast.success("Registration successful!");
      navigate('/dashboard'); // Redirect to dashboard after successful registration
    } catch (err: any) {
      // Check if this is a "User already registered" error
      if (err.message && (
          err.message.includes("already registered") || 
          err.message.includes("already in use") || 
          err.message.includes("already exists")
        )) {
        setIsEmailTaken(true);
        setRegistrationError("This email is already registered. Please log in instead.");
        toast({
          title: "Email already registered",
          description: "Please log in with your existing account instead.",
          style: {
            backgroundColor: '#ffc86b',
            color: '#333'
          }
        });
      } else {
        setRegistrationError(err.message || "Registration failed");
        toast.error(err.message || "Registration failed", {
          description: "Please try again or contact support."
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const switchToLogin = () => {
    // This function will be called from the parent component
    // We're accessing it through a prop
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
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
          disabled={isSubmitting || (isEmailTaken && step === 1)}
        >
          Continue
        </Button>
      ) : (
        <Button 
          type="submit"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || isRegistering || !purpose || !recordingFrequency}
          className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
        >
          {isSubmitting || isRegistering ? (
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
