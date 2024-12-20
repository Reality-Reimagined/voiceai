import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, DownloadIcon } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  onDownload: () => void;
}

export function AudioPlayer({ audioUrl, onDownload }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <Button onClick={togglePlayback} size="icon">
        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      </Button>
      <Button onClick={onDownload} variant="outline" size="icon">
        <DownloadIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}