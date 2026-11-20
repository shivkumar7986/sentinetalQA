export interface WebsiteRole {
  id: string
  name: string
  description: string
  landingPath: string
  allowedModules: string[]
}

export interface WebsiteModule {
  id: string
  name: string
  path: string
  expectedHeading?: string
  navigationPath?: string
  keyElements?: string[]
  navPath?: string[]
}

export interface AuthFlow {
  method: string
  usernameSelector: string
  passwordSelector: string
  submitSelector?: string
  successIndicatorSelector: string
  failureMessageSelector?: string
  redirectTarget: string
}

export interface BusinessRule {
  id: string
  moduleId?: string
  tag?: string
  text: string
  priority: 'P1' | 'P2' | 'P3' | 'high' | 'medium' | 'low'
  isActive: boolean
}

export interface MaskedCredential {
  roleId: string
  roleName: string
  usernameMasked: string
  secretMasked?: string
  hasPassword: true
  lastUpdated: string
}

export interface ConfigVersion {
  version: number
  title: string
  createdAt: string
  author: string
  category: string
  summary: string
  diff?: string
  isActive?: boolean
}

export interface FullWebsiteConfig {
  websiteId: string
  version: number
  roles: WebsiteRole[]
  modules: WebsiteModule[]
  authFlow: AuthFlow
  businessRules: BusinessRule[]
  customInstructions: string
  credentials: MaskedCredential[]
  versions: ConfigVersion[]
}

export const INITIAL_CONFIGS: Record<string, FullWebsiteConfig> = {
  'web-1': {
    websiteId: 'web-1',
    version: 4,
    roles: [
      {
        id: 'role-dispatcher',
        name: 'Dispatcher',
        description: 'Manages fleet routes and live tracking',
        landingPath: '/dashboard',
        allowedModules: ['Dashboard', 'Tracking', 'Fleet'],
      },
      {
        id: 'role-customer',
        name: 'Customer',
        description: 'Views own shipment orders and status',
        landingPath: '/orders',
        allowedModules: ['Orders', 'Tracking'],
      },
    ],
    modules: [
      {
        id: 'mod-login',
        name: 'Login',
        path: '/login',
        expectedHeading: 'Sign in to Logistics',
        navigationPath: 'Direct URL',
      },
      {
        id: 'mod-dashboard',
        name: 'Dashboard',
        path: '/dashboard',
        expectedHeading: 'Operations Overview',
        navigationPath: 'Auto redirect after login',
      },
      {
        id: 'mod-tracking',
        name: 'Tracking',
        path: '/tracking',
        expectedHeading: 'Live Shipment Tracking',
        navigationPath: 'Sidebar → Tracking',
      },
    ],
    authFlow: {
      method: 'Form login (Email / Password)',
      usernameSelector: 'email',
      passwordSelector: 'password',
      redirectTarget: '/dashboard',
      successIndicatorSelector: 'Set-Cookie: sid + HTTP 200',
      failureMessageSelector: 'Invalid credentials. Please try again.',
    },
    businessRules: [
      {
        id: 'rule-1',
        text: 'Unauthenticated requests to /tracking must redirect to /login',
        tag: 'Tracking',
        priority: 'P1',
        isActive: true,
      },
      {
        id: 'rule-2',
        text: 'Customer role cannot view fleet dispatch controls',
        tag: 'Fleet',
        priority: 'P1',
        isActive: true,
      },
      {
        id: 'rule-3',
        text: 'Expired session returns 401 and preserves redirect query param',
        tag: 'Login',
        priority: 'P2',
        isActive: false,
      },
    ],
    customInstructions:
      'Ignore cookie consent banners. Wait for Tracking table hydration before asserting heading text. Never submit destructive DELETE actions on staging.',
    credentials: [
      {
        roleId: 'role-dispatcher',
        roleName: 'Dispatcher',
        usernameMasked: 'dispatcher@logistics.internal',
        secretMasked: '••••••••••••',
        hasPassword: true,
        lastUpdated: '2d ago',
      },
      {
        roleId: 'role-customer',
        roleName: 'Customer',
        usernameMasked: 'customer.qa@logistics.internal',
        secretMasked: '••••••••••••',
        hasPassword: true,
        lastUpdated: '5d ago',
      },
    ],
    versions: [
      {
        version: 4,
        title: 'Added Tracking module expected heading & key elements',
        author: 'Aarav Mehta',
        category: 'Modules',
        createdAt: 'Today 11:20',
        summary: 'Added Tracking module expected heading & key elements',
        diff: "+ Tracking expected heading: 'Live Shipment Tracking'\n~ Updated navPath: Sidebar → Tracking",
        isActive: true,
      },
      {
        version: 3,
        title: 'Updated Dispatcher landing path to /dashboard',
        author: 'Riya Sharma',
        category: 'Roles',
        createdAt: 'Yesterday 18:05',
        summary: 'Updated Dispatcher landing path to /dashboard',
        diff: 'landingPath: "/routes" → "/dashboard"',
        isActive: false,
      },
      {
        version: 2,
        title: 'Added P1 auth redirect rule for /tracking',
        author: 'Aarav Mehta',
        category: 'Business rules',
        createdAt: '3d ago',
        summary: 'Added P1 auth redirect rule for /tracking',
        diff: '+ Rule (P1): Unauthenticated requests to /tracking must redirect to /login',
        isActive: false,
      },
      {
        version: 1,
        title: 'Created baseline website configuration',
        author: 'Aarav Mehta',
        category: 'Initial',
        createdAt: '7d ago',
        summary: 'Created baseline website configuration',
        diff: 'Initial configuration snapshot created.',
        isActive: false,
      },
    ],
  },
}
