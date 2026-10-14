export type ContentType = 'image' | 'video' | 'url';

export type Verdict = 'true' | 'false' | 'misleading' | 'unverified';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export type StepStatus = 'pending' | 'running' | 'completed';

export interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  durationMs?: number;
}

export interface EvidenceSource {
  name: string;
  url: string;
  credibility: number; // 0–1
  stance: 'supports' | 'contradicts' | 'neutral';
}

export type ReasonStance = 'indicates_fake' | 'indicates_authentic' | 'inconclusive';

export interface ReasonPoint {
  title: string; // short label, e.g. "Serial number typography"
  detail: string; // one or two sentences explaining the observation
  stance: ReasonStance;
}

export interface FactCheckResult {
  id: string;
  contentType: ContentType;
  inputLabel: string;
  claim: string;
  verdict: Verdict;
  confidence: number; // 0–100
  summary: string;
  reasons: ReasonPoint[]; // point-by-point breakdown behind the verdict
  limitations?: string; // what this analysis could not determine
  isSample?: boolean; // true when produced by the mock pipeline
  sources: EvidenceSource[];
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  contentType: ContentType;
  inputLabel: string;
  verdict: Verdict;
  confidence: number;
  createdAt: string;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  true: 'Verified true',
  false: 'False',
  misleading: 'Misleading',
  unverified: 'Unverified',
};
