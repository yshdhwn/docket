import type { EvidenceSource } from '../../types/factCheck';

export function DetectionDetails({ sources }: { sources: EvidenceSource[] }) {
  return (
    <div className="sources">
      <p className="sources__title">Evidence considered</p>
      {sources.map((source) => (
        <div className="source-row" key={source.name}>
          <span>{source.name}</span>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="preview__size">{Math.round(source.credibility * 100)}% credible</span>
            <span className={`source-stance stance--${source.stance}`}>{source.stance}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
