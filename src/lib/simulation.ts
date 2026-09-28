/**
 * BLACKOUT Simulation Engine
 *
 * Deterministic dependency graph evaluator.
 * No randomness. No invented scores.
 * Every result is traceable to user answers.
 */

import { CAPABILITIES, CAPABILITY_ORDER } from '../data/capabilities'
import type {
  CapabilityAnswer,
  CapabilityId,
  CapabilityStatus,
  CircularDep,
  FailureExplanation,
  SimulationResult,
} from '../types'

/**
 * Detect cycles in a directed graph using DFS.
 * Returns arrays of node IDs that form cycles.
 */
export function detectCycles(
  nodes: CapabilityId[],
  edges: Partial<Record<CapabilityId, CapabilityId>>
): CapabilityId[][] {
  const cycles: CapabilityId[][] = []
  const visited = new Set<CapabilityId>()
  const inStack = new Set<CapabilityId>()

  function dfs(node: CapabilityId, path: CapabilityId[]): void {
    if (inStack.has(node)) {
      // found a cycle — extract just the cycle portion
      const cycleStart = path.indexOf(node)
      cycles.push(path.slice(cycleStart))
      return
    }
    if (visited.has(node)) return

    visited.add(node)
    inStack.add(node)
    path.push(node)

    const dep = edges[node]
    if (dep) {
      dfs(dep, [...path])
    }

    inStack.delete(node)
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  }

  return cycles
}

/**
 * Determine if a capability has at least one confirmed independent fallback
 * (i.e. one that does NOT depend on the phone).
 */
function hasIndependentFallback(
  capId: CapabilityId,
  answers: Partial<Record<CapabilityId, CapabilityAnswer>>
): boolean | null {
  const answer = answers[capId]
  if (!answer) return null
  if (answer.hasFallback === true) return true
  if (answer.hasFallback === false) return false
  return null // not sure
}

/**
 * Run the full BLACKOUT simulation.
 *
 * Algorithm:
 * 1. Mark PHONE as removed.
 * 2. For each capability, check if it has a confirmed independent fallback.
 *    - true → survives (green)
 *    - false → fails (red) unless dependency chain can be resolved
 *    - null → uncertain (amber)
 * 3. Apply dependency chain propagation for deviceRecovery specifically
 *    (depends on primaryAccount, which depends on phone).
 * 4. Detect circular dependencies in the dependency graph.
 * 5. Collect human-readable failure reasons.
 */
