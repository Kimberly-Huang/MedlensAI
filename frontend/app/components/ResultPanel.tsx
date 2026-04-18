import { AnalyzeResponse } from "./types";

function verdictClass(verdict: AnalyzeResponse["verdict"]) {
  if (verdict === "SAFE") return "verdict-pill verdict-safe";
  if (verdict === "CAUTION") return "verdict-pill verdict-caution";
  return "verdict-pill verdict-risk";
}

function levelClass(level: "low" | "medium" | "high") {
  if (level === "low") return "tag tag-low";
  if (level === "medium") return "tag tag-medium";
  return "tag tag-high";
}

export default function ResultPanel({ result }: { result: AnalyzeResponse | null }) {
  if (!result) {
    return (
      <div className="card empty-state">
        <h2>Analysis result</h2>
        <p className="muted">Run an analysis to see a structured healthcare risk summary, source cards, and personalized notes.</p>
      </div>
    );
  }

  return (
    <div className="result-layout">
      <div className="card span-2">
        <div className="result-header">
          <div>
            <p className="section-kicker">Assessment</p>
            <h2>MedLens decision</h2>
            <div className={verdictClass(result.verdict)}>{result.verdict}</div>
          </div>
          <div className="metrics">
            <div className="metric-box"><span className="muted">Risk score</span><strong>{result.risk_score}</strong></div>
            <div className="metric-box"><span className="muted">Confidence</span><strong>{result.confidence}%</strong></div>
          </div>
        </div>
        <div className="callout">
          <strong>Summary</strong>
          <p>{result.short_summary}</p>
        </div>
        <div className="callout soft">
          <strong>Personalized note</strong>
          <p>{result.personalized_note}</p>
        </div>
      </div>

      <div className="card">
        <p className="section-kicker">Risk flags</p>
        <h3>What drove the score</h3>
        <div className="stack-list">
          {result.risk_flags.map((flag) => (
            <div className="info-row" key={flag.title}>
              <div className={levelClass(flag.severity)}>{flag.severity}</div>
              <div>
                <strong>{flag.title}</strong>
                <p className="muted">{flag.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="section-kicker">Evidence framing</p>
        <h3>How the claim was interpreted</h3>
        <div className="stack-list">
          {result.evidence_notes.map((note) => (
            <div className="info-row" key={note.label}>
              <div className={levelClass(note.strength)}>{note.strength}</div>
              <div>
                <strong>{note.label}</strong>
                <p className="muted">{note.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card span-2">
        <p className="section-kicker">Suggested next steps</p>
        <h3>Recommended follow-up</h3>
        <ul className="clean-list">
          {result.suggested_next_steps.map((step) => <li key={step}>{step}</li>)}
        </ul>
      </div>

      <div className="card span-2">
        <p className="section-kicker">Sources</p>
        <h3>Live evidence and reference links</h3>
        {result.sources.length === 0 ? (
          <p className="muted">No live sources were returned. Add API keys to enable Tavily and PubMed enrichment.</p>
        ) : (
          <div className="source-grid">
            {result.sources.map((source) => (
              <a className="source-card" href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <div className="source-type">{source.source_type}</div>
                <strong>{source.title}</strong>
                <p className="muted">{source.summary}</p>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="card span-2">
        <p className="section-kicker">Regulatory checks</p>
        <h3>Recall and enforcement signals</h3>
        {result.recall_signals.length === 0 ? (
          <p className="muted">No openFDA food recall signals were returned for this query.</p>
        ) : (
          <div className="stack-list">
            {result.recall_signals.map((signal) => (
              <div className="info-row" key={signal.title + signal.status}>
                <div className="tag tag-medium">{signal.status}</div>
                <div>
                  <strong>{signal.title}</strong>
                  <p className="muted">{signal.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
