
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

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

    if (!referenceAudioUrl || !text) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: referenceAudioUrl and text are required" 
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

    // Deduct a credit from the user's account
    if (userId) {
      try {
        const { data, error } = await fetch(
          `https://zqhruotbmlyubyxwaaez.supabase.co/rest/v1/user_credits?user_id=eq.${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`,
              'apikey': `${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`,
            },
            body: JSON.stringify({
              credits_balance: -1 // Deduct 1 credit
            })
          }
        ).then(res => res.json())

        if (error) {
          console.error("Error deducting credits:", error)
        } else {
          console.log("Credit deducted successfully")
        }
      } catch (creditError) {
        console.error("Failed to deduct credit:", creditError)
      }
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
