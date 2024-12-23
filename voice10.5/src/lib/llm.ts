import axios from 'axios';
import { API_CONFIG } from './config';

interface LLMResponse {
  script: string;
  error?: string;
}

const createHeaders = (apiKey: string, provider: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'groq':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'together':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'gemini':
      headers['x-goog-api-key'] = apiKey;
      break;
  }

  return headers;
};

const formatResponse = (response: any, provider: string): string => {
  switch (provider) {
    case 'openai':
      return response.choices[0].message.content;
    case 'groq':
      return response.choices[0].message.content;
    case 'together':
      return response.output.content;
    case 'gemini':
      return response.candidates[0].content.parts[0].text;
    default:
      throw new Error('Unsupported provider');
  }
};

export async function generateWithLLM(
  prompt: string,
  provider: string,
  model: string,
  apiKey: string
): Promise<LLMResponse> {
  try {
    const headers = createHeaders(apiKey, provider);
    let response;

    switch (provider) {
      case 'openai':
        response = await axios.post(
          `${API_CONFIG.OPENAI_API_URL}/chat/completions`,
          {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          },
          { headers }
        );
        break;

      case 'groq':
        response = await axios.post(
          `${API_CONFIG.GROQ_API_URL}/chat/completions`,
          {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          },
          { headers }
        );
        break;

      case 'together':
        response = await axios.post(
          `${API_CONFIG.TOGETHER_API_URL}/inference`,
          {
            model,
            prompt,
            temperature: 0.7,
            max_tokens: 1024,
          },
          { headers }
        );
        break;

      case 'gemini':
        response = await axios.post(
          `${API_CONFIG.GEMINI_API_URL}/models/${model}:generateContent`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          },
          { headers }
        );
        break;

      default:
        throw new Error('Unsupported provider');
    }

    return {
      script: formatResponse(response.data, provider),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        script: '',
        error: error.response?.data?.error?.message || 'Failed to generate script',
      };
    }
    return {
      script: '',
      error: 'An unexpected error occurred',
    };
  }
}