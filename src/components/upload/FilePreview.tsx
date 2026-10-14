import { useEffect, useState } from 'react';

interface FilePreviewProps {
  file: File;
  kind: 'image' | 'video';
  onRemove: () => void;
}

export function FilePreview({ file, kind, onRemove }: FilePreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const sizeLabel = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="preview">
      {objectUrl && kind === 'image' && <img src={objectUrl} alt="" />}
      {objectUrl && kind === 'video' && <video src={objectUrl} muted />}
      <div className="preview__meta">
        <div className="preview__name">{file.name}</div>
        <div className="preview__size">{sizeLabel}</div>
      </div>
      <button type="button" className="preview__remove" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}
