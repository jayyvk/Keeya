import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CreditCard, Users, Loader2 } from "lucide-react";
import { useMonetization } from "@/contexts/MonetizationContext";
import { PaymentType } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function PricingCards() {
  const { credits, handlePurchase, isProcessingPayment } = useMonetization();
  const { toast } = useToast();

  const onPurchaseClick = (planType: PaymentType) => {
    console.log(`Initiating purchase for plan: ${planType}`);
    
    try {
      handlePurchase(planType);
    } catch (error) {
      console.error("Error in purchase click handler:", error);
      toast({
        title: "Error",
        description: "Failed to initiate payment process. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Choose Your Plan
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          Get started with a trial or subscribe to a monthly plan for regular voice generations.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          You have {credits.available} credit{credits.available !== 1 ? 's' : ''} remaining
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Trial Plan */}
        <Card className="relative bg-white border-2 hover:border-voicevault-primary/20 transition-all h-full">
          <CardHeader className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-semibold">Trial</h3>
            <p className="text-sm text-gray-500">One-time purchase to try it out</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold mb-2">$1</div>
            <p className="text-sm text-gray-500">8 credits total</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-sm" 
              variant="outline"
              onClick={() => onPurchaseClick('starter')}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Get Started
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Basic Plan */}
        <Card className="relative bg-white border-2 border-voicevault-primary h-full">
          <Badge 
            className="absolute -top-2 right-4 bg-voicevault-primary"
            variant="default"
          >
            Most Popular
          </Badge>
          <CardHeader className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-semibold">Basic</h3>
            <p className="text-sm text-gray-500">Perfect for regular use</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold mb-2">$10</div>
            <p className="text-sm text-gray-500">80 credits/month</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-sm"
              onClick={() => onPurchaseClick('pro')}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscribe Monthly
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="relative bg-white border-2 hover:border-voicevault-primary/20 transition-all h-full">
          <CardHeader className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-semibold">Premium</h3>
            <p className="text-sm text-gray-500">For power users</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold mb-2">$20</div>
            <p className="text-sm text-gray-500">200 credits/month</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-sm"
              variant="outline"
              onClick={() => onPurchaseClick('family')}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Subscribe Monthly
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
