
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting create-checkout function");
    
    // Parse the request body
    const bodyText = await req.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error("Error parsing request body:", e, "Body:", bodyText);
      throw new Error(`Invalid request body: ${bodyText}`);
    }
    
    const { planId } = body;
    console.log("Plan selected:", planId);
    
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      console.error("Invalid plan selected:", planId);
      throw new Error(`Invalid plan selected: ${planId}`);
    }
    console.log("Plan details:", plan);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Authenticating user with token");
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error("Authentication error:", userError);
      throw new Error("Unauthorized");
    }
    console.log("User authenticated:", user.id);

    // Determine if this is a subscription or one-time payment
    const isSubscription = planId !== 'starter';
    console.log("Payment type:", isSubscription ? "subscription" : "one-time");
    
    // Get the origin for success and cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";
    console.log("Origin:", origin);
    
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
      success_url: `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        credits: plan.credits.toString(),
        planType: isSubscription ? 'subscription' : 'one-time',
      },
    };

    console.log("Creating checkout session with config:", JSON.stringify(sessionConfig, null, 2));
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log("Checkout session created:", session.id, "URL:", session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in create-checkout function:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
