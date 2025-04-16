
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRequestClip } from "@/hooks/use-request-clip";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface RequestClipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestClipModal: React.FC<RequestClipModalProps> = ({ isOpen, onClose }) => {
  const [recipientName, setRecipientName] = React.useState("");
  const { createRequest, isLoading } = useRequestClip();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      toast.error("Please enter a recipient name");
      return;
    }

    const request = await createRequest(recipientName);
    if (request) {
      const shareUrl = `${window.location.origin}/record/${request.id}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!", {
          description: "Share it with your recipient"
        });
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
      onClose();
      setRecipientName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Voice Memory</DialogTitle>
          <DialogDescription>
            Create a link to share with someone who can record a voice message for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Enter recipient's name (e.g., 'Grandma', 'John')"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Share2 className="h-4 w-4" />
              Create Request Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestClipModal;
