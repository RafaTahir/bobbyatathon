import { describe, it, expect } from 'vitest'
import { runSimulation, detectCycles } from '../lib/simulation'
import { DEMO_ANSWERS } from '../data/demo'
import type { CapabilityAnswer, CapabilityId } from '../types'

// ─── TEST 1 ──────────────────────────────────────────────────────────────────
describe('TEST 1: phone removal causes phone-only dependency to fail', () => {
  it('a capability with no fallback fails when phone is removed', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      emergencyContact: { capabilityId: 'emergencyContact', hasFallback: false },
    }
    const result = runSimulation(answers)
    expect(result.status.phone).toBe('removed')
    expect(result.status.emergencyContact).toBe('dead')
  })
})

// ─── TEST 2 ──────────────────────────────────────────────────────────────────
describe('TEST 2: capability with independent fallback survives phone removal', () => {
  it('money survives when physical card is confirmed', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      money: { capabilityId: 'money', hasFallback: true, fallbackType: 'physicalCard' },
    }
    const result = runSimulation(answers)
    expect(result.status.phone).toBe('removed')
    expect(result.status.money).toBe('alive')
  })

  it('transport survives when independent route confirmed', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      transport: { capabilityId: 'transport', hasFallback: true },
    }
    const result = runSimulation(answers)
    expect(result.status.transport).toBe('alive')
  })
})

// ─── TEST 3 ──────────────────────────────────────────────────────────────────
describe('TEST 3: uncertain fallback produces amber/uncertain result', () => {
  it('not-sure answer produces uncertain status', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      identity: { capabilityId: 'identity', hasFallback: null },
    }
    const result = runSimulation(answers)
    expect(result.status.identity).toBe('uncertain')
  })

  it('uncertain capability does not count as survived', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      identity: { capabilityId: 'identity', hasFallback: null },
    }
    const result = runSimulation(answers)
    expect(result.survivedCount).toBe(0)
  })
})

// ─── TEST 4 ──────────────────────────────────────────────────────────────────
describe('TEST 4: circular recovery dependencies are detected', () => {
  it('detects circular dependency when primaryAccount and deviceRecovery both lack fallbacks', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      primaryAccount: { capabilityId: 'primaryAccount', hasFallback: false },
      deviceRecovery: { capabilityId: 'deviceRecovery', hasFallback: false },
    }
    const result = runSimulation(answers)
    expect(result.circularDependencies.length).toBeGreaterThan(0)
    const circlePath = result.circularDependencies[0].path
    expect(circlePath).toContain('deviceRecovery')
    expect(circlePath).toContain('primaryAccount')
  })

  it('deviceRecovery failure is marked as circular', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      primaryAccount: { capabilityId: 'primaryAccount', hasFallback: false },
      deviceRecovery: { capabilityId: 'deviceRecovery', hasFallback: false },
    }
    const result = runSimulation(answers)
    const devRecFailure = result.failures.find(
      (f) => f.capabilityId === 'deviceRecovery'
    )
    expect(devRecFailure?.isCircular).toBe(true)
  })

  it('detectCycles utility finds a simple loop', () => {
    // use real CapabilityIds to satisfy TypeScript
    const cycles = detectCycles(
      ['emergencyContact', 'primaryAccount', 'transport'] as CapabilityId[],
      { emergencyContact: 'primaryAccount', primaryAccount: 'emergencyContact' } as Partial<Record<CapabilityId, CapabilityId>>
    )
    expect(cycles.length).toBeGreaterThan(0)
  })
})

// ─── TEST 5 ──────────────────────────────────────────────────────────────────
describe('TEST 5: adding fallback changes second BLACKOUT result', () => {
  it('fixing emergencyContact changes it from dead to alive', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      emergencyContact: { capabilityId: 'emergencyContact', hasFallback: false },
    }
    const before = runSimulation(answers)
    expect(before.status.emergencyContact).toBe('dead')

    const after = runSimulation(answers, { emergencyContact: true })
    expect(after.status.emergencyContact).toBe('alive')
  })

  it('survivedCount increases after fixes are applied', () => {
    const answers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
      emergencyContact: { capabilityId: 'emergencyContact', hasFallback: false },
      money: { capabilityId: 'money', hasFallback: false },
    }
    const before = runSimulation(answers)
    const after = runSimulation(answers, {
      emergencyContact: true,
      money: true,
    })
    expect(after.survivedCount).toBeGreaterThan(before.survivedCount)
  })
})

// ─── TEST 6 ──────────────────────────────────────────────────────────────────
describe('TEST 6: Demo Mode produces expected known outcome', () => {
  it('demo scenario has exactly 2 survivors (money + transport)', () => {
    const result = runSimulation(DEMO_ANSWERS)
    expect(result.status.money).toBe('alive')
    expect(result.status.transport).toBe('alive')
    expect(result.status.emergencyContact).toBe('dead')
    expect(result.status.primaryAccount).toBe('dead')
    expect(result.status.authentication).toBe('dead')
    expect(result.status.deviceRecovery).toBe('dead')
    expect(result.survivedCount).toBe(2)
  })

  it('demo has at least one circular dependency', () => {
    const result = runSimulation(DEMO_ANSWERS)
    expect(result.circularDependencies.length).toBeGreaterThan(0)
  })

  it('demo identity is uncertain (not sure)', () => {
    const result = runSimulation(DEMO_ANSWERS)
    expect(result.status.identity).toBe('uncertain')
  })

  it('demo has correct failed count (4 dead + 1 uncertain)', () => {
    const result = runSimulation(DEMO_ANSWERS)
    expect(result.failedCount).toBe(4)
    expect(result.uncertainCount).toBe(1)
  })
})
