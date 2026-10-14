interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function UrlInput({ value, onChange }: UrlInputProps) {
  return (
    <div className="url-field">
      <input
        type="url"
        placeholder="https://example.com/article"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
