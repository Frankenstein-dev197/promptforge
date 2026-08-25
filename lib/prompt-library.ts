export type PromptLibraryTemplate = {
  slug: string;
  category: string;
  title: string;
  description: string;
  content: string;
  model: string;
  tags: string[];
};

export const PROMPT_LIBRARY: PromptLibraryTemplate[] = [
  {
    slug: "code-review",
    category: "Engineering",
    title: "Code reviewer",
    description: "Review code for correctness, security, and maintainability.",
    content:
      "You are a senior {{language}} engineer performing a rigorous code review.\n\nContext:\n{{context}}\n\nCode:\n```{{language}}\n{{code}}\n```\n\nIdentify only verifiable correctness bugs, security risks, reliability issues, performance problems, and maintainability concerns. For each finding, provide severity (critical, high, medium, low), exact location, why it matters, and a concrete fix. Finish with the three most important next actions.",
    model: "gpt-4o",
    tags: ["engineering", "code-review", "security"],
  },
  {
    slug: "test-plan",
    category: "Engineering",
    title: "Test plan generator",
    description: "Turn product requirements into a practical test plan.",
    content:
      "You are a test architect. Design a deterministic test plan for this feature.\n\nFeature:\n{{feature}}\n\nRequirements:\n{{requirements}}\n\nTechnology stack:\n{{stack}}\n\nReturn a table with test id, scenario, setup, action, expected result, priority, and test type. Cover the happy path, validation errors, authorization boundaries, empty states, retries, concurrency, and regression risks. Identify which scenarios require integration or end-to-end coverage.",
    model: "gpt-4o",
    tags: ["engineering", "testing", "quality"],
  },
  {
    slug: "sql-generator",
    category: "Data",
    title: "SQL query generator",
    description: "Write a safe read-only query from a schema and a question.",
    content:
      "You are a database engineer. Write one safe, read-only {{dialect}} query answering the question below.\n\nSchema:\n{{schema}}\n\nQuestion:\n{{question}}\n\nUse only tables and columns present in the schema. Never modify data or structure. Avoid SELECT * and qualify ambiguous columns. Return the SQL query first, followed by concise assumptions and required parameters.",
    model: "gpt-4o",
    tags: ["data", "sql", "analytics"],
  },
  {
    slug: "support-classifier",
    category: "Support",
    title: "Support ticket classifier",
    description: "Classify and route support tickets with human-review safeguards.",
    content:
      "Classify this customer-support ticket using only the allowed categories.\n\nAllowed categories:\n{{known_categories}}\n\nTicket:\n{{ticket}}\n\nReturn valid JSON with exactly these fields: category, priority (low | medium | high | urgent), suggested_team, summary, and requires_human_review. Set requires_human_review to true for security incidents, payment disputes, legal threats, vulnerable customers, or insufficient information.",
    model: "gpt-4o-mini",
    tags: ["support", "classification", "automation"],
  },
  {
    slug: "meeting-summary",
    category: "Productivity",
    title: "Meeting summarizer",
    description: "Convert a transcript into decisions, actions, and risks.",
    content:
      "Summarize the following meeting transcript for {{audience}}.\n\nTranscript:\n{{transcript}}\n\nProduce an executive summary, decisions made, action items with owner and due date, open questions, and risks. Do not attribute statements that are not supported by the transcript. Mark unknown owners or dates as not specified.",
    model: "claude-3-5-sonnet",
    tags: ["productivity", "summary", "meetings"],
  },
  {
    slug: "product-copy",
    category: "Marketing",
    title: "Product description generator",
    description: "Create concise product copy from verified benefits.",
    content:
      "You are an expert product copywriter. Write a concise product description for {{product}}.\n\nTarget audience:\n{{audience}}\n\nVerified benefits:\n{{benefits}}\n\nTone:\n{{tone}}\n\nReturn a title, a one-sentence value proposition, three benefit bullets, and a short call to action. Use only verified benefits and do not make unsupported medical, financial, legal, or performance claims.",
    model: "gpt-4o",
    tags: ["marketing", "copywriting", "ecommerce"],
  },
  {
    slug: "prompt-optimizer",
    category: "Prompt engineering",
    title: "Prompt optimizer",
    description: "Improve a prompt while preserving its business intent.",
    content:
      "Improve the following prompt for {{target_model}} while preserving its business intent.\n\nOriginal prompt:\n{{original_prompt}}\n\nSuccess criteria:\n{{success_criteria}}\n\nReturn the improved prompt, its variables, its output format, the main changes and why they improve reliability, and two adversarial test inputs. Do not add requirements that are absent from the original prompt or success criteria. Prefer explicit constraints, clear roles, unambiguous variables, and a testable output contract.",
    model: "gpt-4o",
    tags: ["prompt-engineering", "optimization", "quality"],
  },
];

export function getPromptLibraryTemplate(slug: string) {
  return PROMPT_LIBRARY.find((template) => template.slug === slug);
}
