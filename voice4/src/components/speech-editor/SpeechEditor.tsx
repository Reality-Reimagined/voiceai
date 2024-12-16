import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { API_URL } from '../../config';
import { useAuth } from '../auth/AuthProvider';
import toast from 'react-hot-toast';

interface WaveformProps {
  audioUrl: string;
  onSegmentSelect: (start: number, end: number) => void;
}

interface AudioSegment {
  start: number;
  end: number;
  type: string;
}

interface EditParameters {
  pitch: number;
  speed: number;
  energy: number;
}

export function SpeechEditor() {
  const [audioUrl, setAudioUrl] = useState<string>();
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<number>(-1);
  const [parameters, setParameters] = useState<EditParameters>({
    pitch: 1.0,
    speed: 1.0,
    energy: 1.0,
  });
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const handleSegmentSelect = (start: number, end: number) => {
    setSegments([...segments, { start, end, type: 'adjust' }]);
  };

  const handleParameterChange = (
    param: keyof EditParameters,
    value: number
  ) => {
    setParameters((prev) => ({ ...prev, [param]: value }));
  };

  const applyEdits = async () => {
    if (!audioUrl) return;

    try {
      const formData = new FormData();
      formData.append('audio_url', audioUrl);
      formData.append('segments', JSON.stringify(segments));
      formData.append('parameters', JSON.stringify(parameters));

      const response = await fetch(`${API_URL}/api/speech-edit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to apply edits');

      const data = await response.json();
      setAudioUrl(data.audio_url);
      toast.success('Edits applied successfully');
    } catch (error) {
      toast.error('Failed to apply edits');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Speech Editor</h2>

        <div className="space-y-4">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />

          {audioUrl && (
            <>
              <audio ref={audioRef} src={audioUrl} controls className="w-full" />
              
              <Waveform
                audioUrl={audioUrl}
                onSegmentSelect={handleSegmentSelect}
              />

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Pitch Adjustment
                  </label>
                  <Slider
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={parameters.pitch}
                    onChange={(value) => handleParameterChange('pitch', value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Speed Adjustment
                  </label>
                  <Slider
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={parameters.speed}
                    onChange={(value) => handleParameterChange('speed', value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Energy Adjustment
                  </label>
                  <Slider
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={parameters.energy}
                    onChange={(value) => handleParameterChange('energy', value)}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={applyEdits}>Apply Edits</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSegments([]);
                    setParameters({
                      pitch: 1.0,
                      speed: 1.0,
                      energy: 1.0,
                    });
                  }}
                >
                  Reset
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Waveform({ audioUrl, onSegmentSelect }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || !audioUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load and decode audio
    fetch(audioUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        const audioContext = new AudioContext();
        return audioContext.decodeAudioData(arrayBuffer);
      })
      .then((audioBuffer) => {
        // Draw waveform
        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;

        ctx.fillStyle = '#4B5563';
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < canvas.width; i++) {
          const min = Math.min(...data.slice(i * step, (i + 1) * step));
          const max = Math.max(...data.slice(i * step, (i + 1) * step));
          ctx.fillRect(i, (1 + min) * amp, 1, (max - min) * amp);
        }
      });
  }, [audioUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSelecting(true);
    setSelectionStart(e.nativeEvent.offsetX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous selection
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw selection rectangle
    const currentX = e.nativeEvent.offsetX;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fillRect(
      Math.min(selectionStart, currentX),
      0,
      Math.abs(currentX - selectionStart),
      canvas.height
    );
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const currentX = e.nativeEvent.offsetX; <boltAction type="file" filePath="src/components/speech-editor/SpeechEditor.tsx">
    setIsSelecting(false);
    
    // Convert pixel positions to time positions
    const startTime = (Math.min(selectionStart, currentX) / canvas.width) * audioBuffer.duration;
    const endTime = (Math.max(selectionStart, currentX) / canvas.width) * audioBuffer.duration;
    
    onSegmentSelect(startTime, endTime);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full h-48 border rounded cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}