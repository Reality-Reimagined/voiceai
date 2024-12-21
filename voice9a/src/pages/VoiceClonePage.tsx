import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AudioRecorder } from '@/components/voice-clone/AudioRecorder';
import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
import { cloneVoice, getAudioFile } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. I love technology and innovation. Voice cloning is an amazing advancement in artificial intelligence. This sample will help create a unique voice model that captures my speech patterns and tone.";

export function VoiceClonePage() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    toast({
      title: 'Recording Complete',
      description: 'Your voice recording is ready for cloning.',
    });
  };

  const handleCloneVoice = async () => {
    if (!audioBlob) {
      toast({
        title: 'Error',
        description: 'Please record your voice first.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const file = new File([audioBlob], 'sample.wav', { type: 'audio/wav' });
      const response = await cloneVoice(file, SAMPLE_TEXT, customText);
      if (!response || !response.output_file) {
        throw new Error('Voice cloning failed. Please try again.');
      }

      // Always fetch the audio file even if it might already exist
      const clonedBlob = await getAudioFile(response.output_file);
      const url = URL.createObjectURL(clonedBlob);
      setClonedAudioUrl(url);

      toast({
        title: 'Success',
        description: 'Voice cloned successfully!',
      });
    } catch (error) {
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
              Please read the following text for your 15-second recording:
              <div className="mt-2 font-medium">{SAMPLE_TEXT}</div>
            </AlertDescription>
          </Alert>

          <AudioRecorder onRecordingComplete={handleRecordingComplete} />

          {loading && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Processing your voice...</span>
            </div>
          )}

          {!loading && clonedAudioUrl && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preview cloned voice:</span>
              <AudioPlayer audioUrl={clonedAudioUrl} onDownload={handleDownload} />
            </div>
          )}

          {audioBlob && !loading && (
            <div className="space-y-2">
              <label htmlFor="custom-text" className="font-medium">
                What do you want to say with your new voice?
              </label>
              <Input
                id="custom-text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter text to synthesize"
              />
              <Button onClick={handleCloneVoice} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Clone Voice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



// // works just needs some improvments 
// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/components/ui/use-toast';
// import { AudioRecorder } from '@/components/voice-clone/AudioRecorder';
// import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
// import { cloneVoice, getAudioFile } from '@/lib/api';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// // import type { ApiResponse } from '@/types';

// const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. I love technology and innovation. Voice cloning is an amazing advancement in artificial intelligence. This sample will help create a unique voice model that captures my speech patterns and tone.";

// export function VoiceClonePage() {
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
//   const [customText, setCustomText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { toast } = useToast();

//   const handleRecordingComplete = async (blob: Blob) => {
//     setAudioBlob(blob);
//     const url = URL.createObjectURL(blob);
//     setClonedAudioUrl(url);
//   };

//   const handleCloneVoice = async () => {
//     if (!audioBlob) return;

//     setLoading(true);
//     try {
//       const file = new File([audioBlob], 'sample.wav', { type: 'audio/wav' });
//       const response = await cloneVoice(file, SAMPLE_TEXT, customText);
//       const clonedBlob = await getAudioFile(response.fileName);
//       const url = URL.createObjectURL(clonedBlob);
//       setClonedAudioUrl(url);
      
//       toast({
//         title: 'Success',
//         description: 'Voice cloned successfully!',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: error instanceof Error ? error.message : 'Failed to clone voice',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = () => {
//     if (clonedAudioUrl) {
//       const a = document.createElement('a');
//       a.href = clonedAudioUrl;
//       a.download = 'cloned-voice.wav';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     }
//   };

//   return (
//     <div className="container max-w-4xl py-8">
//       <Card>
//         <CardHeader>
//           <CardTitle>Voice Cloning</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <Alert>
//             <AlertDescription>
//               Please read the following text for your 15-second recording:
//               <div className="mt-2 font-medium">{SAMPLE_TEXT}</div>
//             </AlertDescription>
//           </Alert>

//           <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          
//           {loading && (
//             <div className="flex items-center justify-center">
//               <Loader2 className="h-8 w-8 animate-spin" />
//               <span className="ml-2">Processing your voice...</span>
//             </div>
//           )}

//           {clonedAudioUrl && !loading && (
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-medium">Preview cloned voice:</span>
//               <div>
//                 <AudioPlayer audioUrl={clonedAudioUrl} onDownload={handleDownload} />
//                 <Button onClick={handleCloneVoice} disabled={loading}>Clone Voice</Button>
//               </div>
//             </div>
//           )}

//           {audioBlob && !loading && (
//             <div>
//               <label htmlFor="custom-text">What do you want to say with your new voice?</label>
//               <input
//                 type="text"
//                 id="custom-text"
//                 value={customText}
//                 onChange={(e) => setCustomText(e.target.value)}
//               />
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
