import { useState, useEffect, useCallback, useRef } from 'react';
import { Video, Square, Loader2, Sparkles, Circle } from 'lucide-react';

type RecordingPhase = 'idle' | 'recording' | 'analyzing' | 'done';

interface RecordingOverlayProps {
  onComplete: () => void;
}

export function RecordingOverlay({ onComplete }: RecordingOverlayProps) {
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (phase !== 'recording') return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const timeout = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [phase, onComplete]);

  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setPhase((p) => (p === 'recording' ? 'analyzing' : p));
      });
      setPhase('recording');
      setElapsed(0);
    } catch {
      // User cancelled the permission dialog
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setPhase('analyzing');
  }, []);

  if (phase === 'idle') {
    return (
      <div className="flex h-8 items-center rounded-md border border-border overflow-hidden">
        <button className="flex h-full items-center gap-1.5 border-r border-border px-3 text-xs font-semibold text-foreground hover:bg-accent transition-colors">
          <Video size={14} className="text-muted-foreground" />
          Manage Recordings
        </button>
        <button
          onClick={startRecording}
          className="flex h-full items-center gap-1.5 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          title="Start recording"
        >
          <Circle size={12} fill="currentColor" />
        </button>
      </div>
    );
  }

  if (phase === 'recording') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 items-center gap-1.5 rounded-md border border-red-400 bg-red-50 px-3">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-700">
            Recording... {formatTime(elapsed)}
          </span>
        </div>
        <button
          onClick={stopRecording}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <Square size={12} fill="currentColor" />
        </button>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="flex h-8 items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3">
        <Loader2 size={14} className="animate-spin text-amber-600" />
        <span className="text-xs font-semibold text-amber-700">
          Analyzing...
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-8 items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3">
      <Sparkles size={14} className="text-emerald-600" />
      <span className="text-xs font-semibold text-emerald-700">
        Changes proposed
      </span>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
