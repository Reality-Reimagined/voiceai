import axios from 'axios';
import { API_CONFIG } from './config';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.TTS_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    // Add CORS headers on the client side (these will need to be allowed on the server)
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
});

// Add request interceptor to handle CORS preflight
apiClient.interceptors.request.use((config) => {
  // For preflight requests
  if (config.method === 'options') {
    config.headers['Access-Control-Request-Method'] = 'POST';
    config.headers['Access-Control-Request-Headers'] = 'content-type';
  }
  return config;
});

export const synthesizeText = async (text: string) => {
  try {
    const synthesisResponse = await apiClient.post('/synthesize/', { text });
    
    if (!synthesisResponse.data?.output_file) {
      throw new Error('No output file received');
    }

    const audioResponse = await apiClient.get(`/audio/${synthesisResponse.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
      fileName: synthesisResponse.data.output_file
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to synthesize text');
    }
    throw error;
  }
};

export const createPodcast = async (scriptContent: string, mainVoice: File, townVoice: File, countryVoice: File) => {
  try {
    // Validate file types
    if (mainVoice.type !== 'audio/flac' || townVoice.type !== 'audio/flac' || countryVoice.type !== 'audio/flac') {
      throw new Error('Main, town, and country voices must be FLAC files');
    }
    if (typeof scriptContent !== 'string') {
      throw new Error('Script content must be a string');
    }

    const formData = new FormData();
    formData.append('script', new Blob([scriptContent], { type: 'text/plain' }), 'script.txt');
    formData.append('main', mainVoice);
    formData.append('town', townVoice);
    formData.append('country', countryVoice);

    const response = await apiClient.post('/podcast/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data?.output_file) {
      throw new Error('No output file received');
    }

    const audioResponse = await apiClient.get(`/audio/${response.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
      fileName: response.data.output_file
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create podcast');
    }
    throw error;
  }
};

export const cloneVoice = async (audioFile: File, refText: string, customText: string) => {
  try {
    // Validate file type
    if (audioFile.type !== 'audio/flac') {
      throw new Error('Audio file must be a FLAC file');
    }
    if (typeof refText !== 'string' || typeof customText !== 'string') {
      throw new Error('Ref text and custom text must be strings');
    }

    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('ref_text', refText);
    formData.append('text', customText);

    const response = await apiClient.post('/voiceClone/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data?.output_file) {
      throw new Error('No output file received');
    }

    const audioResponse = await apiClient.get(`/audio/${response.data.output_file}`, {
      responseType: 'blob'
    });

    return {
      audioBlob: new Blob([audioResponse.data], { type: 'audio/wav' }),
      fileName: response.data.output_file
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to clone voice');
    }
    throw error;
  }
};

export const getAudioFile = async (fileName: string) => {
  try {
    const audioResponse = await apiClient.get(`/audio/${fileName}`, {
      responseType: 'blob'
    });

    return new Blob([audioResponse.data], { type: 'audio/wav/flac' });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to retrieve audio file');
    }
    throw error;
  }
};
