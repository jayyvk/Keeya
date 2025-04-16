import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export const TermsModal = ({ isOpen, onClose, type }: TermsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {type === 'terms' ? 'Keeya - Terms of Service' : 'Privacy Policy'}
          </DialogTitle>
          <DialogDescription>
            {type === 'terms' ? 'Last updated: April 14, 2025' : ''}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {type === 'terms' ? (
            <div className="space-y-4">
              <p>Welcome to Keeya ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our mobile-first web application ("App") that allows users to record, store, and generate AI-powered voice experiences of loved ones.</p>
              
              <p>By signing up or using Keeya, you agree to be bound by these Terms. Please read them carefully.</p>
              
              <div>
                <h3 className="font-semibold mb-2">1. Eligibility</h3>
                <p>You must be at least 18 years old to use Keeya. By using the App, you confirm that you are of legal age and legally capable of entering into this agreement.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Voice Recordings and Content</h3>
                <p>You are solely responsible for the content you upload, including voice recordings of yourself or others. You must have legal consent to upload or clone any voice that is not your own.</p>
                <p className="mt-2">You may not:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Upload copyrighted, fraudulent, or harmful content</li>
                  <li>Use Keeya to impersonate someone else</li>
                  <li>Generate offensive, hateful, or illegal material</li>
                </ul>
                <p className="mt-2">We reserve the right to suspend or remove content that violates these rules.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. AI Generation Features</h3>
                <p>Voice cloning and AI-generated audio are premium features. By using these, you acknowledge that:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>AI content is synthetic and not a substitute for real human communication</li>
                  <li>You will not misuse cloned voices for deception, impersonation, or fraud</li>
                </ul>
              </div>

              {/* ... Continue with sections 4-8 */}
            </div>
          ) : (
            <div className="space-y-4">
              <p>Keeya is committed to protecting your personal information. This policy outlines how we collect, use, and protect your data.</p>

              <div>
                <h3 className="font-semibold mb-2">1. Information We Collect:</h3>
                <ul className="list-disc ml-6">
                  <li>Email address (for login/authentication)</li>
                  <li>Voice recordings and AI-generated content</li>
                  <li>Usage metrics (e.g., actions taken in the app)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. How We Use Your Data:</h3>
                <ul className="list-disc ml-6">
                  <li>To operate the App and provide features</li>
                  <li>To improve Keeya and personalize your experience</li>
                  <li>To store your voice and AI content securely</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Contact</h3>
                <p>If you have questions about our Terms or Privacy Policy, please reach out at: keeya.app@gmail.com</p>
              </div>

              <p className="mt-4 italic">Thank you for trusting Keeya to preserve what matters most.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
