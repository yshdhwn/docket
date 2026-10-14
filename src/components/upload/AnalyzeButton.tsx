interface AnalyzeButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export function AnalyzeButton({ disabled, loading, onClick }: AnalyzeButtonProps) {
  return (
    <button type="button" className="btn-analyze" disabled={disabled || loading} onClick={onClick}>
      {loading ? 'Analyzing…' : 'Analyze'}
    </button>
  );
}
