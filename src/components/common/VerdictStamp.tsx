import type { Verdict } from '../../types/factCheck';
import { VERDICT_LABEL } from '../../types/factCheck';

export function VerdictStamp({ verdict, confidence }: { verdict: Verdict; confidence: number }) {
  return (
    <div className={`stamp stamp--${verdict}`}>
      <span className="stamp__verdict">{VERDICT_LABEL[verdict]}</span>
      <span className="stamp__sub">{confidence}% confidence</span>
    </div>
  );
}
