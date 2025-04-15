
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing update-credits request");
    const { sessionId } = await req.json();
    console.log("Session ID:", sessionId);

    if (!sessionId) {
      throw new Error("No session ID provided");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    console.log("Retrieving Stripe session");
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session retrieved:", {
      id: session.id, 
      status: session.status,
      payment_status: session.payment_status,
      customer: session.customer,
      metadata: session.metadata
    });
    
    if (session.payment_status !== "paid") {
      console.log("Payment not completed, status:", session.payment_status);
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    if (!session.metadata?.userId || !session.metadata?.credits) {
      console.log("Missing metadata:", session.metadata);
      throw new Error("Session metadata is missing user ID or credits amount");
    }

    const userId = session.metadata.userId;
    const creditsToAdd = parseInt(session.metadata.credits || "0");
    
    console.log(`Adding ${creditsToAdd} credits to user ${userId}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // First check if the user exists
    const { data: userData, error: userError } = await supabase
      .from('user_credits')
      .select('credits_balance')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log("User credit check result:", { data: userData, error: userError });

    let result;
    if (userData) {
      // Update existing record
      console.log("Updating existing user credit record");
      result = await supabase
        .from('user_credits')
        .update({ 
          credits_balance: userData.credits_balance + creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create new record
      console.log("Creating new user credit record");
      result = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          credits_balance: creditsToAdd
        });
    }

    console.log("Credit update result:", result);
    
    if (result.error) {
      console.error("Error updating credits:", result.error);
      throw result.error;
    }

    // Record this transaction in credit_adjustments table
    const adjustmentResult = await supabase
      .from('credit_adjustments')
      .insert({
        user_id: userId,
        credits_added: creditsToAdd,
        reason: `Payment: ${session.id}`,
        adjusted_by: userId
      });
    
    console.log("Credit adjustment record result:", adjustmentResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Added ${creditsToAdd} credits to user ${userId}` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in update-credits function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
