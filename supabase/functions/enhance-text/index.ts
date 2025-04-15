
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL_NAME = "gemini-1.5-flash";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORDS_PER_SECOND = 2.5; // Average speaking rate
const TARGET_DURATION = 30; // Maximum duration in seconds
const MAX_WORDS = Math.floor(WORDS_PER_SECOND * TARGET_DURATION);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const { text } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const prompt = `Enhance this text to make it sound natural and conversational. Maintain the original meaning but make it flow better for speaking: ${text}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    const data = await response.json();
    console.log('Gemini API response:', data);

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const enhancedText = data.candidates[0].content.parts[0].text;
      return new Response(JSON.stringify({ enhancedText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Error in enhance-text function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
