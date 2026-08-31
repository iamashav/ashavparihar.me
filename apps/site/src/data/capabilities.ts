import {
  Boxes,
  Braces,
  Component,
  Database,
  Network,
  Palette,
  Server,
  Share2,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Subsystem = 'UI_RENDERING' | 'CORE_LOGIC' | 'DATA_INFRA';

export interface Capability {
  id: string;
  ref: string;
  subsystem: Subsystem;
  title: string;
  summary: string;
  icon: LucideIcon;
  tags: string[];
}

export const SUBSYSTEMS: { id: Subsystem | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'SYS_ALL' },
  { id: 'UI_RENDERING', label: 'UI_RENDERING' },
  { id: 'CORE_LOGIC', label: 'CORE_LOGIC' },
  { id: 'DATA_INFRA', label: 'DATA_INFRA' },
];

export const capabilities: Capability[] = [
  {
    id: 'advanced-css',
    ref: '0x0A1',
    subsystem: 'UI_RENDERING',
    title: 'Advanced CSS',
    summary:
      'Layout systems, design tokens and the kind of type and spacing discipline that survives a redesign.',
    icon: Palette,
    tags: ['--tailwind', '--sass', '--css-grid', '--design-tokens'],
  },
  {
    id: 'webgl-three',
    ref: '0x0A2',
    subsystem: 'UI_RENDERING',
    title: 'WebGL / Three.js',
    summary: 'Real-time 3D and shader work rendered on the GPU inside the browser.',
    icon: Boxes,
    tags: ['--three-js', '--webgl', '--shaders'],
  },
  {
    id: 'motion',
    ref: '0x0A3',
    subsystem: 'UI_RENDERING',
    title: 'Framer Motion',
    summary:
      'Interface motion that carries meaning — spring physics, scroll choreography, canvas simulation.',
    icon: Waves,
    tags: ['--framer-motion', '--lenis', '--canvas-2d'],
  },
  {
    id: 'react',
    ref: '0x0B1',
    subsystem: 'CORE_LOGIC',
    title: 'React',
    summary:
      'Production component architecture at scale, including a 200+ component consolidation off Vue.',
    icon: Component,
    tags: ['--react', '--hooks', '--vue', '--vite'],
  },
  {
    id: 'typescript',
    ref: '0x0B2',
    subsystem: 'CORE_LOGIC',
    title: 'TypeScript',
    summary: 'Types that model reality, so the compiler catches what review would otherwise miss.',
    icon: Braces,
    tags: ['--typescript', '--generics', '--strict-mode'],
  },
  {
    id: 'state',
    ref: '0x0B3',
    subsystem: 'CORE_LOGIC',
    title: 'State Management',
    summary: 'Predictable data flow across large surfaces, and knowing when a store is overkill.',
    icon: Share2,
    tags: ['--redux', '--mobx', '--context-api'],
  },
  {
    id: 'node',
    ref: '0x0C1',
    subsystem: 'DATA_INFRA',
    title: 'Node.js',
    summary: 'The services behind the interface, plus the Python tooling that automates the rest.',
    icon: Server,
    tags: ['--node-js', '--python', '--docker'],
  },
  {
    id: 'apis',
    ref: '0x0C2',
    subsystem: 'DATA_INFRA',
    title: 'REST / GraphQL',
    summary: 'API design and integration, including LLM APIs and agent tooling in production.',
    icon: Network,
    tags: ['--rest', '--graphql', '--llm-apis', '--mcp'],
  },
  {
    id: 'databases',
    ref: '0x0C3',
    subsystem: 'DATA_INFRA',
    title: 'Databases',
    summary: 'Relational and document stores, schema design, and the queries that keep them fast.',
    icon: Database,
    tags: ['--postgresql', '--firebase'],
  },
];
