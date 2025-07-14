
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeHealth = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt,
          context: 'aquaculture_assistant'
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data.response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const predictGrowth = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('gemini-ai', {
        body: {
          prompt,
          context: 'pond_recommendations'
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data.response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeHealth,
    predictGrowth,
    isLoading,
    error
  };
};
