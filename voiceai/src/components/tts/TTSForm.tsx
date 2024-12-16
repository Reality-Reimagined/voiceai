import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTTS } from '../../hooks/useTTS';

export function TTSForm() {
  const [text, setText] = useState('');
  const { generateSpeech, isLoading } = useTTS();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateSpeech({ text });
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
      <Button type="submit" isLoading={isLoading}>
        Generate Speech
      </Button>
    </form>
  );
}