export function runSimulation(
  answers: Partial<Record<CapabilityId, CapabilityAnswer>>,
  fixes: Partial<Record<CapabilityId, boolean>> = {}
): SimulationResult {
  const status: Record<CapabilityId, CapabilityStatus> = {
    phone: 'removed',
    emergencyContact: 'dead',
    primaryAccount: 'dead',
    authentication: 'dead',
    money: 'dead',
    transport: 'dead',
    deviceRecovery: 'dead',
    identity: 'dead',
  }

  const failures: FailureExplanation[] = []
  const circularDependencies: CircularDep[] = []

  // Build effective answers with fixes applied
  const effectiveAnswers: Partial<Record<CapabilityId, CapabilityAnswer>> = {
    ...answers,
  }
  for (const [capId, fixed] of Object.entries(fixes)) {
    if (fixed) {
      effectiveAnswers[capId as CapabilityId] = {
        capabilityId: capId as CapabilityId,
        hasFallback: true,
      }
    }
  }

  // Build dependency map for cycle detection
  const dependencyEdges: Partial<Record<CapabilityId, CapabilityId>> = {}
  for (const capId of CAPABILITY_ORDER) {
    const cap = CAPABILITIES[capId]
    if (cap.dependsOn) {
      dependencyEdges[capId] = cap.dependsOn
    }
  }

  // Detect cycles in the full graph
  const rawCycles = detectCycles(CAPABILITY_ORDER, dependencyEdges)

  // For BLACKOUT context, the important cycle is: phone depends on nothing,
  // but deviceRecovery → primaryAccount → phone (and phone is gone).
  // The "circular dependency" we surface is: to recover the phone you need
  // primaryAccount, but primaryAccount (without a fallback) needs the phone.
  const primaryAccountFallback = hasIndependentFallback('primaryAccount', effectiveAnswers)
  const deviceRecoveryFallback = hasIndependentFallback('deviceRecovery', effectiveAnswers)

  // The circular scenario: no independent access to primary account
  // AND no independent recovery method for device
  if (primaryAccountFallback !== true && deviceRecoveryFallback !== true) {
    circularDependencies.push({
      path: ['deviceRecovery', 'primaryAccount', 'phone'],
      explanation:
        'Your recovery mechanism depends on the device you are trying to recover from losing. To locate or erase the missing phone you need your primary account — but accessing that account requires authentication from the missing phone.',
    })
  }

  // Evaluate each non-phone capability
  for (const capId of CAPABILITY_ORDER) {
    const fallback = hasIndependentFallback(capId, effectiveAnswers)

    if (fallback === true) {
      status[capId] = 'alive'
      continue
    }

    if (fallback === null) {
      // uncertain — also check if it's caught in a circular dep
      const isCircular = circularDependencies.some((c) => c.path[0] === capId)
      if (isCircular) {
        status[capId] = 'dead'
        failures.push({
          capabilityId: capId,
          reason: buildCircularReason(capId),
          isCircular: true,
        })
      } else {
        status[capId] = 'uncertain'
        failures.push({
          capabilityId: capId,
          reason: buildUncertainReason(capId),
          isCircular: false,
        })
      }
      continue
    }

    // fallback === false — check if it's circular or simple failure
    const isCircular = circularDependencies.some((c) => c.path[0] === capId)
    status[capId] = 'dead'
    failures.push({
      capabilityId: capId,
      reason: isCircular ? buildCircularReason(capId) : buildFailureReason(capId, effectiveAnswers),
      isCircular,
    })
  }

  // Also flag rawCycles that we haven't already covered
  for (const cycle of rawCycles) {
    const alreadyCovered = circularDependencies.some(
      (c) => c.path[0] === cycle[0]
    )
    if (!alreadyCovered && cycle.length > 0) {
      circularDependencies.push({
        path: cycle,
        explanation: `A recovery loop was detected: ${cycle.join(' → ')}. These capabilities depend on each other for recovery.`,
      })
    }
  }

  const survivedCount = CAPABILITY_ORDER.filter(
    (id) => status[id] === 'alive'
  ).length
  const failedCount = CAPABILITY_ORDER.filter(
    (id) => status[id] === 'dead'
  ).length
  const uncertainCount = CAPABILITY_ORDER.filter(
    (id) => status[id] === 'uncertain'
  ).length

  return {
    status,
    failures,
    circularDependencies,
    survivedCount,
    failedCount,
    uncertainCount,
  }
}

function buildFailureReason(
  capId: CapabilityId,
  _answers: Partial<Record<CapabilityId, CapabilityAnswer>>
): string {
  const reasons: Record<CapabilityId, string> = {
    phone: 'Phone is the failed device.',
    emergencyContact:
      'All your contacts are stored on the missing phone. You have no independent way to reach someone you trust.',
    primaryAccount:
      'Accessing your primary account requires approving a prompt on the missing phone. No independent path confirmed.',
    authentication:
      'Your authentication method depends entirely on this phone — likely an authenticator app or SMS code. No independent recovery method confirmed.',
    money:
      'Your only payment methods require the missing phone — mobile wallet or app-based payment. No physical card or cash confirmed.',
    transport:
      'Your route home depends on an app on the missing phone. No independent transport method confirmed.',
    deviceRecovery:
      'The account required to locate, lock or erase your phone depends on authentication from that same phone.',
    identity:
      'Your identity and emergency information exists only on the missing phone. No independent copy confirmed.',
  }
  return reasons[capId]
}

function buildCircularReason(capId: CapabilityId): string {
  if (capId === 'deviceRecovery') {
    return 'The account needed to locate or erase the missing phone requires authentication from that phone. This is a circular dependency — you cannot recover the device using a path that depends on the device.'
  }
  return 'This capability depends on a recovery path that itself depends on the missing phone. Circular dependency detected.'
}

function buildUncertainReason(capId: CapabilityId): string {
  const reasons: Record<CapabilityId, string> = {
    phone: 'Phone status unknown.',
    emergencyContact:
      "You weren't sure if you had an independent contact method. This may or may not work — it has not been verified.",
    primaryAccount:
      "You weren't sure if you could access your primary account independently. This is unverified and may fail under pressure.",
    authentication:
      "You weren't certain about your independent authentication method. Unverified fallbacks often fail when needed most.",
    money:
      "You weren't sure if you had an independent payment method available. This may leave you unable to pay.",
    transport:
      "You weren't sure if you could get home without your phone. This is unverified.",
    deviceRecovery:
      "You weren't certain you could access the account needed to secure the missing phone independently.",
    identity:
      "You weren't sure if you had identity or emergency information stored independently.",
  }
  return reasons[capId]
}
