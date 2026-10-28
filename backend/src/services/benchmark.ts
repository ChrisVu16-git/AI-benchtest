
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || "missing-key",
  baseURL:
    "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export interface BenchmarkOptions {
  prompt: string;
  model?: string;
  maxOutputTokens?: number;
}

export interface BenchmarkResult {
  ok: boolean;
  model: string;
  output?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  error?: string;
}

export async function runBenchmark({
  prompt,
  model,
  maxOutputTokens = 1024,
}: BenchmarkOptions): Promise<BenchmarkResult> {
  const selectedModel =
    model || process.env.DEFAULT_MODEL || "gemini-3.8-flash";

  if (!process.env.GEMINI_API_KEY) {
    return {
      ok: false,
      model: selectedModel,
      error: "GEMINI_API_KEY is missing from your .env file",
    };
  }

  const start = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: selectedModel,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxOutputTokens,
    });

    const usage = response.usage;

    return {
      ok: true,
      model: selectedModel,
      output: response.choices[0]?.message?.content ?? "",
      latencyMs: Date.now() - start,
      inputTokens: usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
    };
  } catch (error) {
    return {
      ok: false,
      model: selectedModel,
      latencyMs: Date.now() - start,
      error:
        error instanceof Error
          ? error.message
          : "Unknown model error",
    };
  }
}

export async function compareModels(
  prompt: string,
  models: string[]
): Promise<BenchmarkResult[]> {
  return Promise.all(
    models.map((model) => runBenchmark({ prompt, model }))
  );
}
