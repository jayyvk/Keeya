
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CreditCard, Users } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";

export function PricingCards() {
  const { credits, handlePayment } = useCredits();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Choose Your Plan
        </h1>
        <p className="text-gray-600">
          Get started with a trial or subscribe to a monthly plan for regular voice generations.
        </p>
        {credits !== null && (
          <p className="mt-2 text-sm text-gray-500">
            You have {credits} credit{credits !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Trial Plan */}
        <Card className="relative bg-white border-2 hover:border-voicevault-primary/20 transition-all">
          <CardHeader>
            <h3 className="text-2xl font-semibold">Trial</h3>
            <p className="text-gray-500">One-time purchase to try it out</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$1</div>
            <p className="text-sm text-gray-500">8 credits total</p>
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

        {/* Basic Plan */}
        <Card className="relative bg-white border-2 border-voicevault-primary">
          <Badge 
            className="absolute -top-2 right-4 bg-voicevault-primary"
            variant="default"
          >
            Most Popular
          </Badge>
          <CardHeader>
            <h3 className="text-2xl font-semibold">Basic</h3>
            <p className="text-gray-500">Perfect for regular use</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$10</div>
            <p className="text-sm text-gray-500">80 credits/month</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePayment('pro')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Subscribe Monthly
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="relative bg-white border-2 hover:border-voicevault-primary/20 transition-all">
          <CardHeader>
            <h3 className="text-2xl font-semibold">Premium</h3>
            <p className="text-gray-500">For power users</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">$20</div>
            <p className="text-sm text-gray-500">200 credits/month</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handlePayment('family')}
            >
              <Users className="w-4 h-4 mr-2" />
              Subscribe Monthly
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">Credits roll over each month for active subscriptions</p>
      </div>
    </div>
  );
}
