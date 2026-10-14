import type { Verdict } from '../../types/factCheck';

const VERDICT_COLOR: Record<Verdict, string> = {
  true: '#276b5c',
  false: '#a13a2b',
  misleading: '#a3701f',
  unverified: '#4b5563',
};

export function ConfidenceScore({ confidence, verdict }: { confidence: number; verdict: Verdict }) {
  return (
    <div className="confidence" style={{ color: VERDICT_COLOR[verdict] }}>
      <div className="confidence__label">
        <span>Confidence</span>
        <span>{confidence}%</span>
      </div>
      <div className="confidence__track">
        <div className="confidence__fill" style={{ width: `${confidence}%` }} />
      </div>
    </div>
  );
}
