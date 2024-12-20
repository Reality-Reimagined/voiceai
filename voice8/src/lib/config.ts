export const API_CONFIG = {
  TTS_SERVICE_URL: 'https://f5-tts-service-157176978845.us-central1.run.app',
  OPENAI_API_URL: 'https://api.openai.com/v1',
  GROQ_API_URL: 'https://api.groq.com/v1',
  TOGETHER_API_URL: 'https://api.together.xyz',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1',
};

export const PODCAST_PROMPT = (podcastName: string, topic: string) => `
Generate a dynamic and engaging podcast script for "${podcastName}" about "${topic}" featuring two hosts, [town] and [country], moderated by [main].

The conversation should be lively, detailed, and balanced, switching between the two hosts naturally. [main] introduces the topic, moderates when needed, and closes the episode.

Structure:
1. [main] Welcome and topic introduction
2. Natural discussion between [town] and [country]
3. [main] Moderation and guidance
4. [main] Closing thoughts

Keep the tone conversational and authentic, with a mix of insights and light moments. Ensure balanced participation between hosts.
`;