import { PrismaClient, Plan, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PROMPT_LIBRARY } from "@/lib/prompt-library";
import { parseVariables } from "@/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPass = await bcrypt.hash("Admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@promptforge.dev" },
    update: {},
    create: {
      email: "admin@promptforge.dev",
      passwordHash: adminPass,
      name: "Ada Admin",
      role: Role.ADMIN,
      plan: Plan.TEAM,
      onboardingDone: true,
      jobRole: "Founder",
      useCase: "Managing AI products",
    },
  });

  // Demo user
  const demoPass = await bcrypt.hash("Demo1234", 10);
  const demo = await prisma.user.upsert({
    where: { email: "demo@promptforge.dev" },
    update: {},
    create: {
      email: "demo@promptforge.dev",
      passwordHash: demoPass,
      name: "Devon Demo",
      role: Role.USER,
      plan: Plan.PRO,
      onboardingDone: true,
      jobRole: "Software Engineer",
      useCase: "Building AI features",
    },
  });

  // Free user
  const freePass = await bcrypt.hash("Free1234", 10);
  const free = await prisma.user.upsert({
    where: { email: "free@promptforge.dev" },
    update: {},
    create: {
      email: "free@promptforge.dev",
      passwordHash: freePass,
      name: "Frank Free",
      role: Role.USER,
      plan: Plan.FREE,
      onboardingDone: true,
      jobRole: "Student",
      useCase: "Learning prompt engineering",
    },
  });

  // Global prompt library
  for (const [index, template] of PROMPT_LIBRARY.entries()) {
    await prisma.promptTemplate.upsert({
      where: { slug: template.slug },
      update: {
        category: template.category,
        title: template.title,
        description: template.description,
        content: template.content,
        model: template.model,
        variables: JSON.stringify(parseVariables(template.content)),
        tags: JSON.stringify(template.tags),
        featured: index < 4,
      },
      create: {
        slug: template.slug,
        category: template.category,
        title: template.title,
        description: template.description,
        content: template.content,
        model: template.model,
        variables: JSON.stringify(parseVariables(template.content)),
        tags: JSON.stringify(template.tags),
        featured: index < 4,
      },
    });
  }

  // Collections for demo user
  const marketing = await prisma.collection.create({
    data: {
      userId: demo.id,
      name: "Marketing",
      description: "Prompts for copywriting and content",
      color: "rose",
    },
  });
  const engineering = await prisma.collection.create({
    data: {
      userId: demo.id,
      name: "Engineering",
      description: "Code and technical prompts",
      color: "indigo",
    },
  });
  const support = await prisma.collection.create({
    data: {
      userId: demo.id,
      name: "Support",
      description: "Customer support automation",
      color: "emerald",
    },
  });

  // Sample prompts (with variables computed + initial versions)
  const p1 = await prisma.prompt.create({
    data: {
      userId: demo.id,
      collectionId: marketing.id,
      title: "Product description generator",
      description: "Generate compelling e-commerce product copy.",
      content:
        "You are an expert copywriter. Write a product description for {{product}}.\n\nTarget audience: {{audience}}\nTone: {{tone}}\nKey benefits: {{benefits}}\n\nLength: 3 short paragraphs. End with a strong CTA.",
      model: "gpt-4o",
      tags: '["marketing","copywriting"]',
      isStarred: true,
      variables: JSON.stringify(["product", "audience", "tone", "benefits"]),
    },
  });
  await prisma.promptVersion.create({ data: { promptId: p1.id, content: p1.content, version: 1, note: "Initial version" } });
  const p2 = await prisma.prompt.create({
    data: {
      userId: demo.id,
      collectionId: engineering.id,
      title: "Code reviewer",
      description: "Review code for bugs and improvements.",
      content:
        "Review the following {{language}} code. Identify bugs, security issues, and suggest improvements.\n\nCode:\n```\n{{code}}\n```\n\nProvide a concise summary, then a numbered list of findings with severity (low/medium/high).",
      model: "gpt-4o",
      tags: '["engineering","code-review"]',
      variables: JSON.stringify(["language", "code"]),
    },
  });
  await prisma.promptVersion.create({ data: { promptId: p2.id, content: p2.content, version: 1, note: "Initial version" } });
  const p3 = await prisma.prompt.create({
    data: {
      userId: demo.id,
      collectionId: support.id,
      title: "Support ticket classifier",
      description: "Classify and route customer support tickets.",
      content:
        "Classify the following support ticket.\n\nTicket: {{ticket}}\n\nReturn JSON with fields: category (billing|technical|feature-request|complaint), priority (low|medium|high), suggested_team, and a one-sentence summary.",
      model: "gpt-4o-mini",
      tags: '["support","classification"]',
      variables: JSON.stringify(["ticket"]),
    },
  });
  await prisma.promptVersion.create({ data: { promptId: p3.id, content: p3.content, version: 1, note: "Initial version" } });
  const p4 = await prisma.prompt.create({
    data: {
      userId: demo.id,
      collectionId: engineering.id,
      title: "SQL query generator",
      description: "Turn natural language into SQL.",
      content:
        "Given the following database schema, write a SQL query that answers the user's question.\n\nSchema:\n{{schema}}\n\nQuestion: {{question}}\n\nReturn only the SQL query, no explanation.",
      model: "gpt-4o",
      tags: '["data","sql"]',
      variables: JSON.stringify(["schema", "question"]),
    },
  });
  await prisma.promptVersion.create({ data: { promptId: p4.id, content: p4.content, version: 1, note: "Initial version" } });

  // Sample runs for the demo user
  for (const p of [p1, p2, p3]) {
    await prisma.run.create({
      data: {
        promptId: p.id,
        userId: demo.id,
        input: "Sample input for " + p.title,
        output: "Generated completion output for " + p.title + ".",
        model: p.model,
        tokensIn: 42,
        tokensOut: 128,
        latencyMs: 320,
        status: "SUCCESS",
      },
    });
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demo.id,
        type: "welcome",
        title: "Welcome to PromptForge",
        message: "Your workspace is ready. Create your first prompt to get started.",
      },
      {
        userId: demo.id,
        type: "plan",
        title: "You're on the Pro plan",
        message: "Enjoy 5,000 runs per month and the AI prompt optimizer.",
        read: true,
      },
      {
        userId: admin.id,
        type: "system",
        title: "Admin access enabled",
        message: "You have administrator privileges across the platform.",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("  Admin:  admin@promptforge.dev / Admin1234");
  console.log("  Pro:    demo@promptforge.dev / Demo1234");
  console.log("  Free:   free@promptforge.dev / Free1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
