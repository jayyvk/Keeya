
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthForm } from "@/hooks/useAuthForm";
import { toast } from "sonner";

type LoginFormInputs = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { isLoading, error, formData, updateFormData, handleSubmit } = useAuthForm({ isLogin: true });
  
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    watch
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: formData.email,
      password: formData.password
    }
  });

  // Watch form fields to sync with authForm state
  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  
  React.useEffect(() => {
    updateFormData("email", watchedEmail || "");
  }, [watchedEmail]);
  
  React.useEffect(() => {
    updateFormData("password", watchedPassword || "");
  }, [watchedPassword]);

  const onSubmit = async () => {
    try {
      await handleSubmit();
    } catch (err: any) {
      console.error("Login error:", err);
    }
  };

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register("email")}
          disabled={isLoading}
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
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};
