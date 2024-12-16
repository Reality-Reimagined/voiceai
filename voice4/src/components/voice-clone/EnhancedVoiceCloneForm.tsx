import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useVoiceClone } from '../../hooks/useVoiceClone';
import { Progress } from '../ui/Progress';

interface TrainingStatus {
  status: 'idle' | 'processing' | 'ready' | 'failed';
  progress: number;
  message: string;
}

export function EnhancedVoiceCloneForm() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [referenceText, setReferenceText] = useState('');
  const [status, setStatus] = useState<TrainingStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const { cloneVoice, isLoading } = useVoiceClone();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus({
      status: 'processing',
      progress: 0,
      message: 'Starting voice cloning process...',
    });

    try {
      const result = await cloneVoice({
        name,
        file,
        reference_text: referenceText,
      });

      if (result.success) {
        setStatus({
          status: 'ready',
          progress: 100,
          message: 'Voice cloning completed successfully!',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus({
        status: 'failed',
        progress: 0,
        message: 'Voice cloning failed. Please try again.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      
      // Create audio preview
      const url = URL.createObjectURL(selectedFile);
      if (audioRef.current) {
        audioRef.current.src = url;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <Input
          label="Voice Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name for this voice..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reference Audio
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {file && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
              >
                Clear
              </Button>
            )}
          </div>
          {file && (
            <audio ref={audioRef} className="mt-2 w-full" controls />
          )}
        </div>

        <Input
          label="Reference Text (Optional)"
          value={referenceText}
          onChange={(e) => setReferenceText(e.target.value)}
          placeholder="Enter the text being spoken in the reference audio..."
          multiline
          rows={3}
        />

        {status.status !== 'idle' && (
          <div className="space-y-2">
            <Progress value={status.progress} />
            <p className={`text-sm ${
              status.status === 'failed' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {status.message}
            </p>
          </div>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!file || status.status === 'processing'}
          className="w-full"
        >
          {status.status === 'processing' ? 'Processing...' : 'Clone Voice'}
        </Button>
      </div>
    </form>
  );
}