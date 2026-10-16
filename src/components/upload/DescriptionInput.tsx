interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  kind: 'image' | 'video' | 'url';
}

export const MAX_DESCRIPTION = 1000;

const PLACEHOLDER: Record<DescriptionInputProps['kind'], string> = {
  image: 'e.g. Photo of two 1000-peso notes shared on social media. Is the second one fake?',
  video: 'e.g. Clip claiming to show a flood in Mumbai this week. Where and when was it filmed?',
  url: 'e.g. Article claiming a new law bans cash payments. Are the claims accurate?',
};

export function DescriptionInput({ value, onChange, kind }: DescriptionInputProps) {
  return (
    <div className="desc-field">
      <label htmlFor="description">
        Describe it <span>(optional) – add context, where it came from, or what you want checked</span>
      </label>
      <textarea
        id="description"
        rows={3}
        maxLength={MAX_DESCRIPTION}
        placeholder={PLACEHOLDER[kind]}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="desc-field__count">
        {value.length} / {MAX_DESCRIPTION}
      </div>
    </div>
  );
}