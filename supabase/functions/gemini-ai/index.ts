
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type } = await req.json();

    let systemPrompt = '';
    if (type === 'health-detection') {
      systemPrompt = `Anda adalah ahli akuakultur yang menganalisis kesehatan ikan lele. Berikan analisis berdasarkan deskripsi atau gejala yang diberikan. Format respons:
      {
        "healthScore": 85,
        "status": "healthy/sick/critical",
        "confidence": 92,
        "diagnosis": "Diagnosis singkat",
        "symptoms": ["gejala1", "gejala2"],
        "treatment": "Rekomendasi pengobatan",
        "prevention": "Tips pencegahan"
      }`;
    } else if (type === 'growth-prediction') {
      systemPrompt = `Anda adalah ahli akuakultur yang memberikan prediksi pertumbuhan dan strategi panen ikan lele. Berikan analisis berdasarkan data kolam. Format respons:
      {
        "growthRate": "baik/sedang/lambat",
        "harvestRecommendation": "Rekomendasi waktu panen",
        "feedingStrategy": "Strategi pemberian pakan",
        "expectedYield": "Prediksi hasil panen",
        "marketTiming": "Timing pasar terbaik",
        "profitEstimate": "Estimasi keuntungan"
      }`;
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser input: ${prompt}`
              }
            ]
          }
        ]
      }),
    });

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    // Try to parse JSON response, fallback to text if not valid JSON
    let aiResponse;
    try {
      aiResponse = JSON.parse(generatedText);
    } catch {
      aiResponse = { analysis: generatedText };
    }

    return new Response(JSON.stringify({ success: true, data: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-ai function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
