import { useRef, useState } from 'react';
import type { DragEvent } from 'react';

interface UploadBoxProps {
  kind: 'image' | 'video';
  onFileSelected: (file: File) => void;
}

export function UploadBox({ kind, onFileSelected }: UploadBoxProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = kind === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/quicktime,video/webm';

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <strong>Drop {kind === 'image' ? 'an image' : 'a video'} here, or click to browse</strong>
      <small>
        {kind === 'image' ? 'JPEG, PNG or WEBP' : 'MP4, MOV or WEBM'} · up to 25 MB
      </small>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
    </div>
  );
}
