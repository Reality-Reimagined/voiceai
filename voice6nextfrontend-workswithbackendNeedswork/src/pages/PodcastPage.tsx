import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScriptEditor } from '@/components/podcast/ScriptEditor';
import { VoiceSelector } from '@/components/podcast/VoiceSelector';
import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
import { createPodcast, getAudioFile } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const AVAILABLE_VOICES = [
  { id: 'voice1', name: 'Main Voice' },
  { id: 'voice2', name: 'Town Voice' },
  { id: 'voice3', name: 'Country Voice' },
];

export function PodcastPage() {
  const [script, setScript] = useState('');
  const [mainVoice, setMainVoice] = useState('');
  const [townVoice, setTownVoice] = useState('');
  const [countryVoice, setCountryVoice] = useState('');
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreatePodcast = async () => {
    if (!script || !mainVoice || !townVoice || !countryVoice) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would get the actual voice files
      const mainFile = new File([], 'main.flac');
      const townFile = new File([], 'town.flac');
      const countryFile = new File([], 'country.flac');

      const { output_file } = await createPodcast(
        script,
        mainFile,
        townFile,
        countryFile
      );

      const audioBlob = await getAudioFile(output_file);
      const url = URL.createObjectURL(audioBlob);
      setPodcastUrl(url);

      toast({
        title: 'Success',
        description: 'Podcast created successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create podcast',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (podcastUrl) {
      const a = document.createElement('a');
      a.href = podcastUrl;
      a.download = 'podcast.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Podcast Creator</CardTitle>
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
    </div>
  );
}