
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Users } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";

export function PricingCards() {
  const { credits, handlePayment } = useCredits();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Buy Voice Credits
        </h1>
        <p className="text-gray-600">
          Use credits to generate stories in your loved one's voice. The first 2 are free.
          After that, buy more below.
        </p>
        {credits !== null && (
          <p className="mt-2 text-sm text-gray-500">
            You have {credits} credit{credits !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Starter Plan */}
        <Card className="relative bg-white border-2 hover:border-voicevault-primary/20 transition-all">
          <CardHeader>
            <h3 className="text-2xl font-semibold">Starter</h3>
            <p className="text-gray-500">8 credits — just to try it out</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$1</div>
            <p className="text-sm text-gray-500">$0.125 per credit</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handlePayment('starter')}
            >
              <Star className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative bg-white border-2 border-voicevault-primary">
          <Badge 
            className="absolute -top-2 right-4 bg-voicevault-primary"
            variant="default"
          >
            Most Popular
          </Badge>
          <CardHeader>
            <h3 className="text-2xl font-semibold">Pro</h3>
            <p className="text-gray-500">30 credits — best value</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$3</div>
            <p className="text-sm text-gray-500">$0.10 per credit</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePayment('pro')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>

        {/* Family Plan */}
        <Card className="relative bg-white border-2 hover:border-voicevault-primary/20 transition-all">
          <CardHeader>
            <h3 className="text-2xl font-semibold">Family</h3>
            <p className="text-gray-500">60 credits — for shared vaults</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$5</div>
            <p className="text-sm text-gray-500">$0.083 per credit</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handlePayment('family')}
            >
              <Users className="w-4 h-4 mr-2" />
              Go Family Plan
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500 mb-2">Credits never expire</p>
        <p className="text-sm text-gray-500">
          Want more? Custom plans available soon →
        </p>
      </div>
    </div>
  );
}
