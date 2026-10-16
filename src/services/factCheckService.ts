import type { ContentType, FactCheckResult, HistoryEntry, PipelineStep, Verdict } from '../types/factCheck';

// Swap this for your team's real endpoint. The rest of the app only depends
// on the analyzeImage / analyzeVideo / analyzeUrl functions below, so
// changing the transport here doesn't require touching any component.
const API_BASE = import.meta.env.VITE_FACTCHECK_API ?? '/api/factcheck';
const USE_MOCK = true; // used only when the real API flag below is off
// Real analysis (Gemini, via the /api/factcheck/* serverless function) for image, video and URL
// when VITE_REAL_IMAGE_API=true (VITE_REAL_API=true also works). Otherwise the mock pipeline runs.
const USE_REAL =
  import.meta.env.VITE_REAL_API === 'true' || import.meta.env.VITE_REAL_IMAGE_API === 'true';

export const PIPELINE_STEPS: Omit<PipelineStep, 'status'>[] = [
  { id: 'extract', label: 'Claim Extractor', description: 'Identifying the core factual claim' },
  { id: 'gather', label: 'Evidence Gatherer', description: 'Searching trusted sources and fact-check archives' },
  { id: 'credibility', label: 'Credibility Evaluator', description: 'Scoring the reliability of each source' },
  { id: 'fallacy', label: 'Fallacy Detector', description: 'Checking the reasoning for gaps' },
  { id: 'weigh', label: 'Counter-Evidence Weigher', description: 'Weighing evidence for and against' },
  { id: 'report', label: 'Report Generator', description: 'Building the final verdict and summary' },
];

export type StepCallback = (steps: PipelineStep[]) => void;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runMockPipeline(
  contentType: ContentType,
  inputLabel: string,
  onProgress?: StepCallback
): Promise<FactCheckResult> {
  const steps: PipelineStep[] = PIPELINE_STEPS.map((s) => ({ ...s, status: 'pending' }));
  onProgress?.([...steps]);

  for (let i = 0; i < steps.length; i++) {
    steps[i].status = 'running';
    onProgress?.([...steps]);
    const duration = 500 + Math.random() * 700;
    await delay(duration);
    steps[i].status = 'completed';
    steps[i].durationMs = Math.round(duration);
    onProgress?.([...steps]);
  }

  const verdicts: Verdict[] = ['true', 'false', 'misleading', 'unverified'];
  const seed = inputLabel.length + contentType.length;
  const verdict = verdicts[seed % verdicts.length];
  const confidence = 62 + ((seed * 7) % 35);

  const summaries: Record<Verdict, string> = {
    true: 'The core claim is corroborated by multiple independent, high-credibility sources with no material contradictions found.',
    false: 'The claim contradicts verifiable evidence from high-credibility sources and shows signs of manipulation.',
    misleading: 'Parts of the claim are accurate, but the framing omits key context that changes its meaning.',
    unverified: 'No sufficiently credible sources could confirm or deny this claim at this time.',
  };

  return {
    id: crypto.randomUUID(),
    contentType,
    inputLabel,
    claim:
      contentType === 'url'
        ? `Content at ${inputLabel}`
        : `Uploaded ${contentType}: ${inputLabel}`,
    verdict,
    confidence,
    summary: summaries[verdict],
    isSample: true,
    reasons: [
      {
        title: 'Sample data',
        detail: 'This result comes from the demo pipeline. The verdict and reasons are placeholders, not an analysis of your file.',
        stance: 'inconclusive',
      },
    ],
    sources: [
      { name: 'Reuters Fact Check', url: '#', credibility: 0.95, stance: verdict === 'true' ? 'supports' : 'contradicts' },
      { name: 'AP Verification Desk', url: '#', credibility: 0.92, stance: verdict === 'true' ? 'supports' : 'contradicts' },
      { name: 'Independent domain analysis', url: '#', credibility: 0.71, stance: 'neutral' },
    ],
    createdAt: new Date().toISOString(),
  };
}

async function postToRealApi(
  endpoint: string,
  body: BodyInit,
  headers?: HeadersInit
): Promise<FactCheckResult> {
  const response = await fetch(`${API_BASE}?kind=${endpoint}`, {
    method: 'POST',
    body,
    headers,
  });
  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json())?.error ?? '';
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail || `Analysis failed (${response.status})`);
  }
  return response.json();
}

