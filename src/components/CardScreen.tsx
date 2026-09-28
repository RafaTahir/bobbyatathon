import type { CapabilityId, SimulationResult } from '../types'
import { CAPABILITIES, CAPABILITY_ORDER } from '../data/capabilities'

interface Props {
  result: SimulationResult
  fixes: Partial<Record<CapabilityId, boolean>>
  onReset: () => void
}

const STATUS_LABELS: Record<string, string> = {
  alive: 'READY',
  uncertain: 'UNVERIFIED',
  dead: 'AT RISK',
  removed: '',
}

const STATUS_SYMBOLS: Record<string, string> = {
  alive: '✓',
  uncertain: '?',
  dead: '✗',
  removed: '',
}

export default function CardScreen({ result, onReset }: Props) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="card-screen">
      <div className="card-actions no-print">
        <button className="btn-ghost" onClick={onReset}>← Start Over</button>
        <button className="btn-secondary" onClick={() => window.print()}>
          PRINT BLACKOUT CARD
        </button>
      </div>

      <div className="blackout-card" id="printable-card">
        <div className="bcard-header">
          <div className="bcard-wordmark">BLACKOUT</div>
          <div className="bcard-subtitle">Your offline escape plan</div>
        </div>

        <div className="bcard-rows">
          {CAPABILITY_ORDER.map((capId) => {
            const cap = CAPABILITIES[capId]
            const st = result.status[capId] ?? 'dead'
            return (
              <div key={capId} className={`bcard-row bcard-row--${st}`}>
                <span className="bcard-icon">{cap.icon}</span>
                <span className="bcard-name">{cap.label}</span>
                <span className={`bcard-status-symbol bcard-sym--${st}`}>
                  {STATUS_SYMBOLS[st]}
                </span>
                <span className={`bcard-status-label bcard-lbl--${st}`}>
                  {STATUS_LABELS[st]}
                </span>
              </div>
            )
          })}
        </div>

        <div className="bcard-footer">
          <div className="bcard-date">Last tested: {today}</div>
          <div className="bcard-reminder">RUN BLACKOUT AGAIN PERIODICALLY</div>
          <div className="bcard-privacy">
            This card contains no passwords, recovery codes or financial credentials.
          </div>
        </div>
      </div>
    </div>
  )
}
