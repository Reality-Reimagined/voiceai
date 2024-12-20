import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ScriptEditorProps {
  onScriptChange: (script: string) => void;
  disabled?: boolean;
}

export function ScriptEditor({ onScriptChange, disabled }: ScriptEditorProps) {
  const [script, setScript] = useState('');
  const MAX_CHARS = 2000;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newScript = e.target.value.slice(0, MAX_CHARS);
    setScript(newScript);
    onScriptChange(newScript);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="script">Podcast Script</Label>
      <Textarea
        id="script"
        placeholder="Enter your podcast script here..."
        value={script}
        onChange={handleChange}
        disabled={disabled}
        className="h-48 font-mono"
      />
      <div className="text-sm text-muted-foreground">
        {script.length}/{MAX_CHARS} characters
      </div>
    </div>
  );
}