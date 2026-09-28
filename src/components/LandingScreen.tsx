interface Props {
  onRunDrill: () => void
  onDemo: () => void
}

export default function LandingScreen({ onRunDrill, onDemo }: Props) {
  return (
    <div className="landing">
      <div className="landing-content">
        <div className="wordmark">BLACKOUT</div>
        <p className="tagline">
          What happens when the device you need to recover<br />
          your digital life is the thing you just lost?
        </p>
        <div className="landing-body">
          <p className="landing-scenario">
            Your phone disappears tonight.
          </p>
          <p className="landing-question">
            Can you still get home, contact someone,<br />
            access your accounts and secure what was stolen?
          </p>
        </div>
        <div className="landing-actions">
          <button className="btn-primary" onClick={onRunDrill}>
            RUN THE DRILL
          </button>
          <button className="btn-secondary" onClick={onDemo}>
            Try Demo Scenario
          </button>
        </div>
        <p className="privacy-note">
          BLACKOUT never asks for passwords, recovery codes or banking credentials.
        </p>
      </div>
    </div>
  )
}
