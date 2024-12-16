import { useState } from 'react';
import { TTSRequest } from '../types';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

export function useTTS() {
  const [isLoading, setIsLoading] = useState(false);

  const generateSpeech = async (request: TTSRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Failed to generate speech');
      
      const data = await response.json();
      return data.audio_url;
    } catch (error) {
      toast.error('Failed to generate speech');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { generateSpeech, isLoading };
}