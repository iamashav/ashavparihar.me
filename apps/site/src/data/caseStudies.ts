export interface CaseStudy {
  id: string;
  title: string;
  summary: string;
  tech: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'vue-to-react-migration',
    title: 'Consolidating a 200+ component frontend onto React',
    summary:
      'The team already wanted off a split Vue and React stack. I started the migration and did most of the work — 200+ components plus the stores, styles and design layer underneath them — leaning on LLM tooling to get through it faster than a job that size usually goes.',
    tech: ['React', 'Vue', 'TypeScript', 'LLM tooling'],
  },
  {
    id: 'jira-to-pr-agent',
    title: 'AI agent: Jira ticket → pull request',
    summary:
      'An internal agent that takes an assigned ticket and comes back with a review-ready PR — then keeps working through review comments until a human merges it. No special path: same CI, same review, same merge gate as any engineer.',
    tech: ['Claude', 'GitHub Actions', 'Jira API', 'Node.js'],
  },
  {
    id: 'ai-article-pipeline',
    title: 'A multi-model publishing pipeline with a human gate',
    summary:
      'A scheduled pipeline that decides the topic, writes the article and generates the images that go with it, then lands the whole thing in Slack for one human yes before anything publishes.',
    tech: ['Claude', 'Gemini', 'Slack API', 'Node.js'],
  },
];
