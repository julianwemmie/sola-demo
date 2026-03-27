import { useState, useEffect, useCallback, useRef } from 'react';
import { Video, Square, Loader2, Circle } from 'lucide-react';
import type { ProcessingResult } from '@/data/recording-types';
import { useVersion } from '@/hooks/VersionContext';

type RecordingPhase = 'idle' | 'recording' | 'analyzing' | 'error';

interface RecordingOverlayProps {
  onComplete: (result: ProcessingResult) => void;
}

export function RecordingOverlay({ onComplete }: RecordingOverlayProps) {
  const { state } = useVersion();
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== 'recording') return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // Capture screen (video only — we just need something recording for the demo)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

      // Capture microphone audio
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Combine into one stream: screen video + mic audio
      const combined = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
      streamRef.current = combined;

      // Set up MediaRecorder
      chunksRef.current = [];
      const recorder = new MediaRecorder(combined, { mimeType: 'video/webm;codecs=vp8,opus' });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        sendRecording(blob);
      };

      // If user stops screen share via browser UI, stop recording
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (recorderRef.current?.state === 'recording') {
          recorderRef.current.stop();
        }
        setPhase((p) => (p === 'recording' ? 'analyzing' : p));
      });

      recorder.start(1000); // collect data every second
      setPhase('recording');
      setElapsed(0);
    } catch {
      // User cancelled a permission dialog
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setPhase('analyzing');
  }, []);

  const sendRecording = useCallback(async (blob: Blob) => {
    try {
      // Send current nodes so Claude has context about the workflow
      const currentNodes = state.workingNodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        description: n.data.description,
        config: n.data.config,
      }));

      const formData = new FormData();
      formData.append('recording', blob, 'recording.webm');
      formData.append('currentNodes', JSON.stringify(currentNodes));

      const res = await fetch('/api/process-recording', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }

      const result: ProcessingResult = await res.json();
      onComplete(result);
      setPhase('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setPhase('error');
    }
  }, [onComplete, state.workingNodes]);

  const reset = useCallback(() => {
    setPhase('idle');
    setError(null);
    setElapsed(0);
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

  // phase === 'error'
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3">
        <span className="text-xs font-semibold text-red-700">
          {error || 'Error'}
        </span>
      </div>
      <button
        onClick={reset}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
