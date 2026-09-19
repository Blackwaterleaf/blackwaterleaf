import { invokeLLM, listLLMModels } from "./_core/llm";
import { assertControlledGoal, validateAgentResult } from "./safety";

export type ControlledAgentResult = {
  summary: string;
  plan: string[];
  risks: string[];
  nextAction: string;
};

function parseContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(part => (typeof part === "string" ? part : (part as { text?: string })?.text ?? ""))
      .join("\n");
  }
  return "";
}

export async function runControlledAgent(input: { title: string; goal: string; signal?: AbortSignal }) {
  assertControlledGoal(`${input.title}\n${input.goal}`);
  const catalog = await listLLMModels();
  const preferred = catalog.data.find(model => model.id === "gpt-5-mini")?.id;

  const response = await invokeLLM({
    signal: input.signal,
    model: preferred,
    messages: [
      {
        role: "system",
        content:
          "You are the BlackWaterLeaf Studio controlled agent. You may analyze the user's goal and produce a plan, but you must not claim to have executed code, accessed files, used a network, or completed external actions. Return JSON only.",
      },
      {
        role: "user",
        content: `Task title: ${input.title}\nGoal: ${input.goal}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "controlled_agent_result",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            plan: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            nextAction: { type: "string" },
          },
          required: ["summary", "plan", "risks", "nextAction"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = parseContent(response.choices[0]?.message?.content);
  const parsed = JSON.parse(raw) as ControlledAgentResult;
  if (!parsed.summary || !Array.isArray(parsed.plan) || !Array.isArray(parsed.risks) || !parsed.nextAction) throw new Error("Agent returned an invalid controlled result");
  return validateAgentResult(parsed);
}
