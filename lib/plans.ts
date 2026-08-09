import type { Plan } from "@prisma/client";

export type PlanConfig = {
  id: Plan;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  limits: {
    maxPrompts: number;
    maxCollections: number;
    maxRunsPerMonth: number;
    aiOptimize: boolean;
    versionHistory: boolean;
    teamSeats: number;
  };
  highlight?: boolean;
  cta: string;
};

export const PLANS: PlanConfig[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    description: "For individuals exploring prompt engineering.",
    features: [
      "Up to 25 prompts",
      "3 collections",
      "50 runs / month",
      "Version history",
      "Basic templates",
    ],
    limits: {
      maxPrompts: 25,
      maxCollections: 3,
      maxRunsPerMonth: 50,
      aiOptimize: false,
      versionHistory: true,
      teamSeats: 1,
    },
    cta: "Start for free",
  },
  {
    id: "PRO",
    name: "Pro",
    price: 19,
    priceLabel: "$19",
    description: "For professionals shipping AI features.",
    features: [
      "Up to 500 prompts",
      "Unlimited collections",
      "5,000 runs / month",
      "AI prompt optimizer",
      "Full version history",
      "Export & API access",
    ],
    limits: {
      maxPrompts: 500,
      maxCollections: 100,
      maxRunsPerMonth: 5000,
      aiOptimize: true,
      versionHistory: true,
      teamSeats: 1,
    },
    highlight: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "TEAM",
    name: "Team",
    price: 49,
    priceLabel: "$49",
    description: "For teams collaborating on prompts.",
    features: [
      "Unlimited prompts",
      "Unlimited collections",
      "25,000 runs / month",
      "AI prompt optimizer",
      "Shared workspaces",
      "5 team seats",
      "Priority support",
    ],
    limits: {
      maxPrompts: 100000,
      maxCollections: 100000,
      maxRunsPerMonth: 25000,
      aiOptimize: true,
      versionHistory: true,
      teamSeats: 5,
    },
    cta: "Start team trial",
  },
];

export function getPlanConfig(plan: Plan): PlanConfig {
  return PLANS.find((p) => p.id === plan) ?? PLANS[0];
}

export const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google" },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta" },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral" },
];

export const COLLECTION_COLORS = [
  "zinc",
  "indigo",
  "violet",
  "rose",
  "amber",
  "emerald",
  "sky",
  "fuchsia",
] as const;

export const PROMPT_TEMPLATES = [
  {
    title: "Product description generator",
    description: "Generate compelling e-commerce product copy.",
    content:
      "You are an expert copywriter. Write a product description for {{product}}.\n\nTarget audience: {{audience}}\nTone: {{tone}}\nKey benefits: {{benefits}}\n\nLength: 3 short paragraphs. End with a strong CTA.",
    model: "gpt-4o",
    tags: ["marketing", "copywriting"],
  },
  {
    title: "Code reviewer",
    description: "Review code for bugs and improvements.",
    content:
      "Review the following {{language}} code. Identify bugs, security issues, and suggest improvements.\n\nCode:\n```\n{{code}}\n```\n\nProvide a concise summary, then a numbered list of findings with severity (low/medium/high).",
    model: "gpt-4o",
    tags: ["engineering", "code-review"],
  },
  {
    title: "Support ticket classifier",
    description: "Classify and route customer support tickets.",
    content:
      "Classify the following support ticket.\n\nTicket: {{ticket}}\n\nReturn JSON with fields: category (one of billing, technical, feature-request, complaint), priority (low/medium/high), suggested_team, and a one-sentence summary.",
    model: "gpt-4o-mini",
    tags: ["support", "classification"],
  },
  {
    title: "Meeting summarizer",
    description: "Summarize meeting transcripts into action items.",
    content:
      "Summarize the following meeting transcript. Extract: key decisions, action items (with owners), and open questions.\n\nTranscript:\n{{transcript}}",
    model: "claude-3-5-sonnet",
    tags: ["productivity", "summary"],
  },
  {
    title: "SQL query generator",
    description: "Turn natural language into SQL.",
    content:
      "Given the following database schema, write a SQL query that answers the user's question.\n\nSchema:\n{{schema}}\n\nQuestion: {{question}}\n\nReturn only the SQL query, no explanation.",
    model: "gpt-4o",
    tags: ["data", "sql"],
  },
];
