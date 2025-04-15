
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

function isStoryRequest(text: string): boolean {
  const storyKeywords = ['story', 'tell me', 'once upon', 'write'];
  return storyKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Determine if this is a story request or a message to enhance
    const isStory = isStoryRequest(text);
    const prompt = isStory 
      ? `Write a short, engaging bedtime story based on this prompt: "${text}". The story should be concise and take no more than 30 seconds to read aloud (approximately ${MAX_WORDS} words).`
      : `Enhance this text to make it more natural and conversational, while maintaining its core message: ${text}`;

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
          temperature: isStory ? 0.8 : 0.7,
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
