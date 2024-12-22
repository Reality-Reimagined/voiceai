import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AudioRecorder } from '@/components/voice-clone/AudioRecorder';
import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
import { cloneVoice } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. I love technology and innovation. Voice cloning is an amazing advancement in artificial intelligence. This sample will help create a unique voice model that captures my speech patterns and tone.";

export function VoiceClonePage() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCustomTextExpanded, setIsCustomTextExpanded] = useState(false);
  const { toast } = useToast();

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setClonedAudioUrl(url);
  };

  const handleCloneVoice = async () => {
    if (!audioBlob) return;

    setLoading(true);
    try {
      const file = new File([audioBlob], 'sample.wav', { type: 'audio/wav' });
      if (!customText.trim()) {
        throw new Error('Please enter text to clone');
      }

      const response = await cloneVoice(file, SAMPLE_TEXT, customText);
      const url = URL.createObjectURL(response.audioBlob);
      setClonedAudioUrl(url);
      
      toast({
        title: 'Success',
        description: 'Voice cloned successfully!',
      });
    } catch (error) {
      console.error('Voice cloning error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to clone voice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (clonedAudioUrl) {
      const a = document.createElement('a');
      a.href = clonedAudioUrl;
      a.download = 'cloned-voice.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Voice Cloning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <div className="font-medium mb-2">Please read the following text for your 15-second recording:</div>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {SAMPLE_TEXT}
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Step 1: Record Your Voice</h3>
              <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            </div>

            {audioBlob && !loading && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Step 2: Enter Your Custom Text</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCustomTextExpanded(!isCustomTextExpanded)}
                    className="flex items-center gap-2"
                  >
                    {isCustomTextExpanded ? (
                      <>
                        Collapse Text <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Expand Text <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-4">
                  <textarea
                    id="custom-text"
                    rows={isCustomTextExpanded ? 8 : 4}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm 
                      focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200
                      ${isCustomTextExpanded ? 'min-h-[200px]' : ''}`}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="What do you want to say with your new voice?"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCloneVoice} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Clone Voice
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-indigo-600">Processing your voice...</span>
              </div>
            )}

            {clonedAudioUrl && !loading && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Step 3: Preview Your Cloned Voice</h3>
                <div className="flex items-center gap-4">
                  <AudioPlayer audioUrl={clonedAudioUrl} onDownload={handleDownload} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
