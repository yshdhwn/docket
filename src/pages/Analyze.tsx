import { useMemo, useState } from 'react';
import { UploadBox } from '../components/upload/UploadBox';
import { FilePreview } from '../components/upload/FilePreview';
import { UrlInput } from '../components/upload/UrlInput';
import { AnalyzeButton } from '../components/upload/AnalyzeButton';
import { PipelineSteps } from '../components/result/PipelineSteps';
import { ResultCard } from '../components/result/ResultCard';
import { useFactCheck } from '../hooks/useFactCheck';
import { validateFile, validateUrl } from '../utils/validation';
import type { ContentType } from '../types/factCheck';

const TABS: { id: ContentType; label: string }[] = [
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
  { id: 'url', label: 'URL' },
];

export function Analyze() {
  const [tab, setTab] = useState<ContentType>('image');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { status, steps, result, error, run, reset } = useFactCheck();

  const canSubmit = useMemo(() => {
    if (tab === 'url') return url.trim().length > 0;
    return file !== null;
  }, [tab, url, file]);

  function switchTab(next: ContentType) {
    setTab(next);
    setFile(null);
    setUrl('');
    setFormError(null);
    reset();
  }

  function handleFile(selected: File) {
    const check = validateFile(selected, tab as 'image' | 'video');
    if (!check.valid) {
      setFormError(check.error ?? 'Invalid file.');
      return;
    }
    setFormError(null);
    setFile(selected);
  }

  function handleSubmit() {
    if (tab === 'url') {
      const check = validateUrl(url);
      if (!check.valid) {
        setFormError(check.error ?? 'Invalid URL.');
        return;
      }
      setFormError(null);
      run('url', url.trim());
      return;
    }
    if (!file) return;
    run(tab === 'image' ? 'image' : 'video', file);
  }

  function startOver() {
    setFile(null);
    setUrl('');
    setFormError(null);
    reset();
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Verify before you trust it.</h1>
          <p>
            Upload an image or video, or drop in a link. Docket runs it through claim extraction, source
            gathering and credibility scoring, then hands back a plain verdict.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="folder">
          <span className="folder__tab">Exhibit A</span>

          {status !== 'success' && (
            <>
              <div className="tabset" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => switchTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab !== 'url' && !file && <UploadBox kind={tab as 'image' | 'video'} onFileSelected={handleFile} />}
              {tab !== 'url' && file && (
                <FilePreview file={file} kind={tab as 'image' | 'video'} onRemove={() => setFile(null)} />
              )}
              {tab === 'url' && <UrlInput value={url} onChange={setUrl} />}

              {formError && <p className="form-error">{formError}</p>}
              {status === 'error' && error && <p className="form-error">{error}</p>}

              <AnalyzeButton disabled={!canSubmit} loading={status === 'loading'} onClick={handleSubmit} />
            </>
          )}

          {status === 'loading' && <PipelineSteps steps={steps} />}
          {status === 'success' && result && <ResultCard result={result} onNewCheck={startOver} />}
        </div>
      </div>
    </>
  );
}
