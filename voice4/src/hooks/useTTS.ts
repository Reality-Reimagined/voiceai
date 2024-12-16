import { useState, useEffect, useRef } from 'react';
import { TTSRequest } from '../types';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

export function useTTS() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initWebSocket = () => {
    if (!websocketRef.current) {
      websocketRef.current = new WebSocket(`ws://${API_URL.replace('http://', '')}/ws/tts`);
      audioContextRef.current = new AudioContext();
    }
  };

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

  const streamSpeech = async (request: TTSRequest) => {
    try {
      initWebSocket();
      if (!websocketRef.current || !audioContextRef.current) return;

      setIsStreaming(true);
      
      websocketRef.current.onmessage = async (event) => {
        if (event.data === 'END_OF_AUDIO') {
          setIsStreaming(false);
          return;
        }

        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          const source = audioContextRef.current!.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current!.destination);
          source.start();
        }
      };

      websocketRef.current.send(JSON.stringify(request));
    } catch (error) {
      toast.error('Failed to stream speech');
      console.error(error);
      setIsStreaming(false);
    }
  };

  return { generateSpeech, streamSpeech, isLoading, isStreaming };
}