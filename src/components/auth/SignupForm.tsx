
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TermsModal } from "./TermsModal";
import { useAuthForm } from "@/hooks/useAuthForm";

export const SignupForm = () => {
  const { formData, updateField, handleSubmit, isLoading, error } = useAuthForm({ 
    isLogin: false 
  });
  
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'terms' | 'privacy'>('terms');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  const isFormValid = formData.email && 
                     formData.password && 
                     formData.name && 
                     formData.name.trim().length >= 2 && 
                     formData.agreeToTerms;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
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
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          disabled={isLoading}
          required
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="terms" 
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) => updateField("agreeToTerms", checked as boolean)}
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

      <Button 
        type="submit"
        disabled={isLoading || !isFormValid}
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
      
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        type={modalType}
      />
    </form>
  );
};
