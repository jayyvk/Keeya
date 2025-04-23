import React, { useState } from 'react';
import { Mail, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import CommonHeader from "@/components/CommonHeader";
import { MonetizationProvider } from "@/contexts/MonetizationContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Textarea } from "@/components/ui/textarea";

const About = () => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleStarHover = (starIndex: number) => setHoveredStar(starIndex);
  const handleStarLeave = () => setHoveredStar(0);
  const handleStarClick = (starIndex: number) => setRating(starIndex);

  const handleEmailClick = () => {
    window.location.href = 'mailto:keeya.app@gmail.com?subject=Feedback%20for%20Keeya';
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      toast({
        title: "Please rate us 1–5 stars",
        description: "",
        variant: "destructive"
      });
      return;
    }
    if (!user) {
      toast({
        title: "You must be logged in to submit feedback",
        variant: "destructive"
      });
      return;
    }
    if (comment.trim().length < 50) {
      toast({
        title: "Message too short",
        description: "Please write at least 50 characters in your feedback.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error: feedbackError } = await supabase.from('feedback').insert({
        user_id: user.id,
        rating,
        comment,
      });

      if (feedbackError) {
        throw feedbackError;
      }

      await supabase.rpc('add_manual_credits', {
        p_user_id: user.id,
        p_credits: 5,
        p_reason: "Feedback"
      });

      setSubmitted(true);

      toast({
        title: "Thank you! Your feedback means a lot. You’ve received 5 free credits.",
        description: "",
        variant: "default"
      });

      setRating(0);
      setComment("");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Couldn't submit feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disabled = rating === 0 || comment.trim().length < 50 || loading;

  return (
    <SidebarProvider>
      <MonetizationProvider>
        <div className="keeya-bg min-h-screen flex">
          <DashboardSidebar />
          <div className="flex-1">
            <div className="pt-safe">
              <div className="flex justify-between items-center px-6 py-4">
                <CommonHeader />
              </div>
            </div>
            <main className="container mx-auto px-6 py-8 max-w-2xl">
              <div className="space-y-12">
                <section className="text-center space-y-6">
                  <p className="text-lg leading-relaxed text-gray-700">
                    Keeya is a voice memory app that helps you record, store, and relive voices that matter.
                    Whether it's a bedtime story from your grandma, a friend's laugh, or your own voice today — Keeya lets you keep it safe, forever.
                  </p>
                </section>
                <section className="text-center">
                  <p className="text-base text-gray-600">
                    We're still building. If something feels off or something feels right — we'd love to hear it.
                  </p>
                </section>
                <section className="flex justify-center">
                  <button
                    onClick={handleEmailClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-voicevault-softgray/30 hover:bg-voicevault-softgray/50 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-voicevault-primary" />
                    <span className="text-gray-700">Contact us: keeya.app@gmail.com</span>
                  </button>
                </section>
                <section className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <button
                        key={starIndex}
                        onMouseEnter={() => handleStarHover(starIndex)}
                        onMouseLeave={handleStarLeave}
                        onClick={() => handleStarClick(starIndex)}
                        className="p-1 transition-transform hover:scale-110"
                        aria-label={`Rate ${starIndex} star${starIndex > 1 ? 's' : ''}`}
                        type="button"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            starIndex <= (hoveredStar || rating)
                              ? 'fill-voicevault-primary text-voicevault-primary'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center mt-3">
                    <Textarea
                      minLength={50}
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share a short message (at least 50 characters). What do you like or what could be better?"
                      required
                      className="w-full max-w-lg"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex justify-center mt-1">
                    <Button
                      onClick={handleSubmitRating}
                      disabled={disabled}
                      className="bg-voicevault-primary hover:bg-voicevault-primary/90"
                    >
                      {loading ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </div>
                  <div className="text-center text-xs text-gray-400 mt-2">
                    {comment.length < 50 && "Minimum 50 characters required."}
                  </div>
                  {submitted && (
                    <div className="text-center mt-4 text-green-600 font-semibold">
                      Thank you! Your feedback means a lot. You’ve received 5 free credits.
                    </div>
                  )}
                </section>
              </div>
            </main>
          </div>
        </div>
      </MonetizationProvider>
    </SidebarProvider>
  );
};

export default About;
