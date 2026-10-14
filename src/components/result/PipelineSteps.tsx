import type { PipelineStep } from '../../types/factCheck';

export function PipelineSteps({ steps }: { steps: PipelineStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="pipeline">
      <p className="pipeline__title">Running the pipeline</p>
      {steps.map((step) => (
        <div className="step-row" key={step.id}>
          <span className={`step-marker step-marker--${step.status}`}>
            {step.status === 'completed' ? '✓' : ''}
          </span>
          <div className="step-body">
            <div className="step-label">{step.label}</div>
            <div className="step-desc">{step.description}</div>
          </div>
          {step.durationMs && <span className="step-duration">{(step.durationMs / 1000).toFixed(1)}s</span>}
        </div>
      ))}
    </div>
  );
}
