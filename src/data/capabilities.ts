import type { Capability, CapabilityId } from '../types'

export const CAPABILITIES: Record<CapabilityId, Capability> = {
  phone: {
    id: 'phone',
    label: 'Phone',
    icon: '📱',
    description: 'Your primary device',
    dependsOn: null,
    fallbacks: [],
  },
  emergencyContact: {
    id: 'emergencyContact',
    label: 'Emergency Contact',
    icon: '👤',
    description: 'Reach someone you trust',
    dependsOn: 'phone',
    fallbacks: [
      {
        id: 'knownNumber',
        description: 'You know a number by memory',
        confirmed: null,
      },
      {
        id: 'storedIndependently',
        description: 'Stored somewhere independent of this phone',
        confirmed: null,
      },
    ],
  },
  primaryAccount: {
    id: 'primaryAccount',
    label: 'Primary Account',
    icon: '✉️',
    description: 'Access your primary email / account',
    dependsOn: 'phone',
    fallbacks: [
      {
        id: 'independentAccess',
        description: 'Can log in without phone approval',
        confirmed: null,
      },
    ],
  },
  authentication: {
    id: 'authentication',
    label: 'Authentication',
    icon: '🔐',
    description: 'Authenticate without this phone',
    dependsOn: 'phone',
    fallbacks: [
      {
        id: 'independentAuth',
        description: 'Independent recovery/auth method exists',
        confirmed: null,
      },
    ],
  },
  money: {
    id: 'money',
    label: 'Money',
    icon: '💳',
    description: 'Pay for something',
    dependsOn: 'phone',
    fallbacks: [
      {
        id: 'physicalCard',
        description: 'Physical card available',
        confirmed: null,
      },
      {
        id: 'cash',
        description: 'Cash available',
        confirmed: null,
      },
      {
        id: 'otherMethod',
        description: 'Other independent payment method',
        confirmed: null,
      },
    ],
  },
  transport: {
    id: 'transport',
    label: 'Transport',
    icon: '🚕',
    description: 'Get home without a phone app',
    dependsOn: 'phone',
    fallbacks: [
      {
        id: 'independentTransport',
        description: 'Can get home without any phone app',
        confirmed: null,
      },
    ],
  },
  deviceRecovery: {
    id: 'deviceRecovery',
    label: 'Device Recovery',
    icon: '🛰',
    description: 'Locate, lock or erase the missing phone',
    // depends on primaryAccount which depends on phone → circular!
    dependsOn: 'primaryAccount',
    fallbacks: [
      {
        id: 'independentRecovery',
        description: 'Can access recovery account without this phone',
        confirmed: null,
      },
    ],
  },
  identity: {
    id: 'identity',
    label: 'Identity',
    icon: '🪪',
    description: 'Access identity / emergency info',
    dependsOn: 'phone',
    fallbacks: [
      {
        id: 'independentIdentity',
        description: 'Important info stored independently',
        confirmed: null,
      },
    ],
  },
}

export const CAPABILITY_ORDER: CapabilityId[] = [
  'emergencyContact',
  'primaryAccount',
  'authentication',
  'money',
  'transport',
  'deviceRecovery',
  'identity',
]
