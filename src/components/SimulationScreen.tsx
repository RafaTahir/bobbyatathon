import { useEffect, useState } from 'react'

const MESSAGES = [
  'Removing device...',
  'Traversing dependency graph...',
  'Propagating failures...',
  'Detecting circular dependencies...',
  'Calculating survivors...',
]

export default function SimulationScreen() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (msgIndex >= MESSAGES.length - 1) return
    const t = setTimeout(() => setMsgIndex((i) => i + 1), 380)
    return () => clearTimeout(t)
  }, [msgIndex])

  return (
    <div className="simulation-screen">
      <div className="sim-inner">
        <div className="sim-icon" aria-hidden="true">📱</div>
        <div className="sim-label">BLACKOUT</div>
        <div className="sim-message">{MESSAGES[msgIndex]}</div>
        <div className="sim-dots" aria-label="Processing">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}
