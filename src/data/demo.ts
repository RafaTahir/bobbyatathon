import type { CapabilityAnswer, CapabilityId } from '../types'

/**
 * Demo scenario: "The Overconnected Developer"
 * Appears reasonably prepared. But phone loss causes cascade.
 * Circular dependency: deviceRecovery → primaryAccount → phone
 */
export const DEMO_ANSWERS: Partial<Record<CapabilityId, CapabilityAnswer>> = {
  emergencyContact: {
    capabilityId: 'emergencyContact',
    hasFallback: false, // all contacts on phone only
  },
  primaryAccount: {
    capabilityId: 'primaryAccount',
    hasFallback: false, // 2FA requires the phone
  },
  authentication: {
    capabilityId: 'authentication',
    hasFallback: false, // authenticator app is on the phone
  },
  money: {
    capabilityId: 'money',
    hasFallback: true, // has a physical card
    fallbackType: 'physicalCard',
  },
  transport: {
    capabilityId: 'transport',
    hasFallback: true, // knows the way, can walk or take public transit
  },
  deviceRecovery: {
    capabilityId: 'deviceRecovery',
    hasFallback: false, // account needs phone to authenticate → circular
  },
  identity: {
    capabilityId: 'identity',
    hasFallback: null, // not sure — they might have some things stored
  },
}

export const DEMO_LABEL = 'The Overconnected Developer'
export const DEMO_DESCRIPTION =
  'A tech-savvy professional. Cloud-synced, passwordless, always connected. Seems prepared — until the phone disappears.'
