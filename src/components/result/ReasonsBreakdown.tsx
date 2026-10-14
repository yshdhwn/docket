import type { ReasonPoint, ReasonStance } from '../../types/factCheck';

const STANCE_LABEL: Record<ReasonStance, string> = {
  indicates_fake: 'Points to fake',
  indicates_authentic: 'Points to authentic',
  inconclusive: 'Inconclusive',
};

interface Props {
  reasons: ReasonPoint[];
  limitations?: string;
  isSample?: boolean;
}

export function ReasonsBreakdown({ reasons, limitations, isSample }: Props) {
  if (reasons.length === 0) return null;

  return (
    <div className="reasons">
      <p className="sources__title">Why this verdict{isSample ? ' (sample data)' : ''}</p>
      <ol className="reasons__list">
        {reasons.map((r, i) => (
          <li className="reason" key={`${i}-${r.title}`}>
            <div className="reason__head">
              <span className="reason__title">{r.title}</span>
              <span className={`reason__stance reason__stance--${r.stance}`}>{STANCE_LABEL[r.stance]}</span>
            </div>
            <p className="reason__detail">{r.detail}</p>
          </li>
        ))}
      </ol>
      {limitations && <p className="reasons__limits">Limits of this check: {limitations}</p>}
    </div>
  );
}
