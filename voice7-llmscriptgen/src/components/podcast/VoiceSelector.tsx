import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
}

export function VoiceSelector({
  voices,
  selectedVoice,
  onVoiceChange,
  label,
  disabled
}: VoiceSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
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
    </div>
  );
}