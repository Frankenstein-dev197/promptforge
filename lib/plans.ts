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

import { PROMPT_LIBRARY } from "@/lib/prompt-library";

export const PROMPT_TEMPLATES = PROMPT_LIBRARY;
