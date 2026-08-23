import type { Board, Assignee, Label, AutomationRule } from '../types/kanban';

export const DEFAULT_USERS: Assignee[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'alex.j@company.com',
    role: 'Product Lead'
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    email: 'sarah.c@company.com',
    role: 'UX/UI Designer'
  },
  {
    id: 'user-3',
    name: 'Michael Miller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'michael.m@company.com',
    role: 'Senior Engineer'
  },
  {
    id: 'user-4',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'elena.r@company.com',
    role: 'Growth Marketing'
  },
  {
    id: 'user-5',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'david.k@company.com',
    role: 'Operations Lead'
  }
];

export const DEFAULT_LABELS: Label[] = [
  { id: 'lbl-feature', name: 'Feature', color: '#2563eb', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { id: 'lbl-design', name: 'Design & UI', color: '#7c3aed', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { id: 'lbl-marketing', name: 'Marketing', color: '#db2777', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { id: 'lbl-urgent', name: 'Urgent Bug', color: '#dc2626', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  { id: 'lbl-research', name: 'Research', color: '#d97706', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { id: 'lbl-ops', name: 'Operations', color: '#059669', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' }
];

export const DEFAULT_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-1',
    title: 'Auto-Complete Checklist Check',
    description: 'When all items in a card\'s checklist are checked, suggest or automatically mark card as ready for review.',
    triggerEvent: 'checklist_completed',
    actionSummary: 'Add completed status badge',
    enabled: true
  },
  {
    id: 'auto-2',
    title: 'Done Column Archival Notification',
    description: 'When a card is dragged to the "Completed" list, set completion timestamp and notify assigned team members.',
    triggerEvent: 'card_moved',
    actionSummary: 'Record completion date',
    enabled: true
  },
  {
    id: 'auto-3',
    title: 'High Priority Alert',
    description: 'Highlight cards flagged with Urgent or High priority when their due date is within 24 hours.',
    triggerEvent: 'due_date_reached',
    actionSummary: 'Add urgent highlight badge',
    enabled: true
  }
];

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-product-launch',
    title: '🚀 Q3 Product Launch & Growth',
    description: 'Cross-functional sprint board for the upcoming major product launch, design assets, and marketing roll-out.',
    category: 'product',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z',
    columns: [
      { id: 'col-backlog', title: 'Ideas & Backlog', cardIds: ['card-101', 'card-102'], colorAccent: '#64748b' },
      { id: 'col-todo', title: 'To Do (Ready)', cardIds: ['card-103', 'card-104'], colorAccent: '#3b82f6' },
      { id: 'col-in-progress', title: 'In Progress', cardIds: ['card-105', 'card-106'], limit: 4, colorAccent: '#f59e0b' },
      { id: 'col-review', title: 'Review & QA', cardIds: ['card-107'], colorAccent: '#8b5cf6' },
      { id: 'col-done', title: 'Completed 🎉', cardIds: ['card-108', 'card-109'], colorAccent: '#10b981' }
    ],
    cards: {
      'card-101': {
        id: 'card-101',
        columnId: 'col-backlog',
        title: 'Conduct customer feedback survey on onboarding flow',
        description: 'Interview 15 active users to gather friction points in the sign-up and initial setup wizard.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[4], DEFAULT_LABELS[1]], // Research, Design
        assignees: [DEFAULT_USERS[1]],
        dueDate: '2026-08-30',
        estimatedHours: 12,
        coverColor: '#0284c7',
        checklist: [
          { id: 'chk-1', text: 'Draft survey questions with Product Lead', completed: true },
          { id: 'chk-2', text: 'Send email invites to selected cohort', completed: true },
          { id: 'chk-3', text: 'Synthesize findings into Notion report', completed: false }
        ],
        comments: [
          {
            id: 'comm-1',
            author: DEFAULT_USERS[1],
            text: 'First 5 interview slots are booked for Tuesday afternoon.',
            createdAt: '2026-08-19T10:15:00.000Z'
          }
        ],
        createdAt: '2026-08-15T09:00:00.000Z',
        updatedAt: '2026-08-19T10:15:00.000Z'
      },
      'card-102': {
        id: 'card-102',
        columnId: 'col-backlog',
        title: 'Dark mode design audit and color token standardization',
        description: 'Verify WCAG AA contrast compliance across all forms, tables, and modal dialogs.',
        priority: 'low',
        labels: [DEFAULT_LABELS[1]],
        assignees: [DEFAULT_USERS[1]],
        dueDate: '2026-09-05',
        estimatedHours: 8,
        checklist: [
          { id: 'chk-4', text: 'Audit text contrast in dark theme', completed: false },
          { id: 'chk-5', text: 'Export new CSS variables to Figma tokens', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-16T11:00:00.000Z',
        updatedAt: '2026-08-16T11:00:00.000Z'
      },
      'card-103': {
        id: 'card-103',
        columnId: 'col-todo',
        title: 'Redesign pricing table with interactive currency converter',
        description: 'Update annual vs monthly billing toggle with instant discount badge calculation.',
        priority: 'high',
        labels: [DEFAULT_LABELS[0], DEFAULT_LABELS[1]],
        assignees: [DEFAULT_USERS[0], DEFAULT_USERS[2]],
        dueDate: '2026-08-25',
        estimatedHours: 16,
        coverColor: '#7c3aed',
        checklist: [
          { id: 'chk-6', text: 'Figma component auto-layout approval', completed: true },
          { id: 'chk-7', text: 'Implement responsive pricing card components', completed: false },
          { id: 'chk-8', text: 'Add Stripe checkout redirection link', completed: false }
        ],
        comments: [
          {
            id: 'comm-2',
            author: DEFAULT_USERS[0],
            text: 'Let us make sure the 20% annual discount pill is clearly highlighted.',
            createdAt: '2026-08-18T14:30:00.000Z'
          }
        ],
        createdAt: '2026-08-17T08:30:00.000Z',
        updatedAt: '2026-08-18T14:30:00.000Z'
      },
      'card-104': {
        id: 'card-104',
        columnId: 'col-todo',
        title: 'Prepare press kit and influencer outreach package',
        description: 'Coordinate with marketing team on high-res media assets, founder bio, and demo video embeds.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[2]],
        assignees: [DEFAULT_USERS[3]],
        dueDate: '2026-08-28',
        estimatedHours: 10,
        checklist: [
          { id: 'chk-9', text: 'Gather screenshot assets (1920x1080)', completed: true },
          { id: 'chk-10', text: 'Draft 1-page press release document', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-17T13:00:00.000Z',
        updatedAt: '2026-08-17T13:00:00.000Z'
      },
      'card-105': {
        id: 'card-105',
        columnId: 'col-in-progress',
        title: 'Multi-factor authentication (MFA) with TOTP authenticator',
        description: 'Add QR code scanning and backup recovery codes to the security settings tab.',
        priority: 'urgent',
        labels: [DEFAULT_LABELS[0], DEFAULT_LABELS[3]],
        assignees: [DEFAULT_USERS[2]],
        dueDate: '2026-08-22',
        estimatedHours: 20,
        coverColor: '#dc2626',
        checklist: [
          { id: 'chk-11', text: 'Generate secret key & QR canvas', completed: true },
          { id: 'chk-12', text: 'Verify 6-digit code with time window drift', completed: true },
          { id: 'chk-13', text: 'Generate printable backup codes', completed: false }
        ],
        comments: [
          {
            id: 'comm-3',
            author: DEFAULT_USERS[2],
            text: 'TOTP verification endpoint is passing all test cases. Finishing up the modal UI.',
            createdAt: '2026-08-20T07:20:00.000Z'
          }
        ],
        createdAt: '2026-08-18T09:00:00.000Z',
        updatedAt: '2026-08-20T07:20:00.000Z'
      },
      'card-106': {
        id: 'card-106',
        columnId: 'col-in-progress',
        title: 'Automated weekly digest email templates',
        description: 'Build responsive HTML email layouts for user project stats and upcoming deadlines.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[2], DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[3], DEFAULT_USERS[2]],
        dueDate: '2026-08-24',
        estimatedHours: 14,
        checklist: [
          { id: 'chk-14', text: 'Design MJML template layout', completed: true },
          { id: 'chk-15', text: 'Test rendering in Gmail, Outlook, Apple Mail', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-18T10:00:00.000Z',
        updatedAt: '2026-08-18T10:00:00.000Z'
      },
      'card-107': {
        id: 'card-107',
        columnId: 'col-review',
        title: 'Real-time card activity feed and audit trail',
        description: 'Record timestamps, user avatars, and changes for column movements and edits.',
        priority: 'high',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[0], DEFAULT_USERS[2]],
        dueDate: '2026-08-21',
        estimatedHours: 18,
        coverColor: '#059669',
        checklist: [
          { id: 'chk-16', text: 'Create event stream dispatcher', completed: true },
          { id: 'chk-17', text: 'Add activity timeline component in card modal', completed: true },
          { id: 'chk-18', text: 'E2E testing across multi-tab sessions', completed: true }
        ],
        comments: [
          {
            id: 'comm-4',
            author: DEFAULT_USERS[0],
            text: 'Tested on Safari and Chrome, animations look crisp!',
            createdAt: '2026-08-19T16:45:00.000Z'
          }
        ],
        createdAt: '2026-08-16T14:00:00.000Z',
        updatedAt: '2026-08-19T16:45:00.000Z'
      },
      'card-108': {
        id: 'card-108',
        columnId: 'col-done',
        title: 'Search and multi-filter engine (Labels, Assignee, Priority)',
        description: 'Instant client-side filter with debounce and URL state sync.',
        priority: 'high',
        labels: [DEFAULT_LABELS[0]],
        assignees: [DEFAULT_USERS[2]],
        dueDate: '2026-08-19',
        estimatedHours: 10,
        coverColor: '#2563eb',
        checklist: [
          { id: 'chk-19', text: 'Build filter dropdown menus', completed: true },
          { id: 'chk-20', text: 'Add keyboard shortcut (Ctrl/Cmd + K)', completed: true }
        ],
        comments: [],
        createdAt: '2026-08-14T09:00:00.000Z',
        updatedAt: '2026-08-19T12:00:00.000Z'
      },
      'card-109': {
        id: 'card-109',
        columnId: 'col-done',
        title: 'New Workspace Member Onboarding Checklist',
        description: 'Welcome guide with interactive tour tooltips and sample project boards.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[5]],
        assignees: [DEFAULT_USERS[4]],
        dueDate: '2026-08-18',
        estimatedHours: 8,
        checklist: [
          { id: 'chk-21', text: 'Create welcome modal dialog', completed: true },
          { id: 'chk-22', text: 'Add sample template picker', completed: true }
        ],
        comments: [],
        createdAt: '2026-08-13T10:00:00.000Z',
        updatedAt: '2026-08-18T17:00:00.000Z'
      }
    }
  },
  {
    id: 'board-marketing-campaign',
    title: '📣 Global Marketing & Content Calendar',
    description: 'Campaign tracking, editorial calendar, social promotions, and newsletter editions.',
    category: 'marketing',
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z',
    columns: [
      { id: 'col-mkt-ideas', title: 'Content Ideas', cardIds: ['card-201'], colorAccent: '#ec4899' },
      { id: 'col-mkt-writing', title: 'Drafting & Writing', cardIds: ['card-202'], colorAccent: '#f59e0b' },
      { id: 'col-mkt-review', title: 'Design & Review', cardIds: ['card-203'], colorAccent: '#8b5cf6' },
      { id: 'col-mkt-published', title: 'Published & Live', cardIds: ['card-204'], colorAccent: '#10b981' }
    ],
    cards: {
      'card-201': {
        id: 'card-201',
        columnId: 'col-mkt-ideas',
        title: 'How to scale high-velocity teams using Kanban (Blog Post)',
        description: 'In-depth thought leadership article highlighting WIP limits and cycle time metrics.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[2], DEFAULT_LABELS[4]],
        assignees: [DEFAULT_USERS[3]],
        dueDate: '2026-09-02',
        checklist: [
          { id: 'chk-31', text: 'Outline 5 key takeaways', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-18T08:00:00.000Z',
        updatedAt: '2026-08-18T08:00:00.000Z'
      },
      'card-202': {
        id: 'card-202',
        columnId: 'col-mkt-writing',
        title: 'Monthly Newsletter Edition #48: Productivity Special',
        description: 'Feature community highlights, product release notes, and top productivity hacks.',
        priority: 'high',
        labels: [DEFAULT_LABELS[2]],
        assignees: [DEFAULT_USERS[3]],
        dueDate: '2026-08-27',
        checklist: [
          { id: 'chk-32', text: 'Curate top 3 featured articles', completed: true },
          { id: 'chk-33', text: 'Write sponsor spotlight snippet', completed: false }
        ],
        comments: [],
        createdAt: '2026-08-17T11:00:00.000Z',
        updatedAt: '2026-08-17T11:00:00.000Z'
      },
      'card-203': {
        id: 'card-203',
        columnId: 'col-mkt-review',
        title: 'Infographic banner assets for Product Hunt launch day',
        description: 'Produce high-converting 1200x630px social cards and GIF preview animations.',
        priority: 'urgent',
        labels: [DEFAULT_LABELS[1], DEFAULT_LABELS[2]],
        assignees: [DEFAULT_USERS[1], DEFAULT_USERS[3]],
        dueDate: '2026-08-23',
        coverColor: '#db2777',
        checklist: [
          { id: 'chk-34', text: 'Render animated UI walkthrough GIF', completed: true },
          { id: 'chk-35', text: 'Export PNG banner variants', completed: true }
        ],
        comments: [],
        createdAt: '2026-08-16T15:00:00.000Z',
        updatedAt: '2026-08-19T14:00:00.000Z'
      },
      'card-204': {
        id: 'card-204',
        columnId: 'col-mkt-published',
        title: 'Customer Case Study: How Acme Corp saved 15 hrs/week',
        description: 'Full customer interview, metrics chart, and downloadable PDF one-pager.',
        priority: 'medium',
        labels: [DEFAULT_LABELS[2]],
        assignees: [DEFAULT_USERS[3]],
        dueDate: '2026-08-15',
        checklist: [
          { id: 'chk-36', text: 'Publish on website blog', completed: true },
          { id: 'chk-37', text: 'Share on LinkedIn and Twitter', completed: true }
        ],
        comments: [],
        createdAt: '2026-08-10T09:00:00.000Z',
        updatedAt: '2026-08-15T18:00:00.000Z'
      }
    }
  }
];
