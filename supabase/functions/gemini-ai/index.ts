
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
    const { prompt, context, conversation_history } = await req.json();

    let systemPrompt = 'Anda adalah AI Assistant ahli budidaya ikan lele yang memberikan konsultasi dan analisis praktis. Berikan jawaban yang informatif, praktis, dan mudah dipahami. PENTING: JANGAN PERNAH gunakan simbol markdown seperti *, **, #, ##, ###, `, ```, -, atau simbol format lainnya dalam jawaban. Berikan respons dalam teks biasa yang rapi dan terstruktur tanpa format markdown apapun. Gunakan kata-kata biasa untuk penekanan, bukan simbol.';
    
    if (context === 'pond_analysis') {
      systemPrompt += ' Fokus pada analisis kondisi kolam dan berikan rekomendasi berdasarkan data yang diberikan.';
    } else if (context === 'pond_recommendations') {
      systemPrompt += ' Fokus pada rekomendasi spesifik untuk optimasi kolam dan budidaya ikan.';
    } else if (context === 'aquaculture_assistant') {
      systemPrompt += ' Berikan konsultasi umum seputar budidaya ikan lele.';
    }

    // Build conversation context
    let conversationText = prompt;
    if (conversation_history && conversation_history.length > 0) {
      const recentHistory = conversation_history.slice(-3); // Last 3 messages
      const historyText = recentHistory.map((msg: any) => 
        `${msg.role === 'user' ? 'Pengguna' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      conversationText = `Konteks percakapan sebelumnya:\n${historyText}\n\nPertanyaan terbaru: ${prompt}`;
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
                text: `${systemPrompt}\n\n${conversationText}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    const data = await response.json();
    let generatedText = data.candidates[0].content.parts[0].text;

    // Complete markdown cleaning - remove ALL formatting symbols
    generatedText = generatedText
      .replace(/\*\*\*([^*]+)\*\*\*/g, '$1') // Remove triple asterisks
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold 
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/#{1,6}\s*/g, '') // Remove all headers
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/^\s*[-*+•]\s+/gm, '') // Remove all bullet points
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/[-_]{2,}/g, '') // Remove horizontal lines
      .replace(/[*_#`~\[\]()]/g, '') // Remove remaining markdown symbols
      .replace(/\n\s*\n/g, '\n\n') // Clean up excessive line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return new Response(JSON.stringify({ 
      response: generatedText 
    }), {
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
