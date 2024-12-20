import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { TextInput } from '@/components/text-to-speech/TextInput';
import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
import { synthesizeText, getAudioFile } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import type { ApiResponse } from '@/types';

export function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSynthesize = async () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to synthesize',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await synthesizeText(text);
      const audioBlob = await getAudioFile(response.fileName);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to synthesize text',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'synthesized-speech.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Text to Speech</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TextInput onTextChange={setText} disabled={loading} />
          
          <div className="flex justify-between items-center">
            <Button onClick={handleSynthesize} disabled={loading || !text.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Synthesize
            </Button>
            {audioUrl && <AudioPlayer audioUrl={audioUrl} onDownload={handleDownload} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}