import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square, Upload, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

const API_BASE = 'http://127.0.0.1:8000';

interface MeetingRecorderProps {
  coffeeChatId: string;
  onRecordingUploaded?: () => void;
  onProcessingComplete?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'stopped' | 'uploading' | 'uploaded' | 'processing' | 'error';

export function MeetingRecorder({
  coffeeChatId,
  onRecordingUploaded,
  onProcessingComplete,
}: MeetingRecorderProps) {
  const { success, error: showError } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getAuthHeaders = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    return {
      'Authorization': `Bearer ${session?.access_token}`,
    };
  };

  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Create MediaRecorder with webm format (widely supported)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setRecordingState('stopped');
      };

      mediaRecorder.onerror = () => {
        setErrorMessage('Recording error occurred');
        setRecordingState('error');
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setRecordingState('recording');
      setRecordingDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setErrorMessage('Microphone access denied. Please allow microphone access to record.');
      } else {
        setErrorMessage('Failed to start recording. Please check your microphone.');
      }
      setRecordingState('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const uploadRecording = useCallback(async () => {
    if (!audioBlob) return;

    setRecordingState('uploading');
    setErrorMessage(null);

    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch(`${API_BASE}/api/coffee-chats/${coffeeChatId}/upload-recording`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }

      setRecordingState('uploaded');
      success('Recording uploaded!', 'Your recording has been saved.');
      onRecordingUploaded?.();
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload recording');
      setRecordingState('error');
      showError('Upload failed', 'Please try again.');
    }
  }, [audioBlob, coffeeChatId, onRecordingUploaded, success, showError]);

  const triggerProcessing = useCallback(async () => {
    setRecordingState('processing');
    setErrorMessage(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/coffee-chats/${coffeeChatId}/process-notes`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Processing failed');
      }

      success('Processing started!', 'Meeting notes will be ready shortly.');
      onProcessingComplete?.();
    } catch (err) {
      console.error('Processing error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start processing');
      setRecordingState('error');
      showError('Processing failed', 'Please try again.');
    }
  }, [coffeeChatId, onProcessingComplete, success, showError]);

  const resetRecorder = useCallback(() => {
    setAudioBlob(null);
    setRecordingDuration(0);
    setErrorMessage(null);
    setRecordingState('idle');
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor:
              recordingState === 'recording'
                ? 'rgba(239, 68, 68, 0.2)'
                : recordingState === 'uploaded'
                ? 'rgba(34, 197, 94, 0.2)'
                : 'var(--color-surfaceHover)',
          }}
        >
          {recordingState === 'recording' ? (
            <Mic className="w-5 h-5 animate-pulse" style={{ color: '#EF4444' }} />
          ) : recordingState === 'uploaded' ? (
            <CheckCircle2 className="w-5 h-5" style={{ color: '#22C55E' }} />
          ) : recordingState === 'error' ? (
            <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
          ) : (
            <MicOff className="w-5 h-5" style={{ color: 'var(--color-textMuted)' }} />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            {recordingState === 'idle' && 'Ready to Record'}
            {recordingState === 'recording' && 'Recording...'}
            {recordingState === 'stopped' && 'Recording Complete'}
            {recordingState === 'uploading' && 'Uploading...'}
            {recordingState === 'uploaded' && 'Recording Uploaded'}
            {recordingState === 'processing' && 'Processing Notes...'}
            {recordingState === 'error' && 'Error'}
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {recordingState === 'idle' && 'Click to start recording your side of the conversation'}
            {recordingState === 'recording' && formatDuration(recordingDuration)}
            {recordingState === 'stopped' && `Duration: ${formatDuration(recordingDuration)}`}
            {recordingState === 'uploading' && 'Please wait...'}
            {recordingState === 'uploaded' && 'Your recording is saved. You can now generate notes.'}
            {recordingState === 'processing' && 'AI is transcribing and summarizing...'}
            {recordingState === 'error' && (errorMessage || 'Something went wrong')}
          </p>
        </div>
        {recordingState === 'recording' && (
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: '#EF4444' }}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {recordingState === 'idle' && (
          <Button
            size="sm"
            leftIcon={<Mic className="w-4 h-4" />}
            onClick={startRecording}
          >
            Start Recording
          </Button>
        )}

        {recordingState === 'recording' && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Square className="w-4 h-4" />}
            onClick={stopRecording}
            style={{ borderColor: '#EF4444', color: '#EF4444' }}
          >
            Stop Recording
          </Button>
        )}

        {recordingState === 'stopped' && (
          <>
            <Button
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={uploadRecording}
            >
              Upload Recording
            </Button>
            <Button size="sm" variant="outline" onClick={resetRecorder}>
              Discard
            </Button>
          </>
        )}

        {recordingState === 'uploaded' && (
          <Button
            size="sm"
            leftIcon={<Clock className="w-4 h-4" />}
            onClick={triggerProcessing}
          >
            Generate Meeting Notes
          </Button>
        )}

        {recordingState === 'error' && (
          <Button size="sm" variant="outline" onClick={resetRecorder}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
