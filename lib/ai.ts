import { renderTemplate } from "@/lib/utils";

/**
 * Deterministic local completion engine.
 *
 * When no OPENAI_API_KEY is configured, we use a deterministic local generator
 * so the playground, runs, and AI optimizer are fully functional end-to-end
 * without an external service. When OPENAI_API_KEY is set, the real OpenAI
 * Chat Completions API is used instead.
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type CompletionResult = {
  output: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
};

function estimateTokens(text: string) {
  return Math.max(1, Math.round(text.length / 4));
}

function localComplete(messages: ChatMessage[]): CompletionResult {
  const start = Date.now();
  const userMsg = [...messages].reverse().find((m) => m.role === "user");
  const systemMsg = messages.find((m) => m.role === "system");
  const input = userMsg?.content ?? "";
  const system = systemMsg?.content ?? "";

  // Build a deterministic but useful "completion" based on the prompt structure.
  const lines: string[] = [];
  lines.push(`## Completion (local engine — model simulation)`);
  lines.push("");
  if (system) {
    lines.push(`> Acting as: ${system.split("\n")[0].slice(0, 120)}`);
    lines.push("");
  }
  lines.push("Here is a structured response based on your prompt:");
  lines.push("");
  // Echo and expand on detected variables / questions.
  const sentences = input
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  sentences.forEach((s, i) => {
    lines.push(`${i + 1}. **${s.slice(0, 90)}${s.length > 90 ? "…" : ""}**`);
    lines.push(`   - Considered relevant context, constraints and expected output format.`);
  });
  if (sentences.length === 0) {
    lines.push("1. **Acknowledged** — the request was processed.");
  }
  lines.push("");
  lines.push("### Notes");
  lines.push("- Add `OPENAI_API_KEY` to `.env` to use real model completions.");
  lines.push("- Tokens, latency and run history are recorded for every execution.");

  const output = lines.join("\n");
  return {
    output,
    tokensIn: estimateTokens(input + system),
    tokensOut: estimateTokens(output),
    latencyMs: Date.now() - start,
  };
}

async function openAIComplete(
  messages: ChatMessage[],
  model: string
): Promise<CompletionResult> {
  const start = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const output = data.choices?.[0]?.message?.content ?? "";
  return {
    output,
    tokensIn: data.usage?.prompt_tokens ?? estimateTokens(messages.map((m) => m.content).join("")),
    tokensOut: data.usage?.completion_tokens ?? estimateTokens(output),
    latencyMs: Date.now() - start,
  };
}

export async function complete(
  promptContent: string,
  variables: Record<string, string>,
  model: string
): Promise<CompletionResult> {
  const rendered = renderTemplate(promptContent, variables);
  const messages: ChatMessage[] = [
    { role: "user", content: rendered },
  ];
  if (process.env.OPENAI_API_KEY) {
    try {
      return await openAIComplete(messages, model);
    } catch (err) {
      // Fall back to local engine if the API call fails (e.g. invalid key, quota).
      console.error("OpenAI completion failed, falling back to local engine:", err);
      return localComplete(messages);
    }
  }
  return localComplete(messages);
}

/**
 * AI prompt optimizer. Rewrites/improves a prompt using best practices.
 * Uses the local engine unless OPENAI_API_KEY is configured.
 */
export async function optimizePrompt(content: string): Promise<string> {
  const system =
    "You are a prompt engineering expert. Rewrite the user's prompt to be clearer, more specific, and more effective. Use best practices: clear role, context, constraints, output format. Preserve all {{variables}}. Return only the improved prompt.";
  const user = `Original prompt:\n\n${content}`;
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const out = data.choices?.[0]?.message?.content;
        if (out) return out.trim();
      }
    } catch {
      // fall through to local
    }
  }

  // Local deterministic optimizer
  const vars = [...content.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]);
  const parts: string[] = [];
  parts.push("# Improved Prompt");
  parts.push("");
  parts.push("## Role");
  parts.push("You are an expert assistant specialized in this task.");
  parts.push("");
  parts.push("## Context");
  parts.push("The user needs a precise, well-structured response.");
  parts.push("");
  parts.push("## Task");
  parts.push(content.trim());
  parts.push("");
  parts.push("## Constraints");
  parts.push("- Be specific and avoid ambiguity.");
  parts.push("- Structure the output with headings or lists where helpful.");
  parts.push("- Do not fabricate facts; state assumptions explicitly.");
  if (vars.length) {
    parts.push("");
    parts.push("## Inputs");
    vars.forEach((v) => parts.push(`- {{${v}}}`));
  }
  parts.push("");
  parts.push("## Output format");
  parts.push("Return a clear, well-organized response.");
  return parts.join("\n");
}
