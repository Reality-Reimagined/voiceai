import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  audioUrl: string;
  onDownload: () => void;
}

export function AudioPlayer({ audioUrl, onDownload }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4f46e5',
      progressColor: '#818cf8',
      cursorColor: '#312e81',
      barWidth: 2,
      barGap: 1,
      height: 60,
      // responsive: true,
    });

    // Event handlers
    wavesurferRef.current.on('ready', () => {
      setIsReady(true);
      setDuration(wavesurferRef.current?.getDuration() || 0);
    });

    wavesurferRef.current.on('finish', () => {
      setIsPlaying(false);
    });

    // Load audio
    wavesurferRef.current.load(audioUrl);

    // Cleanup
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!isReady) return;
    
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (wavesurferRef.current) {
      setCurrentTime(wavesurferRef.current.getCurrentTime());
    }
  };

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.on('audioprocess', handleTimeUpdate);
    }
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.un('audioprocess', handleTimeUpdate);
      }
    };
  }, []);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      if (isMuted) {
        wavesurferRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        wavesurferRef.current.setVolume(0);
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-4">
      {/* Waveform visualization */}
      <div ref={waveformRef} className="w-full" />

      {/* Timeline */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            disabled={!isReady}
            className="hover:bg-indigo-50"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-indigo-600" />
            ) : (
              <Play className="h-6 w-6 text-indigo-600" />
            )}
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              disabled={!isReady}
              className="hover:bg-indigo-50"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-indigo-600" />
              ) : (
                <Volume2 className="h-5 w-5 text-indigo-600" />
              )}
            </Button>
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                disabled={!isReady}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="text-indigo-600 hover:bg-indigo-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Voice Flow Indicators */}
      {/* <div className="flex justify-between mt-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            <span>Main Voice</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Town Voice</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Country Voice</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}