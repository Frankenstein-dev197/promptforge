import { prisma } from "@/lib/prisma";
import { getPromptLibraryTemplate, PROMPT_LIBRARY, type PromptLibraryTemplate } from "@/lib/prompt-library";

export type PromptTemplateView = PromptLibraryTemplate & {
  id: string;
  featured: boolean;
};

function fromDatabase(template: {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  content: string;
  model: string;
  tags: string;
  featured: boolean;
}): PromptTemplateView {
  return {
    id: template.id,
    slug: template.slug,
    category: template.category,
    title: template.title,
    description: template.description,
    content: template.content,
    model: template.model,
    tags: JSON.parse(template.tags) as string[],
    featured: template.featured,
  };
}

function fromStatic(template: PromptLibraryTemplate, index: number): PromptTemplateView {
  return { ...template, id: `static-${template.slug}`, featured: index < 4 };
}

export async function listPromptTemplates(filters?: { query?: string; category?: string; featured?: boolean }): Promise<PromptTemplateView[]> {
  const query = filters?.query?.trim();
  const category = filters?.category;
  const where = {
    ...(category && category !== "all" ? { category } : {}),
    ...(filters?.featured ? { featured: true } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { content: { contains: query } },
            { tags: { contains: query } },
          ],
        }
      : {}),
  };

  try {
    const templates = await prisma.promptTemplate.findMany({
      where,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    });
    if (templates.length > 0) return templates.map(fromDatabase);
  } catch {
    // The static catalog keeps the page useful before the first database seed.
  }

  return PROMPT_LIBRARY.map(fromStatic).filter((template) => {
    if (category && category !== "all" && template.category !== category) return false;
    if (filters?.featured && !template.featured) return false;
    if (!query) return true;
    const haystack = `${template.title} ${template.description} ${template.content} ${template.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
}

export async function getPromptTemplateBySlug(slug: string): Promise<PromptTemplateView | undefined> {
  try {
    const template = await prisma.promptTemplate.findUnique({ where: { slug } });
    if (template) return fromDatabase(template);
  } catch {
    // Fall back to the source catalog when the database has not been migrated.
  }
  const staticTemplate = getPromptLibraryTemplate(slug);
  if (!staticTemplate) return undefined;
  const index = PROMPT_LIBRARY.findIndex((template) => template.slug === slug);
  return fromStatic(staticTemplate, index);
}
