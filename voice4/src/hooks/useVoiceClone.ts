import { useState } from 'react';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

interface CloneVoiceParams {
  name: string;
  file: File;
}

export function useVoiceClone() {
  const [isLoading, setIsLoading] = useState(false);

  const cloneVoice = async ({ name, file }: CloneVoiceParams) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/clone-voice`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to clone voice');
      
      const data = await response.json();
      toast.success('Voice cloning started successfully');
      return data;
    } catch (error) {
      toast.error('Failed to clone voice');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { cloneVoice, isLoading };
}