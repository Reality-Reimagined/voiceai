export const API_CONFIG = {
  TTS_SERVICE_URL: 'https://f5-tts-service-157176978845.us-central1.run.app',
  OPENAI_API_URL: 'https://api.openai.com/v1',
  GROQ_API_URL: 'https://api.groq.com/openai/v1',
  TOGETHER_API_URL: 'https://api.together.xyz',
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1',
};

export const PODCAST_PROMPT = (podcastName: string, topic: string) => `
Generate a dynamic and engaging podcast script for "${podcastName}" about "${topic}" featuring two hosts, [town] and [country], moderated by [main].


The conversation should be lively, detailed, and balanced, switching between the two hosts naturally. [main] introduces the topic, moderates when needed, and closes the episode. No additional narration or scene-setting outside of dialogue. Avoid special symbols or extra formatting. Focus on a seamless and captivating conversational flow. 

Structure Guidelines:

Introduction:

[main] Welcomes to {podcast name}. introduces the topic with enthusiasm and context. 
Discussion:

[town] and [country] engage in a thoughtful and engaging conversation.
Alternate speakers naturally.
Responses should be in-depth, with a mix of opinions, insights, and light banter when appropriate.
Moderation:

[main] steps in to clarify points, guide the conversation, or change the topic if needed.
Conclusion:

[main] wraps up the discussion with closing thoughts, takeaways, or a teaser for the next episode.
Tone & Style:

Conversational and authentic.
Use a balance of thoughtful insights and lighthearted moments.
Avoid monologues; keep responses interactive and responsive.


Example 
[main] Welcome to Politics Unplugged, the podcast where we dive into the world of politics and explore the issues that shape our nation! I am joined by the hosts Town and Country.
[town] Today, we're discussing the recent rise of social media influencers in Canadian politics. It seems like every politician is trying to become a social media sensation, but is this really the best way to connect with voters?
[country] Absolutely not, I think it's a complete waste of time. I agree with some of Town's points but I disagree. Politicians should be focused on developing meaningful policies and engaging with their constituents in a genuine way, not just trying to go viral on Twitter. It's all about substance over style, and I'm not convinced that social media is the best way to achieve that.`;