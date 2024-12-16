export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_tier: 'free' | 'premium';
}

export interface TTSRequest {
  text: string;
  voice_id?: string;
  style?: string;
  language?: string;
}

export interface VoiceClone {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  status: 'processing' | 'ready' | 'failed';
  reference_audio_url: string;
}