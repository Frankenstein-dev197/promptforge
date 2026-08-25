import Link from "next/link";
import { BookOpen, Search, Sparkles, ArrowRight, Layers3 } from "lucide-react";
import { listPromptTemplates } from "@/lib/prompt-library-service";
import { importPromptTemplateAction } from "@/lib/actions/prompts";
import { parseVariables } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Template library" };

type SearchParams = Promise<{ q?: string; category?: string; featured?: string }>;

export default async function LibraryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const category = params.category || "all";
  const featured = params.featured === "true";
  const [templates, allTemplates] = await Promise.all([
    listPromptTemplates({ query, category, featured }),
    listPromptTemplates(),
  ]);
  const categories = Array.from(new Set(allTemplates.map((template) => template.category))).sort();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <BookOpen className="h-4 w-4" /> PromptForge library
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Start with a proven prompt</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Explore ready-to-use prompt patterns, inspect their variables, and import a copy into your private workspace.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/prompts/new"><Sparkles className="h-4 w-4" /> Build from scratch</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={query} placeholder="Search templates by use case, title, or tag..." className="pl-9" />
            </div>
            <input type="hidden" name="category" value={category} />
            <Button type="submit" variant="default">Search library</Button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant={category === "all" && !featured ? "default" : "outline"}>
              <Link href={query ? `/library?q=${encodeURIComponent(query)}` : "/library"}>All templates</Link>
            </Button>
            <Button asChild size="sm" variant={featured ? "default" : "outline"}>
              <Link href={query ? `/library?q=${encodeURIComponent(query)}&featured=true` : "/library?featured=true"}>Featured</Link>
            </Button>
            {categories.map((item) => {
              const href = `/library?category=${encodeURIComponent(item)}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
              return (
                <Button key={item} asChild size="sm" variant={category === item && !featured ? "default" : "outline"}>
                  <Link href={href}>{item}</Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{templates.length} template{templates.length === 1 ? "" : "s"} available</span>
        <span className="flex items-center gap-1.5"><Layers3 className="h-4 w-4" /> Every import creates a private copy</span>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No templates found"
          description="Try another search term or reset the category filter."
          action={<Button asChild variant="outline"><Link href="/library">Reset filters</Link></Button>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const variables = parseVariables(template.content);
            return (
              <Card key={template.slug} className="flex h-full flex-col border-border/70 transition-colors hover:border-primary/40">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant={template.featured ? "default" : "secondary"}>{template.category}</Badge>
                    <span className="text-xs text-muted-foreground">{template.model}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                  <div className="rounded-lg bg-muted/40 p-3 font-mono text-xs leading-5 text-muted-foreground">
                    {template.content.length > 180 ? `${template.content.slice(0, 180)}…` : template.content}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map((variable) => <Badge key={variable} variant="outline" className="font-mono text-[10px]">{`{{${variable}}}`}</Badge>)}
                    {template.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>)}
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <form action={importPromptTemplateAction.bind(null, template.slug)} className="flex-1">
                      <Button type="submit" variant="gradient" className="w-full"><ArrowRight className="h-4 w-4" /> Use template</Button>
                    </form>
                    <Button asChild variant="ghost" size="icon" aria-label={`Open ${template.title}`}>
                      <Link href={`/prompts/new?template=${encodeURIComponent(template.slug)}`}><BookOpen className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
