import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';

interface ScriptEditorProps {
  value: string;
  onScriptChange: (value: string) => void;
  disabled?: boolean;
}

export function ScriptEditor({ value, onScriptChange, disabled }: ScriptEditorProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const MAX_CHARS = 10000;
  
  const handleReplace = (replaceAll: boolean = false) => {
    if (!findText) return;

    if (replaceAll) {
      const newText = value.split(findText).join(replaceText);
      onScriptChange(newText);
    } else {
      const newText = value.replace(findText, replaceText);
      onScriptChange(newText);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFindReplace(!showFindReplace)}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Find & Replace
        </Button>
      </div>

      {showFindReplace && (
        <div className="flex flex-col sm:flex-row gap-2 p-2 bg-muted rounded-md">
          <div className="flex-1">
            <Input
              placeholder="Find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Replace with"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleReplace(false)}
              disabled={disabled || !findText}
            >
              Replace
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleReplace(true)}
              disabled={disabled || !findText}
            >
              Replace All
            </Button>
          </div>
        </div>
      )}

      <Textarea
        value={value}
        onChange={(e) => onScriptChange(e.target.value)}
        disabled={disabled}
        className="min-h-[300px] font-mono"
      />
      <div className="text-sm text-muted-foreground">
        {value.length}/{MAX_CHARS} characters
      </div>
    </div>
  );
}