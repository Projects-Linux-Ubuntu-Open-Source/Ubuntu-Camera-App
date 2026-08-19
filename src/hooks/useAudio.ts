import { useState, useEffect, useRef, useCallback } from 'react';
import { audioService, AudioVisualizerHandle } from '../services/media/audioService';
import { AudioConfig, AudioLevelData, AudioStatus } from '../types/audio';

export function useAudio() {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState<AudioLevelData>({
    instantLevel: 0,
    peakLevel: 0,
    rmsDecibels: -80,
    isClipping: false,
  });
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(32));
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  const visualizerRef = useRef<AudioVisualizerHandle | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const stopMonitoring = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (visualizerRef.current) {
      visualizerRef.current.cleanup();
      visualizerRef.current = null;
    }
    audioService.stop();
    setActiveStream(null);
    setIsMonitoring(false);
    setStatus('idle');
    setAudioLevel({
      instantLevel: 0,
      peakLevel: 0,
      rmsDecibels: -80,
      isClipping: false,
    });
  }, []);

  const startMonitoring = useCallback(async (micId: string | null = selectedMicrophoneId, config?: Partial<AudioConfig>) => {
    stopMonitoring();
    setStatus('idle');
    setErrorMessage(null);

    try {
      const stream = await audioService.start(micId, config);
      setActiveStream(stream);
      const handle = audioService.createVisualizer(stream);
      visualizerRef.current = handle;
      setIsMonitoring(true);
      setStatus('monitoring');

      const updateLoop = () => {
        if (!visualizerRef.current) return;
        const { analyser, dataArray } = visualizerRef.current;
        const level = audioService.calculateAudioLevel(analyser, dataArray);
        setAudioLevel(level);

        // Extract a sample of frequency bins for UI waveform visualization
        const sampleBins = new Uint8Array(32);
        const step = Math.floor(dataArray.length / 32);
        for (let i = 0; i < 32; i++) {
          sampleBins[i] = dataArray[i * step] || 0;
        }
        setFrequencyData(sampleBins);

        animFrameIdRef.current = requestAnimationFrame(updateLoop);
      };

      animFrameIdRef.current = requestAnimationFrame(updateLoop);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to access microphone';
      setErrorMessage(msg);
      setStatus(msg.includes('permission') ? 'permission_denied' : 'error');
      setIsMonitoring(false);
    }
  }, [selectedMicrophoneId, stopMonitoring]);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    status,
    errorMessage,
    selectedMicrophoneId,
    activeStream,
    audioLevel,
    frequencyData,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    setSelectedMicrophoneId,
  };
}
