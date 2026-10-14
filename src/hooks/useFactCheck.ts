import { useCallback, useState } from 'react';
import { analyzeImage, analyzeUrl, analyzeVideo, saveToHistory } from '../services/factCheckService';
import type { FactCheckResult, PipelineStep, RequestStatus } from '../types/factCheck';

interface UseFactCheckState {
  status: RequestStatus;
  steps: PipelineStep[];
  result: FactCheckResult | null;
  error: string | null;
}

export function useFactCheck() {
  const [state, setState] = useState<UseFactCheckState>({
    status: 'idle',
    steps: [],
    result: null,
    error: null,
  });

  const reset = useCallback(() => {
    setState({ status: 'idle', steps: [], result: null, error: null });
  }, []);

  const run = useCallback(async (task: 'image' | 'video' | 'url', payload: File | string) => {
    setState({ status: 'loading', steps: [], result: null, error: null });
    try {
      const onProgress = (steps: PipelineStep[]) => setState((s) => ({ ...s, steps }));

      const result =
        task === 'image'
          ? await analyzeImage(payload as File, onProgress)
          : task === 'video'
            ? await analyzeVideo(payload as File, onProgress)
            : await analyzeUrl(payload as string, onProgress);

      saveToHistory(result);
      setState((s) => ({ ...s, status: 'success', result }));
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'Something went wrong during analysis.',
      }));
    }
  }, []);

  return { ...state, run, reset };
}
