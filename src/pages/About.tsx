
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

const About = () => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleStarHover = (starIndex: number) => {
    setHoveredStar(starIndex);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:keeya.app@gmail.com?subject=Feedback%20for%20Keeya';
  };

  const handleSubmitRating = async () => {
    if (rating === 0 || !user) return;

    try {
      const { error } = await supabase
        .from('app_ratings')
        .insert({
          user_id: user.id,
          rating: rating,
        });

      if (error) throw error;

      toast({
        title: "Thanks for your feedback!",
        description: "We really appreciate your input.",
      });

      // Reset rating after submission
      setRating(0);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Couldn't submit rating",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <MonetizationProvider>
        <div className="min-h-screen bg-gradient-to-b from-voicevault-softpurple via-white to-white flex">
          <DashboardSidebar />
          <div className="flex-1">
            <div className="pt-safe">
              <div className="flex justify-between items-center px-6 py-4">
                <CommonHeader />
              </div>
            </div>

            <main className="container mx-auto px-6 py-8 max-w-2xl">
              <div className="space-y-12">
                {/* About Description */}
                <section className="text-center space-y-6">
                  <p className="text-lg leading-relaxed text-gray-700">
                    Keeya is a voice memory app that helps you record, store, and relive voices that matter.
                    Whether it's a bedtime story from your grandma, a friend's laugh, or your own voice today — Keeya lets you keep it safe, forever.
                  </p>
                </section>

                {/* Subheading */}
                <section className="text-center">
                  <p className="text-base text-gray-600">
                    We're still building. If something feels off or something feels right — we'd love to hear it.
                  </p>
                </section>

                {/* Contact Section */}
                <section className="flex justify-center">
                  <button
                    onClick={handleEmailClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-voicevault-softgray/30 hover:bg-voicevault-softgray/50 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-voicevault-primary" />
                    <span className="text-gray-700">Contact us: keeya.app@gmail.com</span>
                  </button>
                </section>

                {/* Rating Stars */}
                <section className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <button
                        key={starIndex}
                        onMouseEnter={() => handleStarHover(starIndex)}
                        onMouseLeave={handleStarLeave}
                        onClick={() => handleStarClick(starIndex)}
                        className="p-1 transition-transform hover:scale-110"
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
                  <div className="flex justify-center">
                    <Button
                      onClick={handleSubmitRating}
                      disabled={rating === 0}
                      className="bg-voicevault-primary hover:bg-voicevault-primary/90"
                    >
                      Submit Rating
                    </Button>
                  </div>
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
