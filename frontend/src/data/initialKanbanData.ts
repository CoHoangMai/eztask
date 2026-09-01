import type { Board, Assignee, Label, AutomationRule, Workspace, Team } from '../types/kanban';

export const DEFAULT_USERS: Assignee[] = [
  {
    id: 'user-1',
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'alex.morgan@apexcloud.io',
    role: 'Chief Technology Officer',
    department: 'Engineering',
    workspaceIds: ['ws-apex-cloud', 'ws-studio-pulse', 'ws-quantum-labs', 'ws-nova-fintech']
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'sarah.chen@studiopulse.design',
    role: 'Creative Director & Founder',
    department: 'Design',
    workspaceIds: ['ws-studio-pulse', 'ws-apex-cloud']
  },
  {
    id: 'user-3',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'david.kim@apexcloud.io',
    role: 'Principal Cloud Architect',
    department: 'Engineering',
    workspaceIds: ['ws-apex-cloud', 'ws-nova-fintech', 'ws-quantum-labs']
  },
  {
    id: 'user-4',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    email: 'elena.rostova@novafintech.com',
    role: 'VP of Growth & Operations',
    department: 'Operations',
    workspaceIds: ['ws-nova-fintech', 'ws-apex-cloud']
  },
  {
    id: 'user-5',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'marcus.vance@novafintech.com',
    role: 'Managing Director & Founder',
    department: 'Executive',
    workspaceIds: ['ws-nova-fintech', 'ws-apex-cloud']
  },
  {
    id: 'user-6',
    name: 'Lucas Meyer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    email: 'lucas.meyer@independent-audit.io',
    role: 'Independent Cyber Auditor',
    department: 'External Consulting',
    workspaceIds: [] // Unaffiliated user: No initial workspace membership
  }
];

export const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-apex-cloud',
    name: 'Apex Cloud Solutions',
    slug: 'apex-cloud',
    logo: 'AC',
    description: 'Enterprise Cloud Infrastructure, Kubernetes Platforms & DevOps automation.',
    ownerId: 'user-1',
    members: [
      { userId: 'user-1', role: 'owner', joinedAt: '2025-01-10T00:00:00Z' },
      { userId: 'user-2', role: 'admin', joinedAt: '2025-02-15T00:00:00Z' },
      { userId: 'user-3', role: 'member', joinedAt: '2025-03-01T00:00:00Z' },
      { userId: 'user-4', role: 'member', joinedAt: '2025-04-12T00:00:00Z' },
      { 
        userId: 'user-5', 
        role: 'guest', 
        joinedAt: '2026-06-01T00:00:00Z',
        allowedBoardIds: ['board-apex-architecture'] // Guest only has access to this single board
      }
    ],
    createdAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'ws-nova-fintech',
    name: 'Nova Fintech Inc',
    slug: 'nova-fintech',
    logo: 'NF',
    description: 'Core Banking API, Global Merchant Payments & PCI-DSS Financial Compliance.',
    ownerId: 'user-5',
    members: [
      { userId: 'user-5', role: 'owner', joinedAt: '2025-03-01T00:00:00Z' },
      { userId: 'user-4', role: 'admin', joinedAt: '2025-03-10T00:00:00Z' },
      { userId: 'user-3', role: 'member', joinedAt: '2025-04-01T00:00:00Z' },
      { 
        userId: 'user-1', 
        role: 'guest', 
        joinedAt: '2026-05-10T00:00:00Z',
        allowedBoardIds: ['board-nova-gateway'] // External technical advisor guest
      }
    ],
    createdAt: '2025-03-01T00:00:00Z'
  },
  {
    id: 'ws-studio-pulse',
    name: 'Studio Pulse Creative',
    slug: 'studio-pulse',
    logo: 'SP',
    description: 'Boutique Brand Design, Digital Art Direction & UI/UX Product Design Systems.',
    ownerId: 'user-2',
    members: [
      { userId: 'user-2', role: 'owner', joinedAt: '2025-05-01T00:00:00Z' },
      { userId: 'user-1', role: 'member', joinedAt: '2025-06-15T00:00:00Z' }
    ],
    createdAt: '2025-05-01T00:00:00Z'
  },
  {
    id: 'ws-quantum-labs',
    name: 'Quantum Edge Labs',
    slug: 'quantum-edge',
    logo: 'QE',
    description: 'Next-generation Edge AI Models, Tensor Processing & Hardware Acceleration Research.',
    ownerId: 'user-1',
    members: [
      { userId: 'user-1', role: 'owner', joinedAt: '2026-01-10T00:00:00Z' },
      { userId: 'user-3', role: 'member', joinedAt: '2026-02-01T00:00:00Z' }
    ],
    createdAt: '2026-01-10T00:00:00Z'
    // Intentionally 0 boards in INITIAL_BOARDS to test clean empty board state!
  }
];

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team-apex-eng',
    workspaceId: 'ws-apex-cloud',
    name: 'Core Infrastructure',
    description: 'Cloud microservices, Kubernetes clusters, security audits, and latency pipelines.',
    color: '#3b82f6',
    memberIds: ['user-1', 'user-3']
  },
  {
    id: 'team-apex-growth',
    workspaceId: 'ws-apex-cloud',
    name: 'Growth & Enterprise Sales',
    description: 'Enterprise contract acquisitions, solutions architecture, and customer success.',
    color: '#10b981',
    memberIds: ['user-4', 'user-2']
  },
  {
    id: 'team-nova-security',
    workspaceId: 'ws-nova-fintech',
    name: 'Security & Compliance',
    description: 'PCI-DSS validation, automated threat detection, and banking audits.',
    color: '#ec4899',
    memberIds: ['user-5', 'user-4']
  },
  {
    id: 'team-studio-brand',
    workspaceId: 'ws-studio-pulse',
    name: 'Brand & Visual Design',
    description: 'Design systems, 3D assets, typography tokens, and creative reviews.',
    color: '#8b5cf6',
    memberIds: ['user-2', 'user-1']
  }
];

