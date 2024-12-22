import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScriptEditor } from '@/components/podcast/ScriptEditor';
import { VoiceSelector } from '@/components/podcast/VoiceSelector';
import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
// import { createPodcast } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { generateWithLLM } from '@/lib/llm';
import { PODCAST_PROMPT } from '@/lib/config';
import { ChevronDown, ChevronUp, Search, Replace } from 'lucide-react';

const API_CONFIG = {
  TTS_SERVICE_URL: import.meta.env.VITE_TTS_SERVICE_URL || 'http://localhost:8000'
};

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
  groq: ['mixtral-8x7b-32768', 'llama-3.3-70b-versatile'],
  together: ['mistral-7b-instruct', 'llama2-70b'],
  gemini: ['gemini-pro'],
};

interface UploadedFiles {
  mainVoice?: File;
  townVoice?: File;
  countryVoice?: File;
}

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
  const [userUploadedFiles, setUserUploadedFiles] = useState<UploadedFiles>({});
  const { toast } = useToast();
  const [isTopicExpanded, setIsTopicExpanded] = useState(false);

  const getVoiceFileName = (voiceType: keyof UploadedFiles) => {
    const file = userUploadedFiles[voiceType];
    return file ? file.name : 'No file uploaded';
  };

  const checkApiKey = async (provider: string): Promise<string | null> => {
    // Check environment variable
    const envKey = import.meta.env[`VITE_API_KEY_${provider.toUpperCase()}`];
    if (envKey) {
      return envKey; // Return the key as a string
    }

    // Check database
    const { data } = await supabase
      .from('api_keys')
      .select('key')
      .eq('provider', provider)
      .single();

    return data?.key || null; // Return the key or null
  };

  // const checkApiKey = async (provider: string) => {
  //   const { data } = await supabase
  //     .from('api_keys')
  //     .select('key')
  //     .eq('provider', provider)
  //     .single();
  //   return !!data?.key;
  // };

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

  // const handleProviderChange = async (value: string) => {
  //   setProvider(value);
  //   setModel('');
  //   const hasKey = await checkApiKey(value);
  //   if (!hasKey) setShowApiKeyDialog(true);
  // };

  const handleProviderChange = async (value: string) => {
    setProvider(value);
    setModel('');
  
    const key = await checkApiKey(value); // Corrected
    if (!key) {
      setShowApiKeyDialog(true); // Open dialog for manual input
    }
  };

  const handleFileUpload = (voiceType: keyof UploadedFiles) => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('flac')) {
        toast({
          title: 'Error',
          description: 'Please upload a FLAC file',
          variant: 'destructive'
        });
        return;
      }
      setUserUploadedFiles(prev => ({
        ...prev,
        [voiceType]: file
      }));
    }
  };

//   const generateScript = async () => {
//   if (!topic || !provider || !model || !podcastName) {
//     toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
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
//     if (!key) throw new Error('API key not found');

//     const prompt = PODCAST_PROMPT(podcastName, topic);
//     const result = await generateWithLLM(prompt, provider, model, key);
//     if (result.error) throw new Error(result.error);

//     setScript(result.script);
//     toast({ title: 'Success', description: 'Script generated successfully!' });
//   } catch (error) {
//     toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to generate script', variant: 'destructive' });
//   } finally {
//     setLoading(false);
//   }
// };

    const generateScript = async () => {
    if (!topic || !provider || !model || !podcastName) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const key = await checkApiKey(provider); // Corrected
      if (!key) {
        throw new Error('API key not found');
      }

      const prompt = PODCAST_PROMPT(podcastName, topic);
      const result = await generateWithLLM(prompt, provider, model, key);
      // console.log('LLM Response:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      // console.log('Setting script to:', result.script);
      setScript(result.script);
      // console.log('Script state after setting:', script);

      toast({
        title: 'Success',
        description: 'Script generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate script',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePodcast = async () => {
    if (!script || !mainVoice || !townVoice || !countryVoice) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all required fields', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      // Create a FormData instance
      const formData = new FormData();
      
      // Add the script as a text file
      const scriptBlob = new Blob([script], { type: 'text/plain' });
      formData.append('script', scriptBlob, 'story.txt');

      // Function to get default voice file from public directory
      const getDefaultVoiceFile = async (filename: string) => {
        const response = await fetch(`/default-voices/${filename}`);
        if (!response.ok) throw new Error(`Failed to load ${filename}`);
        const blob = await response.blob();
        return new File([blob], filename, { type: 'audio/flac' });
      };

      // Get the voice files (either uploaded or default)
      const mainFile = userUploadedFiles.mainVoice || await getDefaultVoiceFile('main.flac');
      const townFile = userUploadedFiles.townVoice || await getDefaultVoiceFile('town.flac');
      const countryFile = userUploadedFiles.countryVoice || await getDefaultVoiceFile('VoiceforTTS.flac');

      // Append the voice files
      formData.append('main', mainFile);
      formData.append('town', townFile);
      formData.append('country', countryFile);

      // Make the API call
      const response = await fetch(`${API_CONFIG.TTS_SERVICE_URL}/podcast/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create podcast');
      }

      const result = await response.json();
      
      if (!result.output_file) {
        throw new Error('No output file returned');
      }

      // Fetch the generated audio file
      const audioResponse = await fetch(`${API_CONFIG.TTS_SERVICE_URL}/audio/${result.output_file}`);
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch the podcast audio');
      }

      const audioBlob = await audioResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setPodcastUrl(url);

      toast({ 
        title: 'Success', 
        description: 'Podcast created successfully!' 
      });
    } catch (error) {
      console.error('Podcast creation error:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to create podcast', 
        variant: 'destructive' 
      });
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
  
  const validateFlacFile = (file: File) => {
    if (!file.type.includes('flac')) {
      throw new Error('Only FLAC files are supported');
    }
    return true;
  };

  return (
      <div className="container max-w-4xl py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generate Script</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTopicExpanded(!isTopicExpanded)}
                className="flex items-center gap-2"
              >
                {isTopicExpanded ? (
                  <>
                    Collapse Topic <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Expand Topic <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`grid gap-4 transition-all duration-200 ${
              isTopicExpanded ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
            }`}>
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
                <div className="relative">
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter podcast topic"
                    className={isTopicExpanded ? "min-h-[200px]" : "min-h-[38px]"}
                  />
                </div>
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
  
        {/* {console.log('Current script value:', script)} */}
        {script && (
          <Card>
            <CardHeader>
              <CardTitle>Create Podcast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScriptEditor 
                value={script} 
                onScriptChange={setScript} 
                disabled={loading} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <VoiceSelector
                  voices={AVAILABLE_VOICES}
                  selectedVoice={mainVoice}
                  onVoiceChange={setMainVoice}
                  onFileUpload={handleFileUpload('mainVoice')}
                  label="Main Voice"
                  disabled={loading}
                />
                <VoiceSelector
                  voices={AVAILABLE_VOICES}
                  selectedVoice={townVoice}
                  onVoiceChange={setTownVoice}
                  onFileUpload={handleFileUpload('townVoice')}
                  label="Town Voice"
                  disabled={loading}
                />
                <VoiceSelector
                  voices={AVAILABLE_VOICES}
                  selectedVoice={countryVoice}
                  onVoiceChange={setCountryVoice}
                  onFileUpload={handleFileUpload('countryVoice')}
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

