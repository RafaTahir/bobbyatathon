import type { CapabilityAnswer, CapabilityId, SimulationResult } from '../types'
import { CAPABILITIES, CAPABILITY_ORDER } from '../data/capabilities'

interface Props {
  result: SimulationResult
  firstResult: SimulationResult
  isSecondRun: boolean
  fixes: Partial<Record<CapabilityId, boolean>>
  answers: Partial<Record<CapabilityId, CapabilityAnswer>>
  onFix: () => void
  onRunAgain: () => void
  onCard: () => void
  onReset: () => void
}

const STATUS_COLOR: Record<string, string> = {
  alive: '#22c55e',
  uncertain: '#f59e0b',
  dead: '#ef4444',
  removed: '#444',
}

const STATUS_LABEL: Record<string, string> = {
  alive: 'SURVIVED',
  uncertain: 'UNCERTAIN',
  dead: 'FAILED',
  removed: 'REMOVED',
}

export default function ResultsScreen({
  result,
  firstResult,
  isSecondRun,
  onFix,
  onRunAgain,
  onCard,
  onReset,
}: Props) {
  const { survivedCount, failedCount, uncertainCount, circularDependencies, failures, status } = result
  const totalCaps = CAPABILITY_ORDER.length

  const survived = CAPABILITY_ORDER.filter((id) => status[id] === 'alive')
  const failed = CAPABILITY_ORDER.filter((id) => status[id] === 'dead')
  const uncertain = CAPABILITY_ORDER.filter((id) => status[id] === 'uncertain')

  return (
    <div className="results-screen">
      <div className="results-header">
        <h1 className="results-title">
          {isSecondRun ? 'BLACKOUT COMPLETE — AFTER FIXES' : 'BLACKOUT COMPLETE'}
        </h1>
        {isSecondRun && (
          <div className="results-comparison">
            <span className="cmp-before">Before: {firstResult.survivedCount} / {totalCaps} survived</span>
            <span className="cmp-arrow">→</span>
            <span className="cmp-after">{survivedCount} / {totalCaps} survived</span>
          </div>
        )}
      </div>

      {/* Summary counts */}
      <div className="results-summary">
        <div className="summary-stat summary-stat--green">
          <span className="stat-num">{survivedCount}</span>
          <span className="stat-label">survived</span>
        </div>
        <div className="summary-stat summary-stat--red">
          <span className="stat-num">{failedCount}</span>
          <span className="stat-label">failed</span>
        </div>
        {uncertainCount > 0 && (
          <div className="summary-stat summary-stat--amber">
            <span className="stat-num">{uncertainCount}</span>
            <span className="stat-label">uncertain</span>
          </div>
        )}
        {circularDependencies.length > 0 && (
          <div className="summary-stat summary-stat--purple">
            <span className="stat-num">{circularDependencies.length}</span>
            <span className="stat-label">circular {circularDependencies.length === 1 ? 'dependency' : 'dependencies'}</span>
          </div>
        )}
      </div>

      {/* Circular dependencies — hero moment */}
      {circularDependencies.length > 0 && (
        <div className="circular-section">
          <div className="circular-badge">⚠ CIRCULAR RECOVERY DEPENDENCY</div>
          {circularDependencies.map((c, i) => (
            <div key={i} className="circular-card">
              <p className="circular-path">{c.path.join(' → ')}</p>
              <p className="circular-explanation">{c.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Survived */}
      {survived.length > 0 && (
        <div className="cap-section">
          <h3 className="cap-section-title cap-section-title--green">WHAT SURVIVED</h3>
          <div className="cap-cards">
            {survived.map((id) => {
              const cap = CAPABILITIES[id]
              return (
                <div key={id} className="cap-card cap-card--alive" role="status" aria-label={`${cap.label} survived`}>
                  <span className="cap-icon">{cap.icon}</span>
                  <div className="cap-info">
                    <span className="cap-name">{cap.label}</span>
                    <span className="cap-status" style={{ color: STATUS_COLOR.alive }}>
                      {STATUS_LABEL.alive}
                    </span>
                    <p className="cap-desc">Independent fallback confirmed.</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Failed */}
      {failed.length > 0 && (
        <div className="cap-section">
          <h3 className="cap-section-title cap-section-title--red">WHAT FAILED</h3>
          <div className="cap-cards">
            {failed.map((id) => {
              const cap = CAPABILITIES[id]
              const failure = failures.find((f) => f.capabilityId === id)
              return (
                <div key={id} className="cap-card cap-card--dead" role="status" aria-label={`${cap.label} failed`}>
                  <span className="cap-icon">{cap.icon}</span>
                  <div className="cap-info">
                    <span className="cap-name">{cap.label}</span>
                    <span
                      className="cap-status"
                      style={{ color: failure?.isCircular ? '#a855f7' : STATUS_COLOR.dead }}
                    >
                      {failure?.isCircular ? 'CIRCULAR DEPENDENCY' : STATUS_LABEL.dead}
                    </span>
                    {failure && <p className="cap-reason">{failure.reason}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Uncertain */}
      {uncertain.length > 0 && (
        <div className="cap-section">
          <h3 className="cap-section-title cap-section-title--amber">UNVERIFIED</h3>
          <div className="cap-cards">
            {uncertain.map((id) => {
              const cap = CAPABILITIES[id]
              const failure = failures.find((f) => f.capabilityId === id)
              return (
                <div key={id} className="cap-card cap-card--uncertain" role="status" aria-label={`${cap.label} uncertain`}>
                  <span className="cap-icon">{cap.icon}</span>
                  <div className="cap-info">
                    <span className="cap-name">{cap.label}</span>
                    <span className="cap-status" style={{ color: STATUS_COLOR.uncertain }}>
                      {STATUS_LABEL.uncertain}
                    </span>
                    {failure && <p className="cap-reason">{failure.reason}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="results-actions">
        {!isSecondRun && (failedCount > 0 || uncertainCount > 0) && (
          <button className="btn-primary" onClick={onFix}>
            BUILD ESCAPE ROUTES
          </button>
        )}
        {isSecondRun && survivedCount >= totalCaps - 1 && (
          <button className="btn-primary" onClick={onCard}>
            GET YOUR BLACKOUT CARD
          </button>
        )}
        {isSecondRun && (
          <button className="btn-secondary" onClick={onRunAgain}>
            RUN BLACKOUT AGAIN
          </button>
        )}
        <button className="btn-ghost" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
