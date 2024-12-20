import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TextInputProps {
  onTextChange: (text: string) => void;
  disabled?: boolean;
}

export function TextInput({ onTextChange, disabled }: TextInputProps) {
  const [text, setText] = useState('');
  const MAX_CHARS = 500;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, MAX_CHARS);
    setText(newText);
    onTextChange(newText);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="text-input">Enter your text</Label>
      <Textarea
        id="text-input"
        placeholder="Type or paste your text here..."
        value={text}
        onChange={handleChange}
        disabled={disabled}
        className="h-32"
      />
      <div className="text-sm text-muted-foreground">
        {text.length}/{MAX_CHARS} characters
      </div>
    </div>
  );
}