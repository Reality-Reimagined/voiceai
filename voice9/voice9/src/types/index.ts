export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  subscription_status?: string;
  subscription_end_date?: string;
}

export interface VoiceStyle {
  id: string;
  name: string;
  description: string;
  preview_url: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
  highlighted?: boolean;
}

export interface ApiResponse {
  output_file: string;
  audioBlob: Blob;
  fileName: string;
}