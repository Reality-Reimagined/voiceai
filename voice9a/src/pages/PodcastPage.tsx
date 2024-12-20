import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScriptEditor } from '@/components/podcast/ScriptEditor';
import { VoiceSelector } from '@/components/podcast/VoiceSelector';
import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
import { createPodcast } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { generateWithLLM } from '@/lib/llm';
import { PODCAST_PROMPT } from '@/lib/config';


// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/components/ui/use-toast';
// import { ScriptEditor } from '@/components/podcast/ScriptEditor';
// import { VoiceSelector } from '@/components/podcast/VoiceSelector';
// import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
// import { createPodcast, getAudioFile } from '@/lib/api';
// import { Loader2 } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { supabase } from '@/lib/supabase';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Textarea } from '@/components/ui/textarea';
// import { generateWithLLM } from '@/lib/llm';
// import { PODCAST_PROMPT } from '@/lib/config';

const AVAILABLE_VOICES = [
  { id: 'voice1', name: 'Main Voice' },
  { id: 'voice2', name: 'Town Voice' },
  { id: 'voice3', name: 'Country Voice' },
];

const LLM_PROVIDERS = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'groq', name: 'Groq' },
  { id: 'together', name: 'Together.ai' },
  { id: 'gemini', name: 'Google Gemini' },
];

const MODELS = {
  openai: ['gpt-4', 'gpt-3.5-turbo'],
  groq: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
  together: ['mistral-7b-instruct', 'llama2-70b'],
  gemini: ['gemini-pro'],
};

