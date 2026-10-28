
import { Router } from "express";
import {
  runBenchmark,
  compareModels
} from "../services/benchmark";

const router = Router();

router.post("/", async (req, res) => {
  const { prompt, model, maxOutputTokens } = req.body ?? {};

  if (
    typeof prompt !== "string" ||
    prompt.trim().length === 0
  ) {
    return res.status(400).json({
      error: "prompt must be a non-empty string"
    });
  }

  if (prompt.length > 20000) {
    return res.status(400).json({
      error: "prompt must be 20000 characters or fewer"
    });
  }

  if (
    model !== undefined &&
    (typeof model !== "string" || !model.trim())
  ) {
    return res.status(400).json({
      error: "model must be a non-empty string"
    });
  }

  try {
    const result = await runBenchmark({
      prompt: prompt.trim(),
      model:
        model ??
        process.env.DEFAULT_MODEL ??
        "gemini-3.8-flash",
      maxOutputTokens:
        Number.isInteger(maxOutputTokens) &&
        maxOutputTokens > 0
          ? Math.min(maxOutputTokens, 8192)
          : 1024
    });

    return res.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown model error";

    console.error("Benchmark failed:", message);

    return res.status(502).json({
      error: "Model request failed",
      details: message
    });
  }
});

router.post("/compare", async (req, res) => {
  const { prompt, models } = req.body ?? {};

  if (
    typeof prompt !== "string" ||
    prompt.trim().length === 0
  ) {
    return res.status(400).json({
      error: "prompt must be a non-empty string"
    });
  }

  if (
    !Array.isArray(models) ||
    models.length < 2 ||
    models.length > 5 ||
    !models.every(
      (model: unknown) =>
        typeof model === "string" &&
        model.trim().length > 0
    )
  ) {
    return res.status(400).json({
      error: "models must contain 2 to 5 model names"
    });
  }

  const results = await compareModels(
    prompt.trim(),
    models
  );

  return res.json({
    prompt: prompt.trim(),
    results,
    completed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length
  });
});

export default router;
