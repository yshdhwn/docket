import { PIPELINE_STEPS } from '../services/factCheckService';

export function About() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>How a check gets made.</h1>
          <p>
            Docket doesn't just guess. Every submission moves through the same six-stage pipeline before a
            verdict is returned.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="folder">
          <span className="folder__tab">Methodology</span>
          {PIPELINE_STEPS.map((step, i) => (
            <div className="step-row" key={step.id}>
              <span className="step-marker step-marker--completed">{i + 1}</span>
              <div className="step-body">
                <div className="step-label">{step.label}</div>
                <div className="step-desc">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