// Downscale + re-encode as JPEG so the request stays under serverless body limits
// (Vercel: 4.5 MB) and the model gets a sensible resolution.
async function imageToBase64(file: File, maxSide = 1600): Promise<{ data: string; mediaType: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return { data: dataUrl.split(',')[1], mediaType: 'image/jpeg' };
}

// Videos are too big to upload to a serverless function, so we sample evenly spaced
// frames in the browser and send only those (audio is not analysed).
async function extractVideoFrames(
  file: File,
  count = 8,
  maxSide = 768
): Promise<{ frames: string[]; durationSec: number }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.preload = 'auto';
  video.playsInline = true;
  video.src = url;

  const once = (event: string, ms = 15000) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('This video could not be read by your browser.')), ms);
      video.addEventListener(
        event,
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
      video.addEventListener(
        'error',
        () => {
          clearTimeout(timer);
          reject(new Error('This video format could not be read by your browser. Try an MP4 (H.264) or WEBM file.'));
        },
        { once: true }
      );
    });

  try {
    await once('loadeddata');
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.videoWidth) {
      throw new Error('This video could not be read by your browser.');
    }
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d')!;

    const frames: string[] = [];
    for (let i = 0; i < count; i++) {
      const seeked = once('seeked');
      video.currentTime = (duration * (i + 0.5)) / count;
      await seeked;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
    }
    return { frames, durationSec: duration };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// One real request, so the six stages are shown as a simple running -> completed sweep.
async function runRealPipeline(
  contentType: ContentType,
  inputLabel: string,
  buildBody: () => Promise<string>,
  onProgress?: StepCallback
): Promise<FactCheckResult> {
  const steps: PipelineStep[] = PIPELINE_STEPS.map((s) => ({ ...s, status: 'pending' }));
  steps[0].status = 'running';
  onProgress?.([...steps]);

  const started = Date.now();
  const body = await buildBody();
  const result = await postToRealApi(contentType, body, { 'Content-Type': 'application/json' });

  const per = Math.round((Date.now() - started) / steps.length);
  steps.forEach((s) => {
    s.status = 'completed';
    s.durationMs = per;
  });
  onProgress?.([...steps]);
  return { ...result, contentType, inputLabel };
}
export async function analyzeImage(
  file: File,
  onProgress?: StepCallback,
  description = ''
): Promise<FactCheckResult> {
  if (USE_REAL) {
    return runRealPipeline(
      'image',
      file.name,
      async () => {
        const { data, mediaType } = await imageToBase64(file);
        return JSON.stringify({ image: data, mediaType, fileName: file.name, description });
      },
      onProgress
    );
  }
  if (USE_MOCK) return runMockPipeline('image', file.name, onProgress);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  return postToRealApi('image', formData);
}

export async function analyzeVideo(
  file: File,
  onProgress?: StepCallback,
  description = ''
): Promise<FactCheckResult> {
  if (USE_REAL) {
    return runRealPipeline(
      'video',
      file.name,
      async () => {
        const { frames, durationSec } = await extractVideoFrames(file);
        return JSON.stringify({ frames, durationSec, fileName: file.name, description });
      },
      onProgress
    );
  }
  if (USE_MOCK) return runMockPipeline('video', file.name, onProgress);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  return postToRealApi('video', formData);
}

export async function analyzeUrl(
  url: string,
  onProgress?: StepCallback,
  description = ''
): Promise<FactCheckResult> {
  if (USE_REAL) {
    return runRealPipeline('url', url, async () => JSON.stringify({ url, description }), onProgress);
  }
  if (USE_MOCK) return runMockPipeline('url', url, onProgress);
  return postToRealApi('url', JSON.stringify({ url, description }), { 'Content-Type': 'application/json' });
}


const HISTORY_KEY = 'factcheck.history';

export function saveToHistory(result: FactCheckResult): void {
  const entry: HistoryEntry = {
    id: result.id,
    contentType: result.contentType,
    inputLabel: result.inputLabel,
    verdict: result.verdict,
    confidence: result.confidence,
    createdAt: result.createdAt,
  };
  const existing = getHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...existing].slice(0, 50)));
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
