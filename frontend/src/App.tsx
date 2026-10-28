import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  GitCompareArrows,
  LoaderCircle,
  Play,
  RefreshCw,
  Sparkles,
  Terminal,
  TriangleAlert,
} from "lucide-react";

type Result = {
  ok: boolean;
  model: string;
  output?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  error?: string;
};

type Compare = {
  prompt: string;
  results: Result[];
  completed: number;
  failed: number;
};

const fmt = (n?: number) =>
  n == null ? "—" : n >= 1000 ? `${(n / 1000).toFixed(2)} s` : `${n} ms`;

export default function App() {
  const [prompt, setPrompt] = useState(
    "Explain what an API is in two sentences.",
  );
  const [model, setModel] = useState("gemini-3.8-flash");
  const [models, setModels] = useState(
    "gemini-3.8-flash\ngemini-3.8-pro",
  );
  const [mode, setMode] = useState<"run" | "compare">("run");
  const [result, setResult] = useState<Result | null>(null);
  const [comparison, setComparison] = useState<Compare | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState("Checking");

  async function check() {
    try {
      const response = await fetch("/health");
      setHealth(response.ok ? "Connected" : "Unavailable");
    } catch {
      setHealth("Unavailable");
    }
  }

  useEffect(() => {
    void check();
  }, []);

  async function submit() {
    if (!prompt.trim()) {
      setError("Enter a prompt first.");
      return;
    }

    const names = models
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter(Boolean);

    if (mode === "compare" && (names.length < 2 || names.length > 5)) {
      setError("Enter 2–5 model IDs.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    setComparison(null);

    try {
      const response = await fetch(
        mode === "run" ? "/api/benchmark" : "/api/benchmark/compare",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "run"
              ? {
                  prompt: prompt.trim(),
                  model: model.trim() || undefined,
                }
              : {
                  prompt: prompt.trim(),
                  models: names,
                },
          ),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || `Request failed (${response.status})`,
        );
      }

      if (mode === "run") {
        setResult(data);

        if (data.ok === false) {
          setError(data.error || "Model request failed");
        }
      } else {
        setComparison(data);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not reach backend.",
      );
    } finally {
      setBusy(false);
      void check();
    }
  }

  const rows = comparison?.results ?? [];
  const fastest = rows
    .filter((row) => row.ok && row.latencyMs != null)
    .reduce<number | undefined>(
      (best, row) =>
        best == null || row.latencyMs! < best ? row.latencyMs : best,
      undefined,
    );

  return (
    <div className="layout">
      <aside className="side">
        <div className="brand">
          <div className="logo">
            <FlaskConical />
          </div>
          <div>
            <b>LLM Testbench</b>
            <small>MODEL EVALUATION</small>
          </div>
        </div>

        <p className="navlabel">WORKSPACE</p>
        <div className="nav active">
          <Activity size={17} />
          Playground
        </div>
        <div className="nav">
          <GitCompareArrows size={17} />
          Model comparison
        </div>

        <div className="sidebottom">
          <div className="health">
            <Terminal size={16} />
            <b>Backend status</b>
            <p>
              <i
                className={
                  health === "Connected"
                    ? "green"
                    : health === "Unavailable"
                      ? "red"
                      : ""
                }
              />
              {health}
            </p>
            <button onClick={() => void check()}>
              <RefreshCw size={12} />
              Refresh status
            </button>
          </div>
          <small>
            Prompt experiments
            <br />
            and model benchmarking
          </small>
        </div>
      </aside>

      <main>
        <header>
          <span>
            Workspace　/　<strong>Playground</strong>
          </span>
          <span className="local">
            <i
              className={
                health === "Connected"
                  ? "green"
                  : health === "Unavailable"
                    ? "red"
                    : ""
              }
            />
            Local environment
          </span>
        </header>

        <section className="intro">
          <div className="eyebrow">
            <Sparkles size={14} />
            PROMPT ENGINEERING WORKSPACE
          </div>
          <h1>
            Test. Compare. <em>Understand.</em>
          </h1>
          <p>
            Run prompts against Gemini models and compare response quality,
            latency, and token usage.
          </p>
        </section>

        <div className="stats">
          <div>
            <span>◈</span>
            <small>Current mode</small>
            <b>{mode === "run" ? "Single run" : "Model comparison"}</b>
          </div>
          <div>
            <span>⌘</span>
            <small>Models selected</small>
            <b>
              {mode === "run"
                ? "1 model"
                : `${models.split(/[\n,]+/).filter((name) => name.trim()).length} models`}
            </b>
          </div>
          <div>
            <span>↗</span>
            <small>Latest run</small>
            <b>
              {result
                ? result.ok
                  ? "Completed"
                  : "Failed"
                : comparison
                  ? `${comparison.completed} completed`
                  : "Waiting to run"}
            </b>
          </div>
        </div>

        <div className="workgrid">
          <section className="panel">
            <div className="paneltitle">
              <div>
                <small>01 / INPUT</small>
                <h2>Prompt workspace</h2>
              </div>
              <span className="ready">● Ready</span>
            </div>

            <div className="tabs">
              <button
                className={mode === "run" ? "selected" : ""}
                onClick={() => {
                  setMode("run");
                  setError("");
                }}
              >
                <Play size={14} />
                Run prompt
              </button>
              <button
                className={mode === "compare" ? "selected" : ""}
                onClick={() => {
                  setMode("compare");
                  setError("");
                }}
              >
                <GitCompareArrows size={15} />
                Compare models
              </button>
            </div>

            <label>
              YOUR PROMPT <span>Required</span>
            </label>
            <textarea
              className="prompt"
              maxLength={20000}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Enter a prompt to test…"
            />
            <div className="meta">
              <span>Use the same prompt to make comparisons fair.</span>
              <span>{prompt.length.toLocaleString()} / 20,000</span>
            </div>

            {mode === "run" ? (
              <div className="field">
                <label>MODEL ID</label>
                <input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Enter an available Gemini model ID"
                />
                <small>Use a model enabled for your API key.</small>
              </div>
            ) : (
              <div className="field">
                <label>
                  MODEL IDS <span>2–5 models</span>
                </label>
                <textarea
                  className="models"
                  value={models}
                  onChange={(event) => setModels(event.target.value)}
                  rows={3}
                />
                <small>One model ID per line, or separate with commas.</small>
              </div>
            )}

            {error && (
              <div className="error">
                <TriangleAlert size={16} />
                {error}
              </div>
            )}

            <div className="actions">
              <span>
                <Activity size={14} />
                Sent to your local backend
              </span>
              <button
                className="run"
                disabled={busy}
                onClick={() => void submit()}
              >
                {busy ? (
                  <>
                    <LoaderCircle className="spin" size={15} />
                    Running…
                  </>
                ) : (
                  <>
                    {mode === "run" ? (
                      <Play size={14} />
                    ) : (
                      <GitCompareArrows size={15} />
                    )}
                    {mode === "run" ? "Run benchmark" : "Compare models"}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="panel guide">
            <div className="paneltitle">
              <div>
                <small>QUICK GUIDE</small>
                <h2>How it works</h2>
              </div>
              <Sparkles color="#aa9cff" />
            </div>

            {[
              "Write your prompt|Use the same prompt to make comparisons fair.",
              "Choose your models|Run one model or compare two to five IDs.",
              "Review the metrics|Inspect output, latency, and token usage.",
            ].map((item, index) => (
              <div className="step" key={item}>
                <span>{index + 1}</span>
                <div>
                  <b>{item.split("|")[0]}</b>
                  <p>{item.split("|")[1]}</p>
                </div>
              </div>
            ))}

            <div className="tip">
              ✦　Tip: Use short, repeatable prompts when comparing latency.
            </div>
          </section>
        </div>

        <section className="panel results">
          <div className="paneltitle">
            <div>
              <small>02 / OUTPUT</small>
              <h2>Benchmark results</h2>
              <p>Responses and performance metrics from your latest run.</p>
            </div>
            {(result || comparison) && (
              <button
                className="clear"
                onClick={() => {
                  setResult(null);
                  setComparison(null);
                  setError("");
                }}
              >
                <RefreshCw size={13} />
                Clear results
              </button>
            )}
          </div>

          {busy ? (
            <div className="empty">
              <LoaderCircle className="spin" size={24} />
              Waiting for model responses…
            </div>
          ) : !result && !comparison ? (
            <div className="empty">
              <Terminal size={25} />
              <b>Your results will appear here</b>
              <p>
                Run a prompt or compare models to see responses and performance
                metrics.
              </p>
            </div>
          ) : null}

          {result && (
            <div className="result">
              <div className="resulthead">
                <b>
                  <i className={result.ok ? "green" : "red"} />
                  {result.model}
                </b>
                <span className={result.ok ? "ok" : "fail"}>
                  {result.ok ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <TriangleAlert size={14} />
                  )}
                  {result.ok ? "Success" : "Failed"}
                </span>
              </div>

              {result.output && (
                <div className="output">
                  <small>MODEL RESPONSE</small>
                  <p>{result.output}</p>
                </div>
              )}
              {result.error && <div className="error">{result.error}</div>}

              <div className="metrics">
                {[
                  ["Latency", fmt(result.latencyMs)],
                  ["Input tokens", result.inputTokens?.toLocaleString() ?? "—"],
                  ["Output tokens", result.outputTokens?.toLocaleString() ?? "—"],
                  ["Total tokens", result.totalTokens?.toLocaleString() ?? "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
            </div>
          )}

          {comparison && (
            <>
              <div className="summary">
                <b>
                  {comparison.completed} <small>completed</small>
                </b>
                <b>
                  {comparison.failed} <small>failed</small>
                </b>
                <b>
                  {fmt(fastest)} <small>fastest response</small>
                </b>
              </div>

              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>MODEL</th>
                      <th>STATUS</th>
                      <th>LATENCY</th>
                      <th>INPUT</th>
                      <th>OUTPUT</th>
                      <th>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.model + index}>
                        <td>{row.model}</td>
                        <td className={row.ok ? "ok" : "fail"}>
                          {row.ok ? "Success" : "Failed"}
                        </td>
                        <td>
                          {fmt(row.latencyMs)}
                          {row.ok && row.latencyMs === fastest ? " ★" : ""}
                        </td>
                        <td>{row.inputTokens ?? "—"}</td>
                        <td>{row.outputTokens ?? "—"}</td>
                        <td>{row.totalTokens ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3>Model responses</h3>
              {rows.map((row, index) => (
                <div className="output" key={row.model + "out" + index}>
                  <b>{row.model}</b>
                  <p>{row.output || row.error || "No response returned."}</p>
                </div>
              ))}
            </>
          )}

          <div className="foot">
            <span>
              <i className="green" />
              Local benchmark session
            </span>
            <span>Metrics supplied by backend API</span>
          </div>
        </section>

        <footer>
          LLM Testbench / Gemini playground
          <span>Prototype dashboard</span>
        </footer>
      </main>
    </div>
  );
}