export function PodcastPage() {
  const [topic, setTopic] = useState('');
  const [podcastName, setPodcastName] = useState('');
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [script, setScript] = useState('');
  const [mainVoice, setMainVoice] = useState('');
  const [townVoice, setTownVoice] = useState('');
  const [countryVoice, setCountryVoice] = useState('');
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const checkApiKey = async (provider: string) => {
    const { data } = await supabase
      .from('api_keys')
      .select('key')
      .eq('provider', provider)
      .single();
    return !!data?.key;
  };

  const saveApiKey = async () => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({ provider, key: apiKey });
      if (error) throw error;
      setShowApiKeyDialog(false);
      toast({ title: 'Success', description: 'API key saved successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save API key', variant: 'destructive' });
    }
  };

  const handleProviderChange = async (value: string) => {
    setProvider(value);
    setModel('');
    const hasKey = await checkApiKey(value);
    if (!hasKey) setShowApiKeyDialog(true);
  };

  const generateScript = async () => {
  if (!topic || !provider || !model || !podcastName) {
    toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
    return;
  }
  setLoading(true);
  try {
    const { data } = await supabase
      .from('api_keys')
      .select('key')
      .eq('provider', provider)
      .single();
    const key = data?.key;
    if (!key) throw new Error('API key not found');

    const prompt = PODCAST_PROMPT(podcastName, topic);
    const result = await generateWithLLM(prompt, provider, model, key);
    if (result.error) throw new Error(result.error);

    setScript(result.script);
    toast({ title: 'Success', description: 'Script generated successfully!' });
  } catch (error) {
    toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to generate script', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};

  const handleCreatePodcast = async () => {
  if (!script || !mainVoice || !townVoice || !countryVoice) {
    toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
    return;
  }
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('script', new Blob([script], { type: 'text/plain' }));
    formData.append('main', new File([], 'main.flac'));
    formData.append('town', new File([], 'town.flac'));
    formData.append('country', new File([], 'country.flac'));

    const response = await fetch('/podcast/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Podcast creation failed.');
    }

    const result = await response.json();
    const podcastName = result.output_file;

    if (!podcastName) {
      throw new Error('No output file returned.');
    }

    const downloadResponse = await fetch(`/audio/${podcastName}`);
    if (!downloadResponse.ok) {
      throw new Error('Failed to fetch the podcast audio.');
    }

    const audioBlob = await downloadResponse.blob();
    const url = URL.createObjectURL(audioBlob);
    setPodcastUrl(url);

    toast({ title: 'Success', description: 'Podcast created successfully!' });
  } catch (error) {
    toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create podcast', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};

  const handleDownload = () => {
    if (podcastUrl) {
      const a = document.createElement('a');
      a.href = podcastUrl;
      a.download = podcastUrl.split('/').pop() || 'podcast.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  return (
      <div className="container max-w-4xl py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Script</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="podcast-name">Podcast Name</Label>
                <Input
                  id="podcast-name"
                  value={podcastName}
                  onChange={(e) => setPodcastName(e.target.value)}
                  placeholder="Enter podcast name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter podcast topic"
                />
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LLM Provider</Label>
                <Select value={provider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {LLM_PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
  
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel} disabled={!provider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {provider && MODELS[provider as keyof typeof MODELS].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
  
            <Button 
              onClick={generateScript} 
              disabled={loading || !topic || !provider || !model || !podcastName}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Script
            </Button>
          </CardContent>
        </Card>
  
        {script && (
          <Card>
            <CardHeader>
              <CardTitle>Create Podcast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScriptEditor onScriptChange={setScript} disabled={loading} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <VoiceSelector
                  voices={AVAILABLE_VOICES}
                  selectedVoice={mainVoice}
                  onVoiceChange={setMainVoice}
                  label="Main Voice"
                  disabled={loading}
                />
                <VoiceSelector
                  voices={AVAILABLE_VOICES}
                  selectedVoice={townVoice}
                  onVoiceChange={setTownVoice}
                  label="Town Voice"
                  disabled={loading}
                />
                <VoiceSelector
                  voices={AVAILABLE_VOICES}
                  selectedVoice={countryVoice}
                  onVoiceChange={setCountryVoice}
                  label="Country Voice"
                  disabled={loading}
                />
              </div>
  
              <div className="flex justify-between items-center">
                <Button 
                  onClick={handleCreatePodcast} 
                  disabled={loading || !script || !mainVoice || !townVoice || !countryVoice}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Podcast
                </Button>
                {podcastUrl && <AudioPlayer audioUrl={podcastUrl} onDownload={handleDownload} />}
              </div>
            </CardContent>
          </Card>
        )}
  
        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter API Key</DialogTitle>
              <DialogDescription>
                Please enter your API key for {LLM_PROVIDERS.find(p => p.id === provider)?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
            <DialogFooter>
              <Button onClick={saveApiKey} disabled={!apiKey}>Save API Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }




// // import { useState } from 'react';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// // import { useToast } from '@/components/ui/use-toast';
// // import { ScriptEditor } from '@/components/podcast/ScriptEditor';
// // import { VoiceSelector } from '@/components/podcast/VoiceSelector';
// // import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
// // import { createPodcast, getAudioFile } from '@/lib/api';
// // import { Loader2 } from 'lucide-react';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// // import { supabase } from '@/lib/supabase';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// // import { Textarea } from '@/components/ui/textarea';
// // import { generateWithLLM } from '@/lib/llm';
// // import { PODCAST_PROMPT } from '@/lib/config';

// // const AVAILABLE_VOICES = [
// //   { id: 'voice1', name: 'Main Voice' },
// //   { id: 'voice2', name: 'Town Voice' },
// //   { id: 'voice3', name: 'Country Voice' },
// // ];

// // const LLM_PROVIDERS = [
// //   { id: 'openai', name: 'OpenAI' },
// //   { id: 'groq', name: 'Groq' },
// //   { id: 'together', name: 'Together.ai' },
// //   { id: 'gemini', name: 'Google Gemini' },
// // ];

// // const MODELS = {
// //   openai: ['gpt-4', 'gpt-3.5-turbo'],
// //   groq: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
// //   together: ['mistral-7b-instruct', 'llama2-70b'],
// //   gemini: ['gemini-pro'],
// // };

// // export function PodcastPage() {
// //   const [topic, setTopic] = useState('');
// //   const [podcastName, setPodcastName] = useState('');
// //   const [provider, setProvider] = useState('');
// //   const [model, setModel] = useState('');
// //   const [script, setScript] = useState('');
// //   const [mainVoice, setMainVoice] = useState('');
// //   const [townVoice, setTownVoice] = useState('');
// //   const [countryVoice, setCountryVoice] = useState('');
// //   const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(false);
// //   const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
// //   const [apiKey, setApiKey] = useState('');
// //   const { toast } = useToast();

// //   const checkApiKey = async (provider: string) => {
// //     const { data } = await supabase
// //       .from('api_keys')
// //       .select('key')
// //       .eq('provider', provider)
// //       .single();
// //     return !!data?.key;
// //   };

// //   const saveApiKey = async () => {
// //     try {
// //       const { error } = await supabase
// //         .from('api_keys')
// //         .upsert({ provider, key: apiKey });
// //       if (error) throw error;
// //       setShowApiKeyDialog(false);
// //       toast({ title: 'Success', description: 'API key saved successfully' });
// //     } catch (error) {
// //       toast({ title: 'Error', description: 'Failed to save API key', variant: 'destructive' });
// //     }
// //   };

// //   const handleProviderChange = async (value: string) => {
// //     setProvider(value);
// //     setModel('');
// //     const hasKey = await checkApiKey(value);
// //     if (!hasKey) setShowApiKeyDialog(true);
// //   };

// //   const generateScript = async () => {
// //     if (!topic || !provider || !model || !podcastName) {
// //       toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       const { data } = await supabase
// //         .from('api_keys')
// //         .select('key')
// //         .eq('provider', provider)
// //         .single();
// //       const key = data?.key;
// //       if (!key) throw new Error('API key not found');
// //       const prompt = PODCAST_PROMPT(podcastName, topic);
// //       const result = await generateWithLLM(prompt, provider, model, key);
// //       if (result.error) throw new Error(result.error);
// //       setScript(result.script);
// //       toast({ title: 'Success', description: 'Script generated successfully!' });
// //     } catch (error) {
// //       toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to generate script', variant: 'destructive' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleCreatePodcast = async () => {
// //     if (!script || !mainVoice || !townVoice || !countryVoice) {
// //       toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       const mainFile = new File([], 'main.flac');
// //       const townFile = new File([], 'town.flac');
// //       const countryFile = new File([], 'country.flac');
// //       const podcastResult = await createPodcast(script, mainFile, townFile, countryFile);
// //       if (!podcastResult) throw new Error('Podcast creation failed.');
// //       const audioBlob = await getAudioFile(podcastResult.output_file);
// //       const url = URL.createObjectURL(audioBlob);
// //       setPodcastUrl(url);
// //       toast({ title: 'Success', description: 'Podcast created successfully!' });
// //     } catch (error) {
// //       toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create podcast', variant: 'destructive' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDownload = () => {
// //     if (podcastUrl) {
// //       const a = document.createElement('a');
// //       a.href = podcastUrl;
// //       a.download = 'podcast.mp3';
// //       document.body.appendChild(a);
// //       a.click();
// //       document.body.removeChild(a);
// //     }
// //   };

// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/components/ui/use-toast';
// import { ScriptEditor } from '@/components/podcast/ScriptEditor';
// import { VoiceSelector } from '@/components/podcast/VoiceSelector';
// import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
// import { createPodcast, getAudioFile } from '@/lib/api';
// import { Loader2 } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { supabase } from '@/lib/supabase';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Textarea } from '@/components/ui/textarea';
// import { generateWithLLM } from '@/lib/llm';
// import { PODCAST_PROMPT } from '@/lib/config';

// const AVAILABLE_VOICES = [
//   { id: 'voice1', name: 'Main Voice' },
//   { id: 'voice2', name: 'Town Voice' },
//   { id: 'voice3', name: 'Country Voice' },
// ];

// const LLM_PROVIDERS = [
//   { id: 'openai', name: 'OpenAI' },
//   { id: 'groq', name: 'Groq' },
//   { id: 'together', name: 'Together.ai' },
//   { id: 'gemini', name: 'Google Gemini' },
// ];

// const MODELS = {
//   openai: ['gpt-4', 'gpt-3.5-turbo'],
//   groq: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
//   together: ['mistral-7b-instruct', 'llama2-70b'],
//   gemini: ['gemini-pro'],
// };

// export function PodcastPage() {
//   const [topic, setTopic] = useState('');
//   const [podcastName, setPodcastName] = useState('');
//   const [provider, setProvider] = useState('');
//   const [model, setModel] = useState('');
//   const [script, setScript] = useState('');
//   const [mainVoice, setMainVoice] = useState('');
//   const [townVoice, setTownVoice] = useState('');
//   const [countryVoice, setCountryVoice] = useState('');
//   const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
//   const [apiKey, setApiKey] = useState('');
//   const { toast } = useToast();

//   const checkApiKey = async (provider: string) => {
//     const { data } = await supabase
//       .from('api_keys')
//       .select('key')
//       .eq('provider', provider)
//       .single();
//     return !!data?.key;
//   };

//   const saveApiKey = async () => {
//     try {
//       const { error } = await supabase
//         .from('api_keys')
//         .upsert({ provider, key: apiKey });
//       if (error) throw error;
//       setShowApiKeyDialog(false);
//       toast({ title: 'Success', description: 'API key saved successfully' });
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to save API key', variant: 'destructive' });
//     }
//   };

//   const handleProviderChange = async (value: string) => {
//     setProvider(value);
//     setModel('');
//     const hasKey = await checkApiKey(value);
//     if (!hasKey) setShowApiKeyDialog(true);
//   };

//   const generateScript = async () => {
//     if (!topic || !provider || !model || !podcastName) {
//       toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
//       return;
//     }
//     setLoading(true);
//     try {
//       const { data } = await supabase
//         .from('api_keys')
//         .select('key')
//         .eq('provider', provider)
//         .single();
//       const key = data?.key;
//       if (!key) throw new Error('API key not found');
//       const prompt = PODCAST_PROMPT(podcastName, topic);
//       const result = await generateWithLLM(prompt, provider, model, key);
//       if (result.error) throw new Error(result.error);
//       setScript(result.script);
//       toast({ title: 'Success', description: 'Script generated successfully!' });
//     } catch (error) {
//       toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to generate script', variant: 'destructive' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleCreatePodcast = async () => {
//   //   if (!script || !mainVoice || !townVoice || !countryVoice) {
//   //     toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
//   //     return;
//   //   }
//   //   setLoading(true);
//   //   try {
//   //     const mainFile = new File([], 'main.flac');
//   //     const townFile = new File([], 'town.flac');
//   //     const countryFile = new File([], 'country.flac');
//   //     const podcastResult = await createPodcast(script, mainFile, townFile, countryFile);
//   //     if (!('output_file' in podcastResult)) {
//   //       throw new Error('Podcast creation failed. Missing output file.');
//   //     }
//   //     const audioBlob = await getAudioFile(podcastResult.output_file);
//   //     const url = URL.createObjectURL(audioBlob);
//   //     setPodcastUrl(url);
//   //     toast({ title: 'Success', description: 'Podcast created successfully!' });
//   //   } catch (error) {
//   //     toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create podcast', variant: 'destructive' });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleCreatePodcast = async () => {
//     if (!script || !mainVoice || !townVoice || !countryVoice) {
//       toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
//       return;
//     }
//     setLoading(true);
//     try {
//       const mainFile = new File([], 'main.flac');
//       const townFile = new File([], 'town.flac');
//       const countryFile = new File([], 'country.flac');
//       const podcastResult: { output_file: string } = await createPodcast(script, mainFile, townFile, countryFile);
//       if (!('output_file' in podcastResult)) {
//         throw new Error('Podcast creation failed. Missing output file.');
//       }
//       const audioBlob = await getAudioFile(podcastResult.output_file as string);
//       const url = URL.createObjectURL(audioBlob);
//       setPodcastUrl(url);
//       toast({ title: 'Success', description: 'Podcast created successfully!' });
//     } catch (error) {
//       toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create podcast', variant: 'destructive' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = () => {
//     if (podcastUrl) {
//       const a = document.createElement('a');
//       a.href = podcastUrl;
//       a.download = 'podcast.mp3';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     }
//   };




// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/components/ui/use-toast';
// import { ScriptEditor } from '@/components/podcast/ScriptEditor';
// import { VoiceSelector } from '@/components/podcast/VoiceSelector';
// import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
// import { createPodcast, getAudioFile } from '@/lib/api';
// import { Loader2 } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { supabase } from '@/lib/supabase';
// // import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Textarea } from '@/components/ui/textarea';
// import { generateWithLLM } from '@/lib/llm';
// import { PODCAST_PROMPT } from '@/lib/config';
// // import type { ApiResponse } from '@/types';

// const AVAILABLE_VOICES = [
//   { id: 'voice1', name: 'Main Voice' },
//   { id: 'voice2', name: 'Town Voice' },
//   { id: 'voice3', name: 'Country Voice' },
// ];

// const LLM_PROVIDERS = [
//   { id: 'openai', name: 'OpenAI' },
//   { id: 'groq', name: 'Groq' },
//   { id: 'together', name: 'Together.ai' },
//   { id: 'gemini', name: 'Google Gemini' },
// ];

// const MODELS = {
//   openai: ['gpt-4', 'gpt-3.5-turbo'],
//   groq: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
//   together: ['mistral-7b-instruct', 'llama2-70b'],
//   gemini: ['gemini-pro'],
// };

// export function PodcastPage() {
//   const [topic, setTopic] = useState('');
//   const [podcastName, setPodcastName] = useState('');
//   const [provider, setProvider] = useState('');
//   const [model, setModel] = useState('');
//   const [script, setScript] = useState('');
//   const [mainVoice, setMainVoice] = useState('');
//   const [townVoice, setTownVoice] = useState('');
//   const [countryVoice, setCountryVoice] = useState('');
//   const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
//   const [apiKey, setApiKey] = useState('');
//   const { toast } = useToast();

//   const checkApiKey = async (provider: string) => {
//     const { data } = await supabase
//       .from('api_keys')
//       .select('key')
//       .eq('provider', provider)
//       .single();
    
//     return !!data?.key;
//   };

//   const saveApiKey = async () => {
//     try {
//       const { error } = await supabase
//         .from('api_keys')
//         .upsert({ provider, key: apiKey });

//       if (error) throw error;

//       setShowApiKeyDialog(false);
//       toast({
//         title: 'Success',
//         description: 'API key saved successfully',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to save API key',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleProviderChange = async (value: string) => {
//     setProvider(value);
//     setModel('');
    
//     const hasKey = await checkApiKey(value);
//     if (!hasKey) {
//       setShowApiKeyDialog(true);
//     }
//   };

//  // Replace the generateScript function with:
// const generateScript = async () => {
//   if (!topic || !provider || !model || !podcastName) {
//     toast({
//       title: 'Error',
//       description: 'Please fill in all required fields',
//       variant: 'destructive',
//     });
//     return;
//   }

//   setLoading(true);
//   try {
//     const { data } = await supabase
//       .from('api_keys')
//       .select('key')
//       .eq('provider', provider)
//       .single();

//     const key = data?.key;
//     if (!key) {
//       throw new Error('API key not found');
//     }

//     const prompt = PODCAST_PROMPT(podcastName, topic);
//     const result = await generateWithLLM(prompt, provider, model, key);

//     if (result.error) {
//       throw new Error(result.error);
//     }

//     setScript(result.script);
//     toast({
//       title: 'Success',
//       description: 'Script generated successfully!',
//     });
//   } catch (error) {
//     toast({
//       title: 'Error',
//       description: error instanceof Error ? error.message : 'Failed to generate script',
//       variant: 'destructive',
//     });
//   } finally {
//     setLoading(false);
//   }
// };

//     const handleCreatePodcast = async () => {
//   if (!script || !mainVoice || !townVoice || !countryVoice) {
//     toast({
//       title: 'Error',
//       description: 'Please fill in all required fields',
//       variant: 'destructive',
//     });
//     return;
//   }

//   setLoading(true);
//   try {
//     // Generate voice files based on voice selections
//     const mainFile = new File([], 'main.flac');
//     const townFile = new File([], 'town.flac');
//     const countryFile = new File([], 'country.flac');

//     const podcastResult = await createPodcast(
//       script,
//       mainFile,
//       townFile,
//       countryFile
//     );

//     if (!podcastResult) {
//       throw new Error('Podcast creation failed.');
//     }

//     const audioBlob = await getAudioFile(podcastResult.output_file);
//     const url = URL.createObjectURL(audioBlob);
//     setPodcastUrl(url);

//     toast({
//       title: 'Success',
//       description: 'Podcast created successfully!',
//     });
//   } catch (error) {
//     toast({
//       title: 'Error',
//       description: error instanceof Error ? error.message : 'Failed to create podcast',
//       variant: 'destructive',
//     });
//   } finally {
//     setLoading(false);
//   }
// };

//   // const handleCreatePodcast = async () => {
//   //   if (!script || !mainVoice || !townVoice || !countryVoice) {
//   //     toast({
//   //       title: 'Error',
//   //       description: 'Please fill in all required fields',
//   //       variant: 'destructive',
//   //     });
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     // In a real implementation, you would get the actual voice files
//   //     const mainFile = new File([], 'main.flac');
//   //     const townFile = new File([], 'town.flac');
//   //     const countryFile = new File([], 'country.flac');

//   //     const { output_file } = await createPodcast(
//   //       script,
//   //       mainFile,
//   //       townFile,
//   //       countryFile
//   //     );
      
//   //     const audioBlob = await getAudioFile(output_file);
//   //     const url = URL.createObjectURL(audioBlob);
//   //     setPodcastUrl(url);

//   //     toast({
//   //       title: 'Success',
//   //       description: 'Podcast created successfully!',
//   //     });
//   //   } catch (error) {
//   //     toast({
//   //       title: 'Error',
//   //       description: error instanceof Error ? error.message : 'Failed to create podcast',
//   //       variant: 'destructive',
//   //     });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleDownload = () => {
//     if (podcastUrl) {
//       const a = document.createElement('a');
//       a.href = podcastUrl;
//       a.download = 'podcast.mp3';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     }
//   };

//   return (
//     <div className="container max-w-4xl py-8">
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle>Generate Script</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="podcast-name">Podcast Name</Label>
//               <Input
//                 id="podcast-name"
//                 value={podcastName}
//                 onChange={(e) => setPodcastName(e.target.value)}
//                 placeholder="Enter podcast name"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="topic">Topic</Label>
//               <Input
//                 id="topic"
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//                 placeholder="Enter podcast topic"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>LLM Provider</Label>
//               <Select value={provider} onValueChange={handleProviderChange}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select provider" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {LLM_PROVIDERS.map((p) => (
//                     <SelectItem key={p.id} value={p.id}>
//                       {p.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label>Model</Label>
//               <Select value={model} onValueChange={setModel} disabled={!provider}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select model" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {provider && MODELS[provider as keyof typeof MODELS].map((m) => (
//                     <SelectItem key={m} value={m}>
//                       {m}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <Button 
//             onClick={generateScript} 
//             disabled={loading || !topic || !provider || !model || !podcastName}
//           >
//             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Generate Script
//           </Button>
//         </CardContent>
//       </Card>

//       {script && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Create Podcast</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <ScriptEditor onScriptChange={setScript} disabled={loading} />
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <VoiceSelector
//                 voices={AVAILABLE_VOICES}
//                 selectedVoice={mainVoice}
//                 onVoiceChange={setMainVoice}
//                 label="Main Voice"
//                 disabled={loading}
//               />
//               <VoiceSelector
//                 voices={AVAILABLE_VOICES}
//                 selectedVoice={townVoice}
//                 onVoiceChange={setTownVoice}
//                 label="Town Voice"
//                 disabled={loading}
//               />
//               <VoiceSelector
//                 voices={AVAILABLE_VOICES}
//                 selectedVoice={countryVoice}
//                 onVoiceChange={setCountryVoice}
//                 label="Country Voice"
//                 disabled={loading}
//               />
//             </div>

//             <div className="flex justify-between items-center">
//               <Button 
//                 onClick={handleCreatePodcast} 
//                 disabled={loading || !script || !mainVoice || !townVoice || !countryVoice}
//               >
//                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Create Podcast
//               </Button>
//               {podcastUrl && <AudioPlayer audioUrl={podcastUrl} onDownload={handleDownload} />}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Enter API Key</DialogTitle>
//             <DialogDescription>
//               Please enter your API key for {LLM_PROVIDERS.find(p => p.id === provider)?.name}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <Textarea
//               value={apiKey}
//               onChange={(e) => setApiKey(e.target.value)}
//               placeholder="Enter your API key"
//             />
//           </div>
//           <DialogFooter>
//             <Button onClick={saveApiKey} disabled={!apiKey}>Save API Key</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
