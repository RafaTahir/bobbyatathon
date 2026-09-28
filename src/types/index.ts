export type CapabilityId =
  | 'phone'
  | 'emergencyContact'
  | 'primaryAccount'
  | 'authentication'
  | 'money'
  | 'transport'
  | 'deviceRecovery'
  | 'identity'

export type CapabilityStatus = 'alive' | 'dead' | 'uncertain' | 'removed'

export interface Capability {
  id: CapabilityId
  label: string
  icon: string
  description: string
  // primary dependency — if null, capability is self-contained
  dependsOn: CapabilityId | null
  // alternative independent fallback paths — if any survive, capability survives
  fallbacks: FallbackPath[]
}

export interface FallbackPath {
  id: string
  description: string
  // true = user confirmed they have this
  // false = user confirmed they don't
  // null = user said not sure
  confirmed: boolean | null
}

export interface CapabilityAnswer {
  capabilityId: CapabilityId
  hasFallback: boolean | null // true=yes, false=no, null=not sure
  fallbackType?: string
}

export interface SimulationResult {
  status: Record<CapabilityId, CapabilityStatus>
  failures: FailureExplanation[]
  circularDependencies: CircularDep[]
  survivedCount: number
  failedCount: number
  uncertainCount: number
}

export interface FailureExplanation {
  capabilityId: CapabilityId
  reason: string
  isCircular: boolean
}

export interface CircularDep {
  path: CapabilityId[]
  explanation: string
}

export type Screen =
  | 'landing'
  | 'questionnaire'
  | 'graph'
  | 'simulation'
  | 'results'
  | 'fix'
  | 'card'

export interface AppState {
  screen: Screen
  answers: Partial<Record<CapabilityId, CapabilityAnswer>>
  simulationResult: SimulationResult | null
  postFixResult: SimulationResult | null
  fixes: Partial<Record<CapabilityId, boolean>>
  isDemoMode: boolean
  isSimulating: boolean
}
