import { useEffect, useState } from 'react';
import { clearHistory, getHistory } from '../services/factCheckService';
import type { HistoryEntry } from '../types/factCheck';
import { VERDICT_LABEL } from '../types/factCheck';

export function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Case history.</h1>
          <p>Every check you've run in this browser, most recent first.</p>
        </div>
      </section>

      <div className="container">
        <div className="folder">
          <span className="folder__tab">Docket log</span>

          {entries.length === 0 ? (
            <div className="empty-state">
              <strong>No checks yet</strong>
              Run your first analysis and it'll show up here.
            </div>
          ) : (
            <>
              {entries.map((entry) => (
                <div className="history-row" key={entry.id}>
                  <span className="history-row__type">{entry.contentType}</span>
                  <span className="history-row__label">{entry.inputLabel}</span>
                  <span>{VERDICT_LABEL[entry.verdict]}</span>
                  <span className="history-row__confidence">{entry.confidence}%</span>
                </div>
              ))}
              <button
                type="button"
                className="btn-analyze"
                style={{ marginTop: 24, background: 'transparent', color: 'var(--ink-navy)', border: '1px solid var(--ink-navy)' }}
                onClick={handleClear}
              >
                Clear history
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
