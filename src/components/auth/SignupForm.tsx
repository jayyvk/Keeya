
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TermsModal } from "./TermsModal";
import { useAuthForm } from "@/hooks/useAuthForm";

export const SignupForm = ({ step, setStep }: { step: number; setStep: (step: number) => void }) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    handleSubmit,
    isLoading,
    error
  } = useAuthForm({ isLogin: false });

  const [purpose, setPurpose] = React.useState("");
  const [recordingFrequency, setRecordingFrequency] = React.useState("");
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'terms' | 'privacy'>('terms');

  const nextStep = () => {
    if (step === 1) {
      if (!email || !password) {
        return;
      }
    }
    
    if (step === 2 && (!name || !agreeToTerms)) {
      return;
    }
    
    setStep(step + 1);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
              />
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                disabled={isLoading}
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
                    type="button"
                    variant={purpose === option ? "default" : "outline"}
                    onClick={() => setPurpose(option)}
                    className="w-full"
                    disabled={isLoading}
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
                    type="button"
                    variant={recordingFrequency === option ? "default" : "outline"}
                    onClick={() => setRecordingFrequency(option)}
                    className="w-full"
                    disabled={isLoading}
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
          disabled={isLoading || (step === 1 && (!email || !password)) || (step === 2 && (!name || !agreeToTerms))}
        >
          Continue
        </Button>
      ) : (
        <Button 
          type="submit"
          onClick={onSubmit}
          disabled={isLoading || !purpose || !recordingFrequency}
          className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
        >
          {isLoading ? (
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
