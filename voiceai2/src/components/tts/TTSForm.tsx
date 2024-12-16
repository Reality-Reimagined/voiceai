import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTTS } from '../../hooks/useTTS';

export function TTSForm() {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [style, setStyle] = useState('');
  const { generateSpeech, streamSpeech, isLoading, isStreaming } = useTTS();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const request = {
      text,
      voice_id: voiceId || undefined,
      style: style || undefined,
    };

    // Use streaming for real-time output
    await streamSpeech(request);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Text to convert"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to convert to speech..."
        multiline
        rows={4}
      />
      <Input
        label="Voice ID (optional)"
        value={voiceId}
        onChange={(e) => setVoiceId(e.target.value)}
        placeholder="Enter voice ID..."
      />
      <Input
        label="Style (optional)"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        placeholder="Enter style..."
      />
      <Button type="submit" isLoading={isLoading || isStreaming}>
        {isStreaming ? 'Streaming...' : 'Generate Speech'}
      </Button>
    </form>
  );
}