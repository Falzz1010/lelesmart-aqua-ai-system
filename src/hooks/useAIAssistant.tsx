import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'analysis' | 'recommendation';
}

export interface PondAnalysisData {
  pondId: string;
  pondName: string;
  waterTemperature?: number;
  phLevel?: number;
  fishCount: number;
  fishAge: number;
  size: number;
  depth: number;
  status: string;
}

export const useAIAssistant = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const addMessage = useCallback((message: Omit<AIMessage, 'id' | 'timestamp'>) => {
    const newMessage: AIMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    
    // Add user message
    addMessage({ role: 'user', content, type: 'text' });

    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt: content,
          context: 'aquaculture_assistant',
          conversation_history: messages.slice(-5) // Send last 5 messages for context
        }
      });

      if (error) throw error;

      // Add AI response
      addMessage({
        role: 'assistant',
        content: data.response || 'Maaf, terjadi kesalahan dalam memproses permintaan Anda.',
        type: 'text'
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan ke AI Assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, addMessage, toast]);

  const analyzePondData = useCallback(async (pondData: PondAnalysisData[]) => {
    setIsAnalyzing(true);

    try {
      const analysisPrompt = `
        Sebagai ahli budidaya ikan, analisis data kolam berikut dan berikan rekomendasi:
        
        ${pondData.map(pond => `
        Kolam: ${pond.pondName}
        - Status: ${pond.status}
        - Ukuran: ${pond.size} m² (kedalaman ${pond.depth} m)
        - Jumlah ikan: ${pond.fishCount} ekor (umur ${pond.fishAge} hari)
        - Suhu air: ${pond.waterTemperature || 'tidak tersedia'}°C
        - pH: ${pond.phLevel || 'tidak tersedia'}
        `).join('\n')}
        
        Berikan analisis kondisi kolam, identifikasi masalah potensial, dan rekomendasi tindakan yang perlu dilakukan.
      `;

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt: analysisPrompt,
          context: 'pond_analysis'
        }
      });

      if (error) throw error;

      // Add analysis result
      addMessage({
        role: 'assistant',
        content: data.response || 'Tidak dapat menganalisis data kolam saat ini.',
        type: 'analysis'
      });

      return data.response;

    } catch (error) {
      console.error('Error analyzing pond data:', error);
      toast({
        title: "Error",
        description: "Gagal menganalisis data kolam",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [addMessage, toast]);

  const getRecommendations = useCallback(async (pondData: PondAnalysisData) => {
    try {
      const recommendationPrompt = `
        Berikan rekomendasi spesifik untuk kolam "${pondData.pondName}" dengan kondisi:
        - Jumlah ikan: ${pondData.fishCount} ekor (${pondData.fishAge} hari)
        - Ukuran kolam: ${pondData.size} m² × ${pondData.depth} m
        - Suhu: ${pondData.waterTemperature || 'tidak diketahui'}°C
        - pH: ${pondData.phLevel || 'tidak diketahui'}
        
        Fokus pada:
        1. Jadwal pemberian pakan optimal
        2. Monitoring kualitas air
        3. Prediksi waktu panen
        4. Tips meningkatkan produktivitas
      `;

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt: recommendationPrompt,
          context: 'pond_recommendations'
        }
      });

      if (error) throw error;

      addMessage({
        role: 'assistant',
        content: data.response || 'Tidak dapat memberikan rekomendasi saat ini.',
        type: 'recommendation'
      });

      return data.response;

    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Gagal mendapatkan rekomendasi",
        variant: "destructive",
      });
    }
  }, [addMessage, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isAnalyzing,
    sendMessage,
    analyzePondData,
    getRecommendations,
    clearMessages,
    addMessage
  };
};