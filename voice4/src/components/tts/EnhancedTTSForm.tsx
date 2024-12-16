import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { VoiceSelector } from '../voice/VoiceSelector';
import { useTTS } from '../../hooks/useTTS';
import { Slider } from '../ui/Slider';

interface AudioControls {
  speed: number;
  pitch: number;
  energy: number;
}

export function EnhancedTTSForm() {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState<string>();
  const [controls, setControls] = useState<AudioControls>({
    speed: 1.0,
    pitch: 1.0,
    energy: 1.0,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { generateSpeech, streamSpeech, isLoading, isStreaming } = useTTS();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const request = {
      text,
      voice_id: voiceId,
      ...controls,
    };

    if (text.length > 100) {
      // Use batch processing for longer text
      const audioUrl = await generateSpeech(request);
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } else {
      // Use streaming for shorter text
      await streamSpeech(request);
    }
  };

  const handleControlChange = (name: keyof AudioControls, value: number) => {
    setControls((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Voice Selection</h2>
        <VoiceSelector onSelect={setVoiceId} selectedVoice={voiceId} />
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div>
          <Input
            label="Text to convert"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            multiline
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-1">
            {text.length} characters {text.length > 100 ? '(Batch processing)' : '(Streaming)'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Speed</label>
            <Slider
              min={0.5}
              max={2.0}
              step={0.1}
              value={controls.speed}
              onChange={(value) => handleControlChange('speed', value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Pitch</label>
            <Slider
              min={0.5}
              max={2.0}
              step={0.1}
              value={controls.pitch}
              onChange={(value) => handleControlChange('pitch', value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Energy</label>
            <Slider
              min={0.5}
              max={2.0}
              step={0.1}
              value={controls.energy}
              onChange={(value) => handleControlChange('energy', value)}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <Button type="submit" isLoading={isLoading || isStreaming}>
            {isStreaming ? 'Streaming...' : 'Generate Speech'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => audioRef.current?.pause()}
            disabled={!audioRef.current}
          >
            Stop
          </Button>
        </div>
      </form>

      <audio ref={audioRef} className="w-full mt-4" controls />
    </div>
  );
}