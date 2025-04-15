
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

    // Call the OpenVoice API on Replicate with an updated model version
    // Using the updated and valid model version for OpenVoice
    const output = await replicate.run(
      "lucataco/openvoice-24:77b436f65a3b2865b3cece65c32c9d6f10ffe7d9f9a1d859c7b250cd8cf193aa",
      {
        input: {
          text: text,
          reference_audio: referenceAudioUrl,
          language: language,
          emotion: emotion
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
