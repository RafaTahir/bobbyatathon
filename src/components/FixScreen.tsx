import type { CapabilityId, SimulationResult } from '../types'
import { CAPABILITIES, CAPABILITY_ORDER } from '../data/capabilities'

interface EscapeRoute {
  weakness: string
  escapeRoute: string
}

const ESCAPE_ROUTES: Record<CapabilityId, EscapeRoute> = {
  phone: {
    weakness: '',
    escapeRoute: '',
  },
  emergencyContact: {
    weakness: 'Your trusted contacts exist only on your phone.',
    escapeRoute:
      'Keep at least one trusted contact memorised or written somewhere physically independent from the phone.',
  },
  primaryAccount: {
    weakness: 'Accessing your primary account currently requires approving a prompt on this phone.',
    escapeRoute:
      'Set up an alternative sign-in method that does not depend on this phone — a different device, a hardware key, or browser-stored credentials on a separate machine you can access.',
  },
  authentication: {
    weakness: 'Authentication currently depends entirely on this phone.',
    escapeRoute:
      'Set up an independent recovery method and confirm you can use it without this phone. Never share that recovery method with BLACKOUT — we just need you to know it exists and works.',
  },
  money: {
    weakness: 'Your stated payment methods depend on the phone.',
    escapeRoute:
      'Keep a physical card or small amount of cash in a wallet or bag independent of the phone.',
  },
  transport: {
    weakness: 'Your route home depends on a mobile app.',
    escapeRoute:
      'Know one route home that needs no app — a bus number, a walking route, or a number to call for a ride that you know by memory.',
  },
  deviceRecovery: {
    weakness: 'The account needed to secure the missing phone depends on authentication from that phone.',
    escapeRoute:
      'Ensure you can access your device management account from another device or browser without needing the missing phone to approve the login.',
  },
  identity: {
    weakness: 'Your identity and emergency information exists only on the missing phone.',
    escapeRoute:
      'Store a copy of key identity or emergency information somewhere physically or digitally independent — a trusted person, a printed card, a secured file elsewhere.',
  },
}

interface Props {
  result: SimulationResult
  fixes: Partial<Record<CapabilityId, boolean>>
  onApplyFix: (capId: CapabilityId) => void
  onRemoveFix: (capId: CapabilityId) => void
  onRunAgain: () => void
  onBack: () => void
}

export default function FixScreen({ result, fixes, onApplyFix, onRemoveFix, onRunAgain, onBack }: Props) {
  const needsFix = CAPABILITY_ORDER.filter(
    (id) => result.status[id] === 'dead' || result.status[id] === 'uncertain'
  )

  const fixedCount = Object.values(fixes).filter(Boolean).length
  const canRerun = fixedCount > 0

  return (
    <div className="fix-screen">
      <div className="fix-header">
        <button className="btn-ghost" onClick={onBack}>← Back to Results</button>
        <h1 className="fix-title">BUILD YOUR ESCAPE ROUTES</h1>
        <p className="fix-subtitle">
          Mark each fallback once you have it in place. Then rerun the drill.
        </p>
      </div>

      <div className="fix-cards">
        {needsFix.map((capId) => {
          const cap = CAPABILITIES[capId]
          const route = ESCAPE_ROUTES[capId]
          const isFixed = !!fixes[capId]

          return (
            <div
              key={capId}
              className={`fix-card ${isFixed ? 'fix-card--fixed' : ''}`}
              role="region"
              aria-label={`${cap.label} escape route`}
            >
              <div className="fix-card-header">
                <span className="fix-icon">{cap.icon}</span>
                <div>
                  <span className="fix-name">{cap.label}</span>
                  {isFixed && <span className="fix-done-badge">FALLBACK READY</span>}
                </div>
              </div>

              {!isFixed && (
                <>
                  <div className="fix-weakness">
                    <strong>Weakness</strong>
                    <p>{route.weakness}</p>
                  </div>
                  <div className="fix-route">
                    <strong>Escape route</strong>
                    <p>{route.escapeRoute}</p>
                  </div>
                  <button
                    className="btn-fix"
                    onClick={() => onApplyFix(capId)}
                    aria-label={`Mark ${cap.label} fallback as ready`}
                  >
                    I HAVE A FALLBACK NOW
                  </button>
                </>
              )}

              {isFixed && (
                <button
                  className="btn-undo"
                  onClick={() => onRemoveFix(capId)}
                  aria-label={`Undo fix for ${cap.label}`}
                >
                  Undo
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="fix-actions">
        <button
          className="btn-primary"
          onClick={onRunAgain}
          disabled={!canRerun}
          aria-label="Rerun BLACKOUT simulation with fixes applied"
        >
          RUN BLACKOUT AGAIN
          {fixedCount > 0 && <span className="fix-count-badge">{fixedCount} fixed</span>}
        </button>
        <p className="fix-hint">
          {canRerun
            ? 'Ready to rerun the drill with your fixes applied.'
            : 'Mark at least one fallback before rerunning.'}
        </p>
      </div>
    </div>
  )
}
