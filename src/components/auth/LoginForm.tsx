
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "@/hooks/useAuthForm";

export const LoginForm = () => {
  const {
    isLoading,
    error,
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  } = useAuthForm({ isLogin: true });

  return (
    <div className="space-y-4">
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
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-voicevault-primary hover:bg-voicevault-secondary"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </div>
  );
};