export const DEFAULT_LABELS: Label[] = [
  { id: 'lbl-feature', name: 'Feature', color: '#2563eb', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800', category: 'Product' },
  { id: 'lbl-urgent', name: 'Urgent Bug', color: '#dc2626', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800', category: 'Product' },
  { id: 'lbl-techdebt', name: 'Tech Debt', color: '#64748b', bg: 'bg-slate-100 dark:bg-slate-800/80', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', category: 'Product' },
  { id: 'lbl-design', name: 'Design & UI', color: '#7c3aed', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800', category: 'Design' },
  { id: 'lbl-marketing', name: 'Marketing Campaign', color: '#db2777', bg: 'bg-pink-100 dark:bg-pink-950/60', text: 'text-pink-800 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-800', category: 'Marketing' },
  { id: 'lbl-security', name: 'Security Audit', color: '#d97706', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800', category: 'Operations' }
];

export interface BoardTemplate {
  id: string;
  name: string;
  category: Board['category'];
  description: string;
  iconName: string;
  defaultColumns: Array<{ title: string; colorAccent: string; limit?: number }>;
}

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: 'tpl-software-sprint',
    name: 'Software Sprint & Kanban',
    category: 'product',
    description: 'Agile development workflow with WIP limits, code review, and QA verification.',
    iconName: 'Code',
    defaultColumns: [
      { title: 'Backlog', colorAccent: '#64748b' },
      { title: 'Sprint Ready', colorAccent: '#3b82f6' },
      { title: 'In Progress', colorAccent: '#f59e0b', limit: 4 },
      { title: 'Review & QA', colorAccent: '#8b5cf6' },
      { title: 'Done & Deployed', colorAccent: '#10b981' }
    ]
  },
  {
    id: 'tpl-marketing-content',
    name: 'Marketing & Editorial Calendar',
    category: 'marketing',
    description: 'Editorial calendar for articles, press releases, social campaigns, and PR launches.',
    iconName: 'Megaphone',
    defaultColumns: [
      { title: 'Content Ideas', colorAccent: '#ec4899' },
      { title: 'In Writing', colorAccent: '#f59e0b' },
      { title: 'Design & Visuals', colorAccent: '#8b5cf6' },
      { title: 'Scheduled', colorAccent: '#3b82f6' },
      { title: 'Published', colorAccent: '#10b981' }
    ]
  },
  {
    id: 'tpl-sales-crm',
    name: 'Sales CRM & Deals Pipeline',
    category: 'sales',
    description: 'Manage prospect leads, discovery meetings, commercial proposals, and closing.',
    iconName: 'DollarSign',
    defaultColumns: [
      { title: 'Lead In', colorAccent: '#64748b' },
      { title: 'Discovery Call', colorAccent: '#3b82f6' },
      { title: 'Proposal Sent', colorAccent: '#f59e0b' },
      { title: 'Negotiation', colorAccent: '#8b5cf6' },
      { title: 'Closed Won', colorAccent: '#10b981' }
    ]
  },
  {
    id: 'tpl-design-studio',
    name: 'Design & Brand Studio',
    category: 'design',
    description: 'Brand identity, UI asset kits, motion graphics, and creative reviews.',
    iconName: 'Palette',
    defaultColumns: [
      { title: 'Creative Brief', colorAccent: '#64748b' },
      { title: 'Concepts & Moodboards', colorAccent: '#ec4899' },
      { title: 'In Production', colorAccent: '#f59e0b' },
      { title: 'Client Feedback', colorAccent: '#8b5cf6' },
      { title: 'Delivered', colorAccent: '#10b981' }
    ]
  },
  {
    id: 'tpl-recruiting-pipeline',
    name: 'Talent Acquisition & Recruiting',
    category: 'recruiting',
    description: 'Candidate screening, interview stages, technical trials, and offer letters.',
    iconName: 'UserCheck',
    defaultColumns: [
      { title: 'Applied', colorAccent: '#64748b' },
      { title: 'Screening Call', colorAccent: '#3b82f6' },
      { title: 'Interview Rounds', colorAccent: '#f59e0b' },
      { title: 'Offer Sent', colorAccent: '#8b5cf6' },
      { title: 'Hired & Onboarding', colorAccent: '#10b981' }
    ]
  },
  {
    id: 'tpl-blank-custom',
    name: 'Custom / Blank Workflow',
    category: 'general',
    description: 'Clean standard columns adaptable to any company or project.',
    iconName: 'Layout',
    defaultColumns: [
      { title: 'To Do', colorAccent: '#3b82f6' },
      { title: 'In Progress', colorAccent: '#f59e0b' },
      { title: 'Done', colorAccent: '#10b981' }
    ]
  }
];

export const DEFAULT_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-1',
    workspaceId: 'ws-apex-cloud',
    title: 'Auto-move completed tasks to Done',
    description: 'When all checklist items are checked off, automatically move the card to the Completed column.',
    triggerEvent: 'checklist_completed',
    actionSummary: 'Move task to Completed column',
    enabled: true
  },
  {
    id: 'auto-2',
    workspaceId: 'ws-apex-cloud',
    title: 'Urgent priority broadcast alert',
    description: 'When an urgent priority card is added, trigger an instant broadcast alert in the notification center.',
    triggerEvent: 'card_created',
    actionSummary: 'Notify all team members and trigger high-priority alert',
    enabled: true
  }
];

export const INITIAL_BOARDS: Board[] = [
  // ---------------------------------------------------------------------------
  // Workspaces 1: Apex Cloud Solutions
  // ---------------------------------------------------------------------------
  {
    id: 'board-apex-architecture',
    workspaceId: 'ws-apex-cloud',
    title: 'Q3 Cloud Architecture & Security',
    description: 'Multi-region Kubernetes migration, zero-trust perimeter, and SOC2 compliance.',
    category: 'product',
    visibility: 'workspace',
    ownerId: 'user-1',
    memberIds: ['user-1', 'user-2', 'user-3', 'user-5'],
    teamId: 'team-infra',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z',
    columns: [
      { id: 'col-apex-backlog', title: 'Architecture Backlog', cardIds: ['card-apex-101', 'card-apex-102'], colorAccent: '#64748b' },
      { id: 'col-apex-todo', title: 'Sprint To Do', cardIds: ['card-apex-103'], colorAccent: '#3b82f6' },
      { id: 'col-apex-progress', title: 'In Progress', cardIds: ['card-apex-104', 'card-apex-105'], limit: 4, colorAccent: '#f59e0b' },
      { id: 'col-apex-review', title: 'Peer Review & QA', cardIds: ['card-apex-106'], colorAccent: '#8b5cf6' },
      { id: 'col-apex-done', title: 'Production Deployed', cardIds: ['card-apex-107'], colorAccent: '#10b981' }
    ],
    cards: {
      'card-apex-101': {
        id: 'card-apex-101',
        boardId: 'board-apex-architecture',
        columnId: 'col-apex-backlog',
        title: 'Zero-Trust IAM authentication policy rollout',
        description: 'Enforce MFA and certificate-based mutual TLS between all internal microservices.',
        priority: 'high',
        labels: [DEFAULT_LABELS[0], DEFAULT_LABELS[5]],
        assignees: [DEFAULT_USERS[0]],
        dueDate: '2026-09-10',
        estimatedHours: 24,
        checklist: [
          { id: 'chk-a1', text: 'Draft IAM least-privilege matrix', completed: true },
          { id: 'chk-a2', text: 'Implement Envoy sidecar proxy certificates', completed: false }
        ],
        comments: [
          {
            id: 'comm-a1',
            author: DEFAULT_USERS[0],
            text: 'Initial latency benchmark looks within 1.5ms overhead.',
            createdAt: '2026-08-19T10:15:00.000Z'
          }
        ],
        createdAt: '2026-08-15T09:00:00.000Z',
        updatedAt: '2026-08-19T10:15:00.000Z'
      },
      'card-apex-102': {
        id: 'card-apex-102',
        boardId: 'board-apex-architecture',
        columnId: 'col-apex-backlog',
        title: 'Automated database failover drill with zero downtime',
        description: 'Simulate primary node shutdown and test replica promotion in Asia-East cluster.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[2]],
        assignees: [DEFAULT_USERS[2]],
        dueDate: '2026-09-15',
        estimatedHours: 16,
        checklist: [
          { id: 'chk-a3', text: 'Set up synthetic traffic generator', completed: false },
          { id: 'chk-a4', text: 'Verify read-write connection pooler reconnects', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-16T11:00:00.000Z',
        updatedAt: '2026-08-16T11:00:00.000Z'
      },
      'card-apex-103': {
        id: 'card-apex-103',
        boardId: 'board-apex-architecture',
        columnId: 'col-apex-todo',
        title: 'Grafana dashboard telemetry for p99 latency alerts',
        description: 'Configure real-time Prometheus alertmanager with PagerDuty webhook integration.',
        priority: 'urgent',
        labels: [DEFAULT_LABELS[1]],
        assignees: [DEFAULT_USERS[2]],
        dueDate: '2026-08-26',
        estimatedHours: 12,
        coverColor: '#dc2626',
        checklist: [
          { id: 'chk-a5', text: 'Create ingress dashboard panels', completed: true },
          { id: 'chk-a6', text: 'Test webhook notification triggers', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-17T08:30:00.000Z',
        updatedAt: '2026-08-17T08:30:00.000Z'
      },
      'card-apex-104': {
        id: 'card-apex-104',
        boardId: 'board-apex-architecture',
        columnId: 'col-apex-progress',
        title: 'Kubernetes 1.31 cluster upgrade & node pool rotation',
        description: 'Perform rolling restart of worker nodes without dropping live WebSocket connections.',
        priority: 'high',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[0], DEFAULT_USERS[2]],
        dueDate: '2026-08-25',
        estimatedHours: 20,
        coverColor: '#3b82f6',
        checklist: [
          { id: 'chk-a7', text: 'Upgrade staging cluster', completed: true },
          { id: 'chk-a8', text: 'Validate pod disruption budgets', completed: true },
          { id: 'chk-a9', text: 'Execute production canary rollout', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-18T09:00:00.000Z',
        updatedAt: '2026-08-20T07:20:00.000Z'
      },
      'card-apex-105': {
        id: 'card-apex-105',
        boardId: 'board-apex-architecture',
        columnId: 'col-apex-progress',
        title: 'Nova Fintech partner integration gateway (Guest review)',
        description: 'Review API rate-limiting and webhook HMAC signing with Marcus Vance (Guest Advisor).',
        priority: 'medium',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[0], DEFAULT_USERS[4]],
        dueDate: '2026-08-28',
        estimatedHours: 14,
        checklist: [
          { id: 'chk-a10', text: 'Draft partner API specs (OpenAPI 3.1)', completed: true },
          { id: 'chk-a11', text: 'Exchange sandbox encryption keys', completed: false }
        ],
        comments: [
          {
            id: 'comm-a2',
            author: DEFAULT_USERS[4],
            text: 'Reviewed the HMAC SHA-256 payload structure, looks compatible with our banking router.',
            createdAt: '2026-08-19T14:30:00.000Z'
          }
        ],
        createdAt: '2026-08-18T10:00:00.000Z',
        updatedAt: '2026-08-19T14:30:00.000Z'
      },
      'card-apex-106': {
        id: 'card-apex-106',
        boardId: 'board-apex-architecture',
        columnId: 'col-apex-review',
        title: 'SOC2 Type II compliance audit evidence collection',
        description: 'Gather automated audit trail logs, pull request review approvals, and backup test reports.',
        priority: 'high',
        labels: [DEFAULT_LABELS[5]],
        assignees: [DEFAULT_USERS[3]],
        dueDate: '2026-08-22',
        estimatedHours: 18,
        coverColor: '#059669',
        checklist: [
          { id: 'chk-a12', text: 'Export AWS CloudTrail & GCP Audit Logs', completed: true },
          { id: 'chk-a13', text: 'Verify automated dependency vulnerability scanner reports', completed: true }
        ],
        comments: [],
        createdAt: '2026-08-16T14:00:00.000Z',
        updatedAt: '2026-08-19T16:45:00.000Z'
      },
      'card-apex-107': {
        id: 'card-apex-107',
        boardId: 'board-apex-architecture',
        columnId: 'col-apex-done',
        title: 'Redis cluster caching layer for fast session verification',
        description: 'Reduced user token verification query latency from 35ms down to 1.2ms.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[2]],
        dueDate: '2026-08-18',
        estimatedHours: 12,
        coverColor: '#10b981',
        checklist: [
          { id: 'chk-a14', text: 'Deploy Redis cluster with sentinel failover', completed: true },
          { id: 'chk-a15', text: 'Run benchmark load test (50k req/sec)', completed: true }
        ],
        comments: [],
        createdAt: '2026-08-10T09:00:00.000Z',
        updatedAt: '2026-08-18T17:00:00.000Z'
      }
    }
  },
  {
    id: 'board-apex-sprint42',
    workspaceId: 'ws-apex-cloud',
    title: 'Sprint 42: Developer Portal & CLI',
    description: 'Building developer SDKs, CLI tools, and interactive API documentation.',
    category: 'product',
    visibility: 'workspace',
    ownerId: 'user-1',
    memberIds: ['user-1', 'user-2', 'user-3'],
    teamId: 'team-eng',
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z',
    columns: [
      { id: 'col-sprint-todo', title: 'Sprint Backlog', cardIds: ['card-sprint-1'], colorAccent: '#3b82f6' },
      { id: 'col-sprint-dev', title: 'In Development', cardIds: ['card-sprint-2'], colorAccent: '#f59e0b' },
      { id: 'col-sprint-qa', title: 'QA & Docs', cardIds: ['card-sprint-3'], colorAccent: '#8b5cf6' },
      { id: 'col-sprint-released', title: 'Shipped', cardIds: ['card-sprint-4'], colorAccent: '#10b981' }
    ],
    cards: {
      'card-sprint-1': {
        id: 'card-sprint-1',
        boardId: 'board-apex-sprint42',
        columnId: 'col-sprint-todo',
        title: 'Release TypeScript & Go SDK v2.4 with streaming support',
        description: 'Provide typed interfaces for server-sent event log streams and job tracking.',
        priority: 'high',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[0]],
        dueDate: '2026-08-30',
        checklist: [],
        comments: [],
        createdAt: '2026-08-18T08:00:00.000Z',
        updatedAt: '2026-08-18T08:00:00.000Z'
      },
      'card-sprint-2': {
        id: 'card-sprint-2',
        boardId: 'board-apex-sprint42',
        columnId: 'col-sprint-dev',
        title: 'Apex CLI interactive login (`apex auth login`)',
        description: 'Implement browser PKCE OAuth flow for CLI authentication without manual API key entry.',
        priority: 'urgent',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[0], DEFAULT_USERS[2]],
        dueDate: '2026-08-24',
        coverColor: '#f59e0b',
        checklist: [
          { id: 'chk-cli1', text: 'Spin up local ephemeral callback server', completed: true },
          { id: 'chk-cli2', text: 'Store refresh token in OS secure keyring', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-17T11:00:00.000Z',
        updatedAt: '2026-08-17T11:00:00.000Z'
      },
      'card-sprint-3': {
        id: 'card-sprint-3',
        boardId: 'board-apex-sprint42',
        columnId: 'col-sprint-qa',
        title: 'Interactive API sandbox documentation playground',
        description: 'Embed live code playground with auto-generated cURL and TypeScript snippets.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[3]],
        assignees: [DEFAULT_USERS[1]],
        dueDate: '2026-08-23',
        checklist: [],
        comments: [],
        createdAt: '2026-08-16T15:00:00.000Z',
        updatedAt: '2026-08-19T14:00:00.000Z'
      },
      'card-sprint-4': {
        id: 'card-sprint-4',
        boardId: 'board-apex-sprint42',
        columnId: 'col-sprint-released',
        title: 'Self-hosted Docker Compose developer quickstart',
        description: 'Single command `docker compose up` to boot full mock Apex cloud environment locally.',
        priority: 'low',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[2]],
        dueDate: '2026-08-15',
        checklist: [],
        comments: [],
        createdAt: '2026-08-10T09:00:00.000Z',
        updatedAt: '2026-08-15T18:00:00.000Z'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Workspaces 2: Nova Fintech Inc (Separate Company / Tenant)
  // ---------------------------------------------------------------------------
  {
    id: 'board-nova-gateway',
    workspaceId: 'ws-nova-fintech',
    title: 'Core Payment Gateway Integration',
    description: 'ISO-8583 banking switch, Visa/Mastercard processing, and real-time fraud mitigation.',
    category: 'product',
    visibility: 'workspace',
    ownerId: 'user-5',
    memberIds: ['user-5', 'user-4', 'user-3', 'user-1'],
    teamId: 'team-fintech',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z',
    columns: [
      { id: 'col-nova-backlog', title: 'Regulatory Backlog', cardIds: ['card-nova-101'], colorAccent: '#64748b' },
      { id: 'col-nova-todo', title: 'To Do', cardIds: ['card-nova-102'], colorAccent: '#3b82f6' },
      { id: 'col-nova-progress', title: 'In Progress (Fintech)', cardIds: ['card-nova-103'], colorAccent: '#f59e0b' },
      { id: 'col-nova-done', title: 'Settled & Verified', cardIds: ['card-nova-104'], colorAccent: '#10b981' }
    ],
    cards: {
      'card-nova-101': {
        id: 'card-nova-101',
        boardId: 'board-nova-gateway',
        columnId: 'col-nova-backlog',
        title: 'PCI-DSS Level 1 tokenization vault audit',
        description: 'Quarterly pen-testing on hardware security modules (HSM) and cardholder data environment (CDE).',
        priority: 'urgent',
        labels: [DEFAULT_LABELS[5]],
        assignees: [DEFAULT_USERS[4]],
        dueDate: '2026-09-01',
        checklist: [
          { id: 'chk-n1', text: 'Engage external auditor (KPMG)', completed: true },
          { id: 'chk-n2', text: 'Rotate all HSM master keys', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-15T09:00:00.000Z',
        updatedAt: '2026-08-15T09:00:00.000Z'
      },
      'card-nova-102': {
        id: 'card-nova-102',
        boardId: 'board-nova-gateway',
        columnId: 'col-nova-todo',
        title: 'SEPA Instant Credit Transfer direct connector',
        description: 'Implement real-time EUR settlements under 10 seconds for European enterprise merchants.',
        priority: 'high',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[4], DEFAULT_USERS[3]],
        dueDate: '2026-08-29',
        checklist: [],
        comments: [],
        createdAt: '2026-08-16T11:00:00.000Z',
        updatedAt: '2026-08-16T11:00:00.000Z'
      },
      'card-nova-103': {
        id: 'card-nova-103',
        boardId: 'board-nova-gateway',
        columnId: 'col-nova-progress',
        title: 'AI Fraud scoring ML pipeline with sub-50ms inference',
        description: 'Score incoming merchant transactions against velocity models and known fraudulent device fingerprints.',
        priority: 'urgent',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[4], DEFAULT_USERS[0]],
        dueDate: '2026-08-25',
        coverColor: '#ec4899',
        checklist: [
          { id: 'chk-n3', text: 'Train XGBoost model on 10M historical transactions', completed: true },
          { id: 'chk-n4', text: 'Deploy ONNX runtime in banking gateway', completed: true },
          { id: 'chk-n5', text: 'External advisor review with Alex Morgan (Guest)', completed: false }
        ],
        comments: [
          {
            id: 'comm-n1',
            author: DEFAULT_USERS[0],
            text: 'I reviewed the ONNX engine memory footprint in Nova, looks rock solid for production.',
            createdAt: '2026-08-19T11:20:00.000Z'
          }
        ],
        createdAt: '2026-08-18T09:00:00.000Z',
        updatedAt: '2026-08-19T11:20:00.000Z'
      },
      'card-nova-104': {
        id: 'card-nova-104',
        boardId: 'board-nova-gateway',
        columnId: 'col-nova-done',
        title: 'Webhook retry policy with exponential backoff & jitter',
        description: 'Guarantees 99.999% webhook delivery to merchant endpoints during transient downtime.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[3]],
        dueDate: '2026-08-18',
        checklist: [],
        comments: [],
        createdAt: '2026-08-10T09:00:00.000Z',
        updatedAt: '2026-08-18T17:00:00.000Z'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Workspaces 3: Studio Pulse Creative (Design Agency / Independent Tenant)
  // ---------------------------------------------------------------------------
  {
    id: 'board-studio-branding',
    workspaceId: 'ws-studio-pulse',
    title: 'Global Brand Redesign & Design System',
    description: 'Design tokens, Figma typography scales, 3D icon renders, and brand guidelines.',
    category: 'design',
    visibility: 'workspace',
    ownerId: 'user-2',
    memberIds: ['user-2', 'user-1'],
    teamId: 'team-design',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z',
    columns: [
      { id: 'col-studio-brief', title: 'Creative Brief', cardIds: ['card-studio-1'], colorAccent: '#64748b' },
      { id: 'col-studio-concepts', title: 'Figma Concepts', cardIds: ['card-studio-2'], colorAccent: '#8b5cf6' },
      { id: 'col-studio-review', title: 'Client Review', cardIds: ['card-studio-3'], colorAccent: '#ec4899' },
      { id: 'col-studio-delivered', title: 'Approved & Delivered', cardIds: ['card-studio-4'], colorAccent: '#10b981' }
    ],
    cards: {
      'card-studio-1': {
        id: 'card-studio-1',
        boardId: 'board-studio-branding',
        columnId: 'col-studio-brief',
        title: 'Brand Archetype Discovery & Moodboard',
        description: 'Define luxury warm-neutral color palette and geometric modern typography scale.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[3]],
        assignees: [DEFAULT_USERS[1]],
        dueDate: '2026-09-05',
        checklist: [],
        comments: [],
        createdAt: '2026-08-15T09:00:00.000Z',
        updatedAt: '2026-08-15T09:00:00.000Z'
      },
      'card-studio-2': {
        id: 'card-studio-2',
        boardId: 'board-studio-branding',
        columnId: 'col-studio-concepts',
        title: 'Figma Auto-layout Design Token library',
        description: 'Build 40+ atomic components with accessible WCAG AA light and dark color modes.',
        priority: 'urgent',
        labels: [DEFAULT_LABELS[3]],
        assignees: [DEFAULT_USERS[1], DEFAULT_USERS[0]],
        dueDate: '2026-08-27',
        coverColor: '#8b5cf6',
        checklist: [
          { id: 'chk-st1', text: 'Button & input variants', completed: true },
          { id: 'chk-st2', text: 'Modal dialog & popover specs', completed: true },
          { id: 'chk-st3', text: 'Export JSON tokens for developers', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-17T08:30:00.000Z',
        updatedAt: '2026-08-17T08:30:00.000Z'
      },
      'card-studio-3': {
        id: 'card-studio-3',
        boardId: 'board-studio-branding',
        columnId: 'col-studio-review',
        title: 'Interactive 3D Spline brand mascot animation',
        description: 'Interactive cursor-following 3D hero illustration for landing page.',
        priority: 'high',
        labels: [DEFAULT_LABELS[3]],
        assignees: [DEFAULT_USERS[1]],
        dueDate: '2026-08-24',
        checklist: [],
        comments: [],
        createdAt: '2026-08-18T09:00:00.000Z',
        updatedAt: '2026-08-18T09:00:00.000Z'
      },
      'card-studio-4': {
        id: 'card-studio-4',
        boardId: 'board-studio-branding',
        columnId: 'col-studio-delivered',
        title: 'Brand Guidelines PDF & SVG Asset Kit (2026 Edition)',
        description: 'Complete vector logos, typography hierarchies, spacing rules, and usage dos & don\'ts.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[3]],
        assignees: [DEFAULT_USERS[1]],
        dueDate: '2026-08-18',
        coverColor: '#10b981',
        checklist: [],
        comments: [],
        createdAt: '2026-08-10T09:00:00.000Z',
        updatedAt: '2026-08-18T17:00:00.000Z'
      }
    }
  }
];
