import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useVoiceClone } from '../../hooks/useVoiceClone';

export function VoiceCloneForm() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { cloneVoice, isLoading } = useVoiceClone();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    await cloneVoice({ name, file });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Voice Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter a name for this voice..."
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Reference Audio
        </label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full"
        />
      </div>
      <Button type="submit" isLoading={isLoading}>
        Clone Voice
      </Button>
    </form>
  );
}