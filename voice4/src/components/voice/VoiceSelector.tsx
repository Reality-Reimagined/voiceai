import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from '../../config';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface Voice {
  name: string;
  language: string;
  gender: string;
  accent?: string;
  style_tags: string[];
  description?: string;
}

interface VoiceSelectorProps {
  onSelect: (voiceId: string) => void;
  selectedVoice?: string;
}

export function VoiceSelector({ onSelect, selectedVoice }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/voices`, {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch voices');
      const data = await response.json();
      setVoices(data);
    } catch (error) {
      toast.error('Failed to load voices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (voiceId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          text: 'Hello, this is a preview of my voice.',
          voice_id: voiceId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate preview');
      const data = await response.json();

      if (previewAudio) {
        previewAudio.pause();
      }

      const audio = new Audio(data.audio_url);
      setPreviewAudio(audio);
      audio.play();
    } catch (error) {
      toast.error('Failed to preview voice');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading voices...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {voices.map((voice) => (
          <div
            key={voice.name}
            className={`p-4 border rounded-lg ${
              selectedVoice === voice.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{voice.name}</h3>
                <p className="text-sm text-gray-500">
                  {voice.language} • {voice.gender}
                  {voice.accent && ` • ${voice.accent}`}
                </p>
                {voice.description && (
                  <p className="text-sm text-gray-600 mt-2">{voice.description}</p>
                )}
                {voice.style_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {voice.style_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(voice.name)}
              >
                Preview
              </Button>
              <Button
                variant={selectedVoice === voice.name ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onSelect(voice.name)}
              >
                {selectedVoice === voice.name ? 'Selected' : 'Select'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}