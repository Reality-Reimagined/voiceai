import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Voice {
  id: string;
  name: string;
}

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  label: string;
  disabled?: boolean;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VoiceSelector({
  voices,
  selectedVoice,
  onVoiceChange,
  onFileUpload,
  label,
  disabled,
}: VoiceSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        <Select
          value={selectedVoice}
          onValueChange={onVoiceChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onFileUpload && (
          <div className="space-y-1">
            <Input
              type="file"
              accept=".flac"
              onChange={onFileUpload}
              disabled={disabled}
            />
            <p className="text-sm text-muted-foreground">Only FLAC files are accepted</p>
          </div>
        )}
      </div>
    </div>
  );
}