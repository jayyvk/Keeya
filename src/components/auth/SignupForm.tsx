
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthForm } from "@/hooks/useAuthForm";
import { Loader2 } from "lucide-react";

interface SignupFormProps {
  step: number;
  setStep: (step: number) => void;
}

export const SignupForm = ({ step, setStep }: SignupFormProps) => {
  const {
    isLoading,
    error,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    handleSubmit,
  } = useAuthForm({ isLogin: false });

  const [purpose, setPurpose] = useState("");
  const [recordingFrequency, setRecordingFrequency] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const nextStep = () => {
    if (step === 1 && !email) {
      return;
    }
    if (step === 2 && !name) {
      return;
    }
    setStep(step + 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
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
                I am over 18 and agree to the <a href="#" className="text-voicevault-primary hover:underline">Terms</a> and <a href="#" className="text-voicevault-primary hover:underline">Privacy Policy</a>
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
                {["Personal Memories", "Family History", "Legacy", "Other"].map((option) => (
                  <Button
                    key={option}
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
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {step < 3 ? (
        <Button 
          onClick={nextStep}
          className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
          disabled={isLoading}
        >
          Continue
        </Button>
      ) : (
        <Button 
          onClick={handleSubmit}
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
    </div>
  );
};
