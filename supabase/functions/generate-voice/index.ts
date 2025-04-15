
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    })

    const { referenceAudioUrl, text, language = "en", emotion = "neutral", userId } = await req.json()

    if (!referenceAudioUrl || !text || !userId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: referenceAudioUrl, text, and userId are required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log("Starting voice generation with:", {
      referenceAudioUrl,
      textLength: text.length,
      language,
      emotion,
      userId
    })

    // First, check if user has enough credits
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('credits_balance')
      .eq('user_id', userId)
      .single()

    if (creditError) {
      console.error("Error checking user credits:", creditError)
      return new Response(JSON.stringify({ 
        error: "Error checking user credits" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Enhanced credit validation - ensure balance is at least 1
    if (!creditData || creditData.credits_balance < 1) {
      return new Response(JSON.stringify({ 
        error: "Insufficient credits" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Call the XTTS-v2 API on Replicate with the correct model version
    const output = await replicate.run(
      "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
      {
        input: {
          text: text,
          speaker: referenceAudioUrl
        }
      }
    )

    console.log("Voice generation completed:", output)

    // Use the correct RPC function to deduct credits
    const { data: updateData, error: updateError } = await supabase.rpc('decrement_user_credits', {
      p_user_id: userId,
      p_credits: 1
    })

    if (updateError) {
      console.error("Error deducting credits:", updateError)
      // Return error if credit deduction fails
      return new Response(JSON.stringify({ 
        error: "Failed to deduct credits: " + updateError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    } else {
      console.log("Credit deducted successfully")
    }

    return new Response(JSON.stringify({ output }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in generate-voice function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
