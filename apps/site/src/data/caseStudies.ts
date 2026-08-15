export interface CaseStudy {
  id: string;
  title: string;
  summary: string;
  narrative: string[];
  tech: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'vue-to-react-migration',
    title: 'Leading a Vue → React migration',
    summary:
      'Identified the cost of running two frontend frameworks in parallel and drove the decision to consolidate fully on React.',
    narrative: [
      'The codebase had grown to run both Vue and React side by side, splitting frontend knowledge across the team and duplicating tooling, patterns, and review effort.',
      'I proposed consolidating on React, got buy-in, and led the migration as the main implementer — porting views, untangling shared state, and setting the conventions the codebase uses going forward, with the team contributing alongside me.',
      'The result is a single frontend stack: faster onboarding, one set of patterns to review against, and no more context-switching between two frameworks on the same feature.',
    ],
    tech: ['React', 'Vue', 'JavaScript', 'TypeScript'],
  },
  {
    id: 'jira-to-pr-agent',
    title: 'AI agent: Jira ticket → pull request',
    summary:
      'An internal tool that turns a triaged ticket into a review-ready PR, cutting the ritual overhead out of small-to-medium tasks.',
    narrative: [
      'Small-to-medium tickets lose a disproportionate amount of time to process — triage, assignment, implementation, then the PR itself. The goal is to compress that into effectively one click.',
      'A human assigns the bot to a Jira ticket; it triages and comments on the ticket, implements the change, and opens a complete pull request. Standard CI (tests, linting) runs on the PR like any other, and the bot keeps responding to review comments until a human approves and merges.',
      'Designed and approved internally, then built and shipped — it now turns assigned tickets into review-ready PRs in day-to-day use.',
    ],
    tech: ['Claude', 'GitHub Actions', 'Jira API', 'Node.js'],
  },
  {
    id: 'ai-article-pipeline',
    title: 'Automated AI article generation & publishing',
    summary:
      'A daily pipeline that drafts articles and images, routes them through human review on Slack, and publishes automatically once approved.',
    narrative: [
      'Built for the marketing team to keep a steady stream of published articles without a manual writing bottleneck.',
      'Claude generates the article text and Gemini generates the accompanying images on a daily schedule; both are posted to Slack for a quick human review pass.',
      'Once approved, the pipeline publishes automatically — in production and running on schedule.',
    ],
    tech: ['Claude', 'Gemini', 'Slack API', 'Node.js'],
  },
];
