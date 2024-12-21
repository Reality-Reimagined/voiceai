import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AudioRecorder } from '@/components/voice-clone/AudioRecorder';
import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
import { cloneVoice } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/text-to-speech/TextInput';

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. I love technology and innovation. Voice cloning is an amazing advancement in artificial intelligence. This sample will help create a unique voice model that captures my speech patterns and tone.";

export function VoiceClonePage() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [customText, setCustomText] = useState(SAMPLE_TEXT);
  const [loading, setLoading] = useState(false);
  const [responseFileName, setResponseFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // Add error state
  const { toast } = useToast();

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setRecordingUrl(url);
    setError(null); // Clear any previous errors when a new recording is made
  }, []);

  const handleCloneVoice = useCallback(async () => {
    if (!audioBlob) {
      toast({ title: 'Error', description: 'No audio recorded!', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors before starting cloning
    try {
      const file = new File([audioBlob], 'sample.wav', { type: 'audio/wav' });
      const { audioBlob: clonedBlob, fileName } = await cloneVoice(file, SAMPLE_TEXT, customText);

      if (!fileName) {
        throw new Error('No fileName returned from the server.');
      }

      setResponseFileName(fileName);
      const url = URL.createObjectURL(clonedBlob);
      setClonedAudioUrl(url);

      toast({ title: 'Success', description: 'Voice cloned successfully!' });
    } catch (error: any) {
      setError(error.message || 'Failed to clone voice'); // Set error state
      toast({
        title: 'Error',
        description: error.message || 'Failed to clone voice',
        variant: 'destructive',
      });
      console.error("Error cloning voice:", error);
    } finally {
      setLoading(false);
    }
  }, [audioBlob, customText, toast]);

  const handleDownload = useCallback(() => {
    if (clonedAudioUrl && responseFileName) {
      const a = document.createElement('a');
      a.href = clonedAudioUrl;
      a.download = responseFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [clonedAudioUrl, responseFileName]);

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

          {recordingUrl && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-700">Preview your recorded voice:</h2>
              <AudioPlayer audioUrl={recordingUrl} onDownload={() => {}} />
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Processing your voice...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {clonedAudioUrl && !loading && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-700">Preview cloned voice:</h2>
              <AudioPlayer audioUrl={clonedAudioUrl} onDownload={handleDownload} />
            </div>
          )}

          <TextInput
            id="custom-text"
            label="What do you want to say with your new voice?"
            value={customText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomText(e.target.value)}
          />

          <Button onClick={handleCloneVoice} disabled={loading || !audioBlob}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clone Voice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
// // works but has a weird cache issue
// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/components/ui/use-toast';
// import { AudioRecorder } from '@/components/voice-clone/AudioRecorder';
// import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
// import { cloneVoice, getAudioFile } from '@/lib/api';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. I love technology and innovation. Voice cloning is an amazing advancement in artificial intelligence. This sample will help create a unique voice model that captures my speech patterns and tone.";

// export function VoiceClonePage() {
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
//   const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
//   const [customText, setCustomText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [responseFileName, setResponseFileName] = useState<string | null>(null);
//   const { toast } = useToast();

//   const handleRecordingComplete = (blob: Blob) => {
//     setAudioBlob(blob);
//     const url = URL.createObjectURL(blob);
//     setRecordingUrl(url);
//   };

//   const handleCloneVoice = async () => {
//     if (!audioBlob) {
//       toast({ title: 'Error', description: 'No audio recorded!', variant: 'destructive' });
//       return;
//     }

//     setLoading(true);
//     try {
//       const file = new File([audioBlob], 'sample.wav', { type: 'audio/wav' });
//       const response = await cloneVoice(file, SAMPLE_TEXT, customText);

//       if (!response.fileName) {
//         throw new Error('No fileName returned from the server.');
//       }

//       setResponseFileName(response.fileName);
//       const clonedBlob = await getAudioFile(response.fileName);
//       const url = URL.createObjectURL(clonedBlob);
//       setClonedAudioUrl(url);

//       toast({ title: 'Success', description: 'Voice cloned successfully!' });
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
//     if (clonedAudioUrl && responseFileName) {
//       const a = document.createElement('a');
//       a.href = clonedAudioUrl;
//       a.download = responseFileName; // Use the server-provided file name
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

//           {recordingUrl && (
//             <div className="space-y-4">
//               <h2 className="text-sm font-medium text-gray-700">Preview your recorded voice:</h2>
//               <AudioPlayer audioUrl={recordingUrl} onDownload={() => {}} />
//             </div>
//           )}

//           {loading && (
//             <div className="flex items-center justify-center">
//               <Loader2 className="h-8 w-8 animate-spin" />
//               <span className="ml-2">Processing your voice...</span>
//             </div>
//           )}

//           {clonedAudioUrl && !loading && (
//             <div className="space-y-4">
//               <h2 className="text-sm font-medium text-gray-700">Preview cloned voice:</h2>
//               <AudioPlayer audioUrl={clonedAudioUrl} onDownload={handleDownload} />
//             </div>
//           )}

//           {audioBlob && !loading && (
//             <div className="space-y-4">
//               <label htmlFor="custom-text" className="block text-sm font-medium text-gray-700">
//                 What do you want to say with your new voice?
//               </label>
//               <textarea
//                 id="custom-text"
//                 rows={4}
//                 className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                 value={customText}
//                 onChange={(e) => setCustomText(e.target.value)}
//               />
//               <Button onClick={handleCloneVoice} disabled={loading}>
//                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Clone Voice
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




// // deployed but missing alot/ 
// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/components/ui/use-toast';
// import { AudioRecorder } from '@/components/voice-clone/AudioRecorder';
// import { AudioPlayer } from '@/components/text-to-speech/AudioPlayer';
// import { cloneVoice, getAudioFile } from '@/lib/api';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. I love technology and innovation. Voice cloning is an amazing advancement in artificial intelligence. This sample will help create a unique voice model that captures my speech patterns and tone.";

// export function VoiceClonePage() {
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
//   const [customText, setCustomText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { toast } = useToast();
//   let responseFileName: string | null = null;

//   const handleRecordingComplete = async (blob: Blob) => {
//     setAudioBlob(blob);
//   };

//   const handleCloneVoice = async () => {
//     if (!audioBlob) return;

//     setLoading(true);
//     try {
//       const file = new File([audioBlob], 'sample.wav', { type: 'audio/wav' });
//       const response = await cloneVoice(file, SAMPLE_TEXT, customText);

//       if (!response.fileName) {
//         throw new Error('No fileName returned from the server');
//       }

//       responseFileName = response.fileName;
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
//     if (clonedAudioUrl && responseFileName) {
//       const a = document.createElement('a');
//       a.href = clonedAudioUrl;
//       a.download = responseFileName; // Use the server-provided file name
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
//               <div className="flex items-center space-x-4">
//                 <AudioPlayer audioUrl={clonedAudioUrl} onDownload={handleDownload} />
//                 <Button onClick={handleCloneVoice} disabled={loading}>Clone Again</Button>
//               </div>
//             </div>
//           )}

//           {audioBlob && !loading && (
//             <div className="space-y-2">
//               <label htmlFor="custom-text" className="block text-sm font-medium text-gray-700">
//                 What do you want to say with your new voice?
//               </label>
//               <input
//                 type="text"
//                 id="custom-text"
//                 className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
