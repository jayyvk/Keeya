
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Shows a modal requiring the user to authenticate before continuing.
 * `next` is a callback to run after authentication, if any.
 */
type AuthRequiredModalProps = {
  open: boolean;
  onClose: () => void;
  next?: (() => void) | null;
}

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({ open, onClose, next }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = () => {
    navigate("/auth", {
      state: {
        redirectTo: location.pathname + location.search,
        postAuth: next ? true : undefined,
      }
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-2">Sign up or log in to continue</h2>
        <p className="mb-4 text-gray-600 text-center">
          Please log in or create an account to use this feature.
        </p>
        <Button onClick={handleAuth}>Sign In / Create Account</Button>
        <Button variant="ghost" className="mt-2" onClick={onClose}>Cancel</Button>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredModal;
