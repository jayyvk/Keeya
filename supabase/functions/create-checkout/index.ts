
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Updated plans to match the pricing page
const PLANS = {
  starter: { price: 100, credits: 8 },   // Trial plan - one-time payment
  pro: { price: 1000, credits: 80 },     // Basic plan - $10/month for 80 credits
  family: { price: 2000, credits: 200 }  // Premium plan - $20/month for 200 credits
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId } = await req.json();
    const plan = PLANS[planId as keyof typeof PLANS];
    
    if (!plan) {
      throw new Error("Invalid plan selected");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) throw new Error("No authorization token provided");
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    // Determine if this is a subscription or one-time payment
    const isSubscription = planId !== 'starter';
    
    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planId === 'starter' ? 'Trial' : planId === 'pro' ? 'Basic' : 'Premium'} Plan`,
              description: `${plan.credits} voice generation credits${isSubscription ? '/month' : ''}`,
            },
            unit_amount: plan.price,
            ...(isSubscription && { recurring: { interval: "month" } }),
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${req.headers.get("origin")}/voice-cloning?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/voice-cloning?canceled=true`,
      metadata: {
        userId: user.id,
        credits: plan.credits,
        planType: isSubscription ? 'subscription' : 'one-time',
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
