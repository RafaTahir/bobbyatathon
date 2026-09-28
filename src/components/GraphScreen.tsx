import type { CapabilityAnswer, CapabilityId } from '../types'
import { CAPABILITIES, CAPABILITY_ORDER } from '../data/capabilities'

interface Props {
  answers: Partial<Record<CapabilityId, CapabilityAnswer>>
  isDemoMode: boolean
  onKill: () => void
  onBack: () => void
}

function getNodeStatus(
  capId: CapabilityId,
  answers: Partial<Record<CapabilityId, CapabilityAnswer>>
): 'alive' | 'uncertain' | 'dead' {
  const a = answers[capId]
  if (!a) return 'uncertain'
  if (a.hasFallback === true) return 'alive'
  if (a.hasFallback === false) return 'dead'
  return 'uncertain'
}

const NODE_POSITIONS: Record<CapabilityId, { x: number; y: number }> = {
  phone:           { x: 50,  y: 50  },
  emergencyContact:{ x: 15,  y: 18  },
  primaryAccount:  { x: 82,  y: 18  },
  authentication:  { x: 15,  y: 82  },
  money:           { x: 82,  y: 82  },
  transport:       { x: 50,  y: 8   },
  deviceRecovery:  { x: 8,   y: 50  },
  identity:        { x: 92,  y: 50  },
}

const STATUS_COLOR = {
  alive: '#22c55e',
  uncertain: '#f59e0b',
  dead: '#ef4444',
}

const STATUS_LABEL = {
  alive: 'INDEPENDENT',
  uncertain: 'UNVERIFIED',
  dead: 'PHONE ONLY',
}

export default function GraphScreen({ answers, isDemoMode, onKill, onBack }: Props) {
  return (
    <div className="graph-screen">
      <div className="graph-header">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        {isDemoMode && (
          <span className="demo-badge">DEMO: The Overconnected Developer</span>
        )}
      </div>

      <h2 className="graph-title">Your Digital Dependency Map</h2>
      <p className="graph-subtitle">
        Green = independent fallback confirmed · Amber = unverified · Red = phone only
      </p>

      <div className="graph-container">
        <svg viewBox="0 0 100 100" className="graph-svg" aria-label="Digital dependency map">
          {/* Connection lines from phone to each capability */}
          {CAPABILITY_ORDER.map((capId) => {
            const pos = NODE_POSITIONS[capId]
            const phonePos = NODE_POSITIONS.phone
            const status = getNodeStatus(capId, answers)
            const stroke = STATUS_COLOR[status]
            return (
              <line
                key={capId}
                x1={phonePos.x}
                y1={phonePos.y}
                x2={pos.x}
                y2={pos.y}
                stroke={stroke}
                strokeWidth="0.5"
                strokeDasharray={status === 'alive' ? undefined : '1.5 1'}
                strokeOpacity="0.6"
              />
            )
          })}
        </svg>

        {/* Phone node — center */}
        <div
          className="graph-node graph-node--phone"
          style={{
            left: `${NODE_POSITIONS.phone.x}%`,
            top: `${NODE_POSITIONS.phone.y}%`,
          }}
          role="img"
          aria-label="Phone — central node"
        >
          <span className="node-icon">📱</span>
          <span className="node-label">PHONE</span>
        </div>

        {/* Capability nodes */}
        {CAPABILITY_ORDER.map((capId) => {
          const cap = CAPABILITIES[capId]
          const pos = NODE_POSITIONS[capId]
          const status = getNodeStatus(capId, answers)
          const color = STATUS_COLOR[status]
          const label = STATUS_LABEL[status]
          return (
            <div
              key={capId}
              className="graph-node"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                '--node-color': color,
              } as React.CSSProperties}
              role="img"
              aria-label={`${cap.label}: ${label}`}
            >
              <span className="node-icon">{cap.icon}</span>
              <span className="node-label">{cap.label}</span>
              <span className="node-status" style={{ color }}>{label}</span>
            </div>
          )
        })}
      </div>

      <div className="graph-actions">
        <button
          className="btn-kill"
          onClick={onKill}
          aria-label="Simulate phone loss — KILL MY PHONE"
        >
          KILL MY PHONE
        </button>
        <p className="kill-disclaimer">
          This simulates phone loss. BLACKOUT does not interact with or disable your device.
        </p>
      </div>
    </div>
  )
}
