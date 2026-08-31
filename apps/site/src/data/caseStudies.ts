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
    title: 'Consolidating a 200+ component frontend onto React',
    summary:
      'Called out the cost of running two frontend frameworks in parallel, won the argument, and drove the consolidation end to end — 200+ components and the whole design layer underneath them.',
    narrative: [
      'The product had grown to run Vue and React side by side. Every feature meant picking a side, every review needed someone fluent in the right half, and the tooling, patterns, and design primitives were maintained twice. It was a tax nobody had put a number on, and it compounded with each release.',
      'I made the case for consolidating on React and got buy-in for work that ships no visible features — then led it. The scope was the whole system, not just the view layer: 200+ components plus the styles, design system, icons, and stores underneath them. I drove it with LLM tooling rather than by hand, and sequenced it so both frameworks kept running side by side and feature delivery never stopped.',
      'The result is one stack, one set of conventions, and one thing to onboard into. It also taught me where agents genuinely hold up on large mechanical work and where they need a human steering — which is what led directly to the two projects below.',
    ],
    tech: ['React', 'Vue', 'TypeScript', 'LLM tooling'],
  },
  {
    id: 'jira-to-pr-agent',
    title: 'AI agent: Jira ticket → pull request',
    summary:
      'An internal agent that takes an assigned ticket and comes back with a review-ready PR — then keeps working through review comments until a human merges it.',
    narrative: [
      'Small-to-medium tickets lose most of their time to process rather than code: triage, assignment, context-loading, implementation, then opening the PR. The goal was to compress that whole path down to assigning a ticket.',
      'A human assigns the bot in Jira; it triages, comments back on the ticket, implements the change, and opens a complete pull request. The design decision that mattered was refusing to give it a special path — it goes through the same CI, the same review, and the same merge gate as any engineer, so nothing lands unreviewed. It also stays in the loop after the PR opens, responding to review comments rather than dumping code and walking away.',
      'Shipped and in day-to-day use, turning assigned tickets into review-ready PRs.',
    ],
    tech: ['Claude', 'GitHub Actions', 'Jira API', 'Node.js'],
  },
  {
    id: 'ai-article-pipeline',
    title: 'A multi-model publishing pipeline with a human gate',
    summary:
      'Two models, one review step, and a scheduled pipeline that takes marketing content from draft to published without a writing bottleneck.',
    narrative: [
      'Marketing needed a steady publishing cadence and was bottlenecked on drafting. The trap with automating that is obvious — nobody wants unreviewed machine copy going out under the company name.',
      'So the pipeline orchestrates two models against each other and puts a person at the gate: Claude drafts the article, Gemini generates the accompanying imagery, and both land in Slack as a single reviewable unit on a daily schedule. Approval in Slack is what triggers publishing — the automation handles everything except the judgment call.',
      'It runs on schedule in production, and the human review step is the reason it can be trusted to.',
    ],
    tech: ['Claude', 'Gemini', 'Slack API', 'Node.js'],
  },
];